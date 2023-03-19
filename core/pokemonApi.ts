import axios from "axios";

export interface IPokemonListItem {
    name: string;
    url: string;
}
export interface IPokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<IPokemonListItem>;
}

export async function getPokemonList(
    offset: number,
    limit: number
): Promise<IPokemonListResponse> {
    const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`
    );

    return response.data;
}
