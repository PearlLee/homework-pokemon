import { IRecoilStates, pokemonList } from "@/core/state";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MutableSnapshot, RecoilRoot } from "recoil";

const initRecoilState =
    (recoilStates?: IRecoilStates) =>
    ({ set }: MutableSnapshot) => {
        if (recoilStates === undefined) return;

        if (recoilStates.pokemonFirstList !== undefined) {
            set(pokemonList(0), recoilStates.pokemonFirstList);
        }
    };

export default function App({ Component, pageProps }: AppProps) {
    return (
        <RecoilRoot initializeState={initRecoilState(pageProps.recoilStates)}>
            <Component {...pageProps} />
        </RecoilRoot>
    );
}
