import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.scss";
import { useRecoilCallback, useRecoilValueLoadable } from "recoil";
import {
    IRecoilStates,
    PAGE_SIZE,
    pokemonListPage,
    pokemonListSelector,
} from "@/core/state";
import { getPokemonList } from "@/core/pokemonApi";
import Link from "next/link";
import { getLastPath } from "@/core/util";

const inter = Inter({ subsets: ["latin"] });

function PokemonList() {
    const list = useRecoilValueLoadable(pokemonListSelector);

    switch (list.state) {
        case "hasValue":
            return (
                <>
                    {list.contents.results.map((element) => {
                        const pokemonNo = parseInt(getLastPath(element.url));
                        return (
                            <div key={element.name}>
                                <Link href={element.name}>
                                    <picture>
                                        <img
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNo}.png`}
                                            onError={(e) =>
                                                (e.currentTarget.style.display =
                                                    "none")
                                            }
                                            alt={element.name}
                                        />
                                    </picture>
                                    <dl>
                                        <dt className="blind">포켓몬 이름</dt>
                                        <dd>{element.name}</dd>
                                    </dl>
                                </Link>
                            </div>
                        );
                    })}
                    {list.contents.isLoading && <div>Loading...</div>}
                </>
            );
        case "loading":
            return <>loading</>;
        case "hasError":
            return <>error</>;
    }
}

export default function Home() {
    const nextPage = useRecoilCallback(({ set }) => () => {
        set(pokemonListPage, (oldValue) => oldValue + 1);
    });

    return (
        <>
            <Head>
                <title>포켓몬 도감</title>
                <meta name="description" content="포켓몬 도감" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <main className={styles.main}>
                <h1>포켓몬 목록</h1>
                <section className={styles.containerList}>
                    <PokemonList />
                </section>

                <button onClick={() => nextPage()}>다음페이지</button>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    try {
        const pokemonFirstList = await getPokemonList(0, PAGE_SIZE);
        const recoilStates: IRecoilStates = {
            pokemonFirstList,
        };

        return {
            props: {
                recoilStates,
            },
        };
    } catch (error) {
        // 서버에서 오류난 경우 props을 빈값으로 보내서 클라이언트에서 다시 시도하게 함
        return { props: {} };
    }
}
