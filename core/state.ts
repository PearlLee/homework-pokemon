import {
    atom,
    atomFamily,
    noWait,
    selector,
    selectorFamily,
    waitForAll,
} from "recoil";
import {
    getPokemonDetail,
    getPokemonEvolutionChain,
    getPokemonList,
    getPokemonSpecies,
    IPokemonDetailResponse,
    IPokemonEvolutionChainResponse,
    IPokemonListItem,
    IPokemonListResponse,
    IPokemonSpeciesResponse,
} from "./pokemonApi";
import { getLastPath } from "./util";

export const PAGE_SIZE = 100;

export interface IRecoilStates {
    pokemonFirstList?: IPokemonListResponse;
    pokemonDetail?: IPokemonDetailResponse;
    pokemonSpecies?: IPokemonSpeciesResponse;
    pokemonEvolutionChain?: IPokemonEvolutionChainResponse;
}

export const pokemonList = atomFamily<IPokemonListResponse, number>({
    key: "pokemonList",
    default: (page: number) => getPokemonList(PAGE_SIZE * page, PAGE_SIZE),
});

export const pokemonListPage = atom<number>({
    key: "pokemonListPage",
    default: 0,
});

export interface IPokemonList {
    results: IPokemonListItem[];
    isLoading: boolean;
}

export const pokemonListSelector = selector<IPokemonList>({
    key: "pokemonListSelector",
    get: ({ get }) => {
        let results: IPokemonListItem[] = [];

        const page = get(pokemonListPage);

        for (let i = 0; i <= page; i++) {
            let list = get(noWait(pokemonList(i)));

            switch (list.state) {
                case "hasValue":
                    results.push(...list.contents.results);
                    break;
                case "loading":
                    return {
                        results,
                        isLoading: true,
                    };
                case "hasError":
                    throw list.errorMaybe();
            }
        }

        return {
            results,
            isLoading: false,
        };
    },
});

export const pokemonDetail = atomFamily<IPokemonDetailResponse, string>({
    key: "pokemonDetail",
    default: (name: string) => getPokemonDetail(name),
});

export const pokemonSpecies = atomFamily<IPokemonSpeciesResponse, string>({
    key: "pokemonSpecies",
    default: (name: string) => getPokemonSpecies(name),
});

export const pokemonEvolutionChain = atomFamily<
    IPokemonEvolutionChainResponse,
    number
>({
    key: "pokemonEvolutionChain",
    default: (id: number) => getPokemonEvolutionChain(id),
});

interface IPokemonSelector {
    detail: IPokemonDetailResponse;
    species: IPokemonSpeciesResponse;
    evolutionChain: IPokemonEvolutionChainResponse;
}

export const pokemonSelector = selectorFamily<IPokemonSelector, string>({
    key: "pokemonSelector",
    get:
        (name: string) =>
        ({ get }) => {
            const detail = get(pokemonDetail(name));
            const species = get(pokemonSpecies(detail.species.name));

            const evolutionChainId = parseInt(
                getLastPath(species.evolution_chain.url)
            );
            const evolutionChain = get(pokemonEvolutionChain(evolutionChainId));

            return { detail, species, evolutionChain };
        },
});
