import { fetchRandomFlag, fetchFlagDetails } from './flags';

export interface ScrambledFlagData {
    id: number;
    name: string;
    svg: string;
    regionIds: string[];
    shuffledColors: Record<string, string>;
    correctColors: Record<string, string>;
}

const extractRegionIds = (svgString: string): string[] => {
    const regex = /var\(\s*--([^,\s)]+)/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(svgString)) !== null) {
        matches.add(match[1]);
    }
    return Array.from(matches).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });
};

const parseHexColor = (rawColor: unknown): string => {
    if (!rawColor) return '#404040';

    if (typeof rawColor === 'string') {
        const trimmed = rawColor.trim();
        return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    }

    if (typeof rawColor === 'object' && rawColor !== null) {
        const colorObj = rawColor as Record<string, unknown>;
        const hexVal = colorObj.hex || colorObj.color || colorObj.value || colorObj.code;
        if (typeof hexVal === 'string') {
            const trimmed = hexVal.trim();
            return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
        }
    }

    return '#404040';
};

// Resolves region color whether response is an array of objects/strings or a dictionary object.
const resolveRegionColor = (
    colorsPayload: unknown,
    regionId: string,
    index: number
): string => {
    if (!colorsPayload) return '#404040';

    // If payload is a dictionary keyed by regionId ({ "1": "#FF0000" })
    if (typeof colorsPayload === 'object' && !Array.isArray(colorsPayload)) {
        const dict = colorsPayload as Record<string, unknown>;
        if (dict[regionId] !== undefined) {
            return parseHexColor(dict[regionId]);
        }
    }

    // If payload is an array
    if (Array.isArray(colorsPayload)) {
        const item = colorsPayload[index % colorsPayload.length];
        return parseHexColor(item);
    }

    return '#404040';
};

export const fetchScrambledFlag = async (): Promise<ScrambledFlagData> => {
    const thinFlag = await fetchRandomFlag({ minColorCount: 3 });
    const fullFlag = await fetchFlagDetails(thinFlag.id);
    const regionIds = extractRegionIds(thinFlag.svg);

    // Extract correct colors from fullFlag details
    const rawColorsPayload = fullFlag.colors || fullFlag.desaturatedColors;
    const correctColors: Record<string, string> = {};

    regionIds.forEach((regionId, idx) => {
        correctColors[regionId] = resolveRegionColor(rawColorsPayload, regionId, idx);
    });

    const colorList = regionIds.map((id) => correctColors[id]);

    // Shuffle tile assignments
    let shuffledList = [...colorList].sort(() => Math.random() - 0.5);
    if (shuffledList.length > 1 && shuffledList.every((col, idx) => col === colorList[idx])) {
        shuffledList = shuffledList.reverse();
    }

    const shuffledColors: Record<string, string> = {};
    regionIds.forEach((regionId, idx) => {
        shuffledColors[regionId] = shuffledList[idx];
    });

    return {
        id: thinFlag.id,
        name: thinFlag.name,
        svg: thinFlag.svg,
        regionIds,
        shuffledColors,
        correctColors,
    };
};