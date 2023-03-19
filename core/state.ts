import { atom, atomFamily, noWait, selector } from "recoil";
import {
    getPokemonList,
    IPokemonListItem,
    IPokemonListResponse,
} from "./pokemonApi";

export const PAGE_SIZE = 100;

export interface IRecoilStates {
    pokemonFirstList?: IPokemonListResponse;
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
