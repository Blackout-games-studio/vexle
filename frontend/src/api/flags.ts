export interface FlagThinDto {
    id: number;
    tags: string[];
    svg: string;
    desaturatedColors: string[];
    name: string;
    country: string;
}

export interface FlagDto {
    id: number;
    name: string;
    tags: string[];
    country: string;
    svg: string;
    desaturatedColors: string[];
    colors: string[]; // Correct color for each region index
}

export interface RegionValidationResult {
    regionId: string;
    userColor: string;
    correctColor: string;
    isMatch: boolean;
}

export interface FlagCreateDto {
    name: string;
    country: string;
    svg: string;
    tags: string[];
    colors: string[];
    desaturatedColors: string[];
}

export interface FlagFilterParams {
    tags?: string[];
    colorCount?: number;
    minColorCount?: number;
    maxColorCount?: number;
}

const BASE_URL = 'http://localhost:8080/api/flags';

export async function fetchDailyFlag(): Promise<FlagThinDto> {
    const response = await fetch(`${BASE_URL}/daily`);
    if (!response.ok) {
        throw new Error(`Failed to fetch daily flag: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchRandomFlag(params?: FlagFilterParams): Promise<FlagThinDto> {
    const searchParams = new URLSearchParams();

    if (params) {
        if (params.tags && params.tags.length > 0) {
            params.tags.forEach(tag => searchParams.append('tags', tag));
        }
        if (params.colorCount !== undefined) {
            searchParams.append('colorCount', params.colorCount.toString());
        }
        if (params.minColorCount !== undefined) {
            searchParams.append('minColorCount', params.minColorCount.toString());
        }
        if (params.maxColorCount !== undefined) {
            searchParams.append('maxColorCount', params.maxColorCount.toString());
        }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${BASE_URL}/random?${queryString}` : `${BASE_URL}/random`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch random flag: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchFlagDetails(id: number): Promise<FlagDto> {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch flag validation details: ${response.statusText}`);
    }
    return response.json();
}

export const createFlag = async (flagData: FlagCreateDto): Promise<void> => {
    const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flagData),
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to create flag');
    }
};