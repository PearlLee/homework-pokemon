import Head from "next/head";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { IRecoilStates, pokemonSelector } from "@/core/state";
import { useRecoilValueLoadable } from "recoil";
import {
    getPokemonDetail,
    getPokemonEvolutionChain,
    getPokemonSpecies,
    IPokemonSpeciesResponse,
} from "@/core/pokemonApi";
import { GetServerSideProps } from "next";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

function getKoreanName(species: IPokemonSpeciesResponse): string | undefined {
    let ko = species.names.find((x) => x.language.name === "ko");
    if (ko === undefined) {
        return undefined;
    }

    return ko.name;
}
function Detail({ pokemonName }: { pokemonName: string }) {
    const data = useRecoilValueLoadable(pokemonSelector(pokemonName));

    switch (data.state) {
        case "hasValue":
            const contents = data.contents;
            return (
                <>
                    {getKoreanName(contents.species) || contents.detail.name}
                    {contents.evolutionChain.id}
                    <picture>
                        <img
                            src={contents.detail.sprites.front_default}
                            alt={contents.detail.name}
                        />
                    </picture>
                </>
            );
        case "loading":
            return <>loading</>;
        case "hasError":
            return <>error</>;
    }
}

export default function PokemonDetail() {
    const router = useRouter();
    let { pokemonName } = router.query;

    if (pokemonName === undefined) {
        return <div>포켓몬 이름이 없습니다</div>;
    } else if (Array.isArray(pokemonName)) {
        pokemonName = pokemonName[0];
    }
    return <Detail pokemonName={pokemonName} />;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    if (params === undefined || params["pokemonName"] === undefined) {
        return {
            notFound: true,
        };
    }

    let pokemonName = params["pokemonName"];
    if (Array.isArray(pokemonName)) {
        pokemonName = pokemonName[0];
    }

    try {
        const pokemonDetail = await getPokemonDetail(pokemonName);
        const pokemonSpecies = await getPokemonSpecies(pokemonName);

        // TODO: evolution chain url 추출하는거 리팩토링 필요
        const urls = new URL(pokemonSpecies.evolution_chain.url).pathname
            .split("/")
            .filter((x) => x.length > 0);
        const evolutionChainId = parseInt(urls[urls.length - 1]);
        const pokemonEvolutionChain = await getPokemonEvolutionChain(
            evolutionChainId
        );

        const recoilStates: IRecoilStates = {
            pokemonDetail,
            pokemonSpecies,
            pokemonEvolutionChain,
        };
        return {
            props: { recoilStates },
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status == 404) {
            return {
                notFound: true,
            };
        }

        return { props: {} };
    }
};
