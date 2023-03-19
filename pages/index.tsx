import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRecoilCallback, useRecoilValueLoadable } from "recoil";
import {
    IRecoilStates,
    PAGE_SIZE,
    pokemonListPage,
    pokemonListSelector,
} from "@/core/state";
import { getPokemonList } from "@/core/pokemonApi";

const inter = Inter({ subsets: ["latin"] });

function PokemonList() {
    const list = useRecoilValueLoadable(pokemonListSelector);

    switch (list.state) {
        case "hasValue":
            return (
                <>
                    {list.contents.results.map((element) => (
                        <div key={element.name}>
                            {element.name} {element.url}
                        </div>
                    ))}
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
                <PokemonList />
                <button onClick={() => nextPage()}>다음페이지</button>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    const pokemonFirstList = await getPokemonList(0, PAGE_SIZE);
    const recoilStates: IRecoilStates = {
        pokemonFirstList,
    };

    return {
        props: {
            recoilStates,
        },
    };
}
