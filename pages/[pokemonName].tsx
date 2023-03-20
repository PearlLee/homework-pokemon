import Head from "next/head";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { IRecoilStates, pokemonSelector } from "@/core/state";
import { useRecoilValueLoadable } from "recoil";
import {
    getPokemonDetail,
    getPokemonEvolutionChain,
    getPokemonSpecies,
    IChainLink,
    IPokemonEvolutionChainResponse,
    IPokemonSpeciesResponse,
} from "@/core/pokemonApi";
import { GetServerSideProps } from "next";
import axios from "axios";
import { getLastPath } from "@/core/util";

const inter = Inter({ subsets: ["latin"] });

function getKoreanName(species: IPokemonSpeciesResponse): string | undefined {
    let ko = species.names.find((x) => x.language.name === "ko");
    if (ko === undefined) {
        return undefined;
    }

    return ko.name;
}

function getChains(
    chain: IChainLink,
    paths: string[][] = [],
    currentPath: string[] = []
) {
    currentPath.push(chain.species.name);

    if (chain.evolves_to.length == 0) {
        paths.push(currentPath);
    } else {
        chain.evolves_to.forEach((subChain) => {
            getChains(subChain, paths, [...currentPath]);
        });
    }

    return paths;
}
function EvolutionChain({
    name,
    evolutionChain,
}: {
    name: string;
    evolutionChain: IPokemonEvolutionChainResponse;
}) {
    let chains = getChains(evolutionChain.chain);

    return (
        <>
            {chains.map((chain) => (
                <ul key={chain.join("-")}>
                    {chain.map((element) => (
                        <li key={element}>
                            {name == element ? (
                                <b>{element}</b>
                            ) : (
                                <>{element}</>
                            )}
                        </li>
                    ))}
                </ul>
            ))}
        </>
    );
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

                    <EvolutionChain
                        name={contents.species.name}
                        evolutionChain={contents.evolutionChain}
                    />
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

        const evolutionChainId = parseInt(
            getLastPath(pokemonSpecies.evolution_chain.url)
        );
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
