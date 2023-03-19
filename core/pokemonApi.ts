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

export interface IPokemonDetailResponse {
    name: string;
    sprites: { front_default: string };
    stats: Array<{
        base_stat: number;
        effort: number;
        stat: {
            name: string;
            url: string;
        };
    }>;
    types: Array<{
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }>;
    spacies: {
        name: string;
        url: string;
    };
}

export async function getPokemonDetail(
    name: string
): Promise<IPokemonDetailResponse> {
    const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${name}`
    );

    return response.data;
}

export interface IPokemonSpeciesResponse {
    name: string;
    names: Array<{
        name: string;
        language: {
            name: string;
            url: string;
        };
    }>;
    evolution_chain: {
        url: string;
    };
}

export async function getPokemonSpecies(
    name: string
): Promise<IPokemonSpeciesResponse> {
    const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${name}`
    );

    return response.data;
}

export interface IChainLink {
    species: {
        name: string;
        url: string;
    };
    evolves_to: Array<IChainLink>;
}

export interface IPokemonEvolutionChainResponse {
    id: number;
    chain: IChainLink;
}

export async function getPokemonEvolutionChain(
    id: number
): Promise<IPokemonEvolutionChainResponse> {
    const response = await axios.get(
        `https://pokeapi.co/api/v2/evolution-chain/${id}`
    );

    return response.data;
}
