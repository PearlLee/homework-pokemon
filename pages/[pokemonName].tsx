import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Detail.module.scss";
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
import Link from "next/link";

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
                <ol key={chain.join("-")}>
                    {chain.map((element) => (
                        <li key={element}>
                            <Link href={element}>
                                {name == element ? (
                                    <strong>{element}</strong>
                                ) : (
                                    <>{element}</>
                                )}
                            </Link>
                        </li>
                    ))}
                </ol>
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
                <section className={styles.containerDetail}>
                    <div>
                        <picture>
                            <img
                                src={contents.detail.sprites.front_default}
                                onError={(e) =>
                                    (e.currentTarget.style.display = "none")
                                }
                                alt={contents.detail.name}
                            />
                        </picture>
                        <p>
                            {contents.detail.name} || 종{" "}
                            {getKoreanName(contents.species) ||
                                contents.species.name}
                        </p>
                        <dl className={styles.type}>
                            <dt>타입</dt>
                            {contents.detail.types.map((item) => (
                                <dd
                                    key={item.type.name}
                                    className={styles[item.type.name]}
                                >
                                    {item.type.name}
                                </dd>
                            ))}
                        </dl>
                        <dl className={styles.stat}>
                            <dt>스탯</dt>
                            {contents.detail.stats.map((item) => (
                                <dd key={item.stat.name}>
                                    {item.stat.name}: {item.base_stat}
                                </dd>
                            ))}
                        </dl>
                        <dl>
                            <dt>진화</dt>
                            <dd>
                                <EvolutionChain
                                    name={contents.species.name}
                                    evolutionChain={contents.evolutionChain}
                                />
                            </dd>
                        </dl>
                    </div>
                </section>
            );
        case "loading":
            return <>loading</>;
        case "hasError":
            return <>error</>;
    }
}

export default function PokemonPage() {
    const router = useRouter();
    let { pokemonName } = router.query;

    if (pokemonName === undefined) {
        return <div>포켓몬 이름이 없습니다</div>;
    } else if (Array.isArray(pokemonName)) {
        pokemonName = pokemonName[0];
    }
    return (
        <>
            <Head>
                <title>{pokemonName} - 포켓몬 도감</title>
                <meta
                    name="description"
                    content={pokemonName + "포켓몬 도감"}
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>

            <Link href="/" className={styles.buttonToList}>
                목록
            </Link>
            <Detail pokemonName={pokemonName} />
        </>
    );
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
        const pokemonSpecies = await getPokemonSpecies(
            pokemonDetail.species.name
        );

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
