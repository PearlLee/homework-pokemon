import {
    IRecoilStates,
    pokemonDetail,
    pokemonEvolutionChain,
    pokemonList,
    pokemonSpecies,
} from "@/core/state";
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

        if (recoilStates.pokemonDetail !== undefined) {
            set(
                pokemonDetail(recoilStates.pokemonDetail.name),
                recoilStates.pokemonDetail
            );
        }

        if (recoilStates.pokemonSpecies !== undefined) {
            set(
                pokemonSpecies(recoilStates.pokemonSpecies.name),
                recoilStates.pokemonSpecies
            );
        }

        if (recoilStates.pokemonEvolutionChain !== undefined) {
            set(
                pokemonEvolutionChain(recoilStates.pokemonEvolutionChain.id),
                recoilStates.pokemonEvolutionChain
            );
        }
    };

export default function App({ Component, pageProps }: AppProps) {
    return (
        <RecoilRoot initializeState={initRecoilState(pageProps.recoilStates)}>
            <Component {...pageProps} />
        </RecoilRoot>
    );
}
