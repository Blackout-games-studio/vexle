import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchRandomFlag, fetchFlagDetails, type FlagThinDto } from '../api/flags';
import { calculateDeltaEPercentage } from '../utils/colorUtils';
import type { CustomGameConfig } from '../types/customGame';
import type {EvaluatedRegion} from "./useMultiModeGame.ts";

export const DEFAULT_REGION_COLOR = '#404040';

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

export const useCustomGameMode = (config: CustomGameConfig | undefined) => {
    const [flag, setFlag] = useState<FlagThinDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [evaluation, setEvaluation] = useState<{
        regions: EvaluatedRegion[];
        overallScore: number;
        correctColorsMap: Record<string, string>;
    } | null>(null);

    const regionIds = useMemo(() => {
        return flag ? extractRegionIds(flag.svg) : [];
    }, [flag?.svg]);

    const loadNewGame = useCallback(async () => {
        if (!config) return;
        setLoading(true);
        setError(null);
        setEvaluation(null);

        try {
            const data = await fetchRandomFlag({
                tags: config.selectedTags,
                minColorCount: config.minColors,
                maxColorCount: config.maxColors,
            });

            const extractedRegions = extractRegionIds(data.svg);
            const initialColors: Record<string, string> = {};

            extractedRegions.forEach((regionId, index) => {
                if (config.mode === 'random') {
                    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                    initialColors[regionId] = randomColor;
                } else {
                    initialColors[regionId] = data.desaturatedColors?.[index] || DEFAULT_REGION_COLOR;
                }
            });

            setFlag(data);
            setSelectedColors(initialColors);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading custom game flag';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [config]);

    useEffect(() => {
        loadNewGame();
    }, [loadNewGame]);

    const updateColor = (regionId: string, color: string) => {
        setSelectedColors((prev) => ({
            ...prev,
            [regionId]: color,
        }));
    };

    const submitAnswer = async () => {
        if (!flag) return;
        setIsSubmitting(true);
        try {
            const fullFlag = await fetchFlagDetails(flag.id);
            const correctColorsMap: Record<string, string> = {};

            const regions: EvaluatedRegion[] = regionIds.map((regionId, index) => {
                const userColor = selectedColors[regionId] || '#000000';
                const correctColor = fullFlag.colors[index] || '#000000';
                correctColorsMap[regionId] = correctColor;

                const { deltaE, score } = calculateDeltaEPercentage(userColor, correctColor);
                return {
                    regionId,
                    userColor,
                    correctColor,
                    deltaE: Math.round(deltaE * 100) / 100,
                    scorePercentage: score,
                };
            });

            const totalScore = regions.reduce((acc, r) => acc + r.scorePercentage, 0);
            const overallScore = Math.round((totalScore / (regions.length || 1)) * 10) / 10;

            setEvaluation({
                regions,
                overallScore,
                correctColorsMap,
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error submitting custom answer';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        flag,
        loading,
        error,
        regionIds,
        selectedColors,
        isSubmitting,
        evaluation,
        loadNewGame,
        submitAnswer,
        updateColor,
    };
};