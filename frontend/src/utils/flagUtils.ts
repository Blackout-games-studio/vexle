// Maps region identifiers to CSS variable definitions.
export const buildCssVarMap = (colorMap: Record<string, string>): Record<string, string> => {
    return Object.entries(colorMap).reduce((acc, [regionId, color]) => {
        acc[`--${regionId}`] = color;
        return acc;
    }, {} as Record<string, string>);
};