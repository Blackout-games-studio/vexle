import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchRandomFlag, fetchFlagDetails, fetchDailyFlag, type FlagThinDto } from '../api/flags';
import { calculateDeltaEPercentage } from '../utils/colorUtils';
import {DEFAULT_REGION_COLOR} from "./useCustomGameMode.ts";

export type GameMode = 'regular' | 'daily' | 'hard' | 'random';

export interface EvaluatedRegion {
    regionId: string;
    userColor: string;
    correctColor: string;
    deltaE: number;
    scorePercentage: number;
}

export interface EvaluationData {
    regions: EvaluatedRegion[];
    overallScore: number;
    correctColorsMap: Record<string, string>;
}

interface StoredDailyPayload {
    date: string;
    evaluation: EvaluationData;
}

const DAILY_STORAGE_KEY = 'vexle_daily';

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

const generateRandomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

export const useMultiModeGame = (mode: "daily" | "regular" | "hard" | "random" | "scrambled") => {
    const [flag, setFlag] = useState<FlagThinDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);

    const regionIds = useMemo(() => (flag ? extractRegionIds(flag.svg) : []), [flag?.svg]);

    const loadNewGame = useCallback(async () => {
        setLoading(true);
        setError(null);
        setEvaluation(null);

        try {
            let data: FlagThinDto;

            if (mode === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                const rawStored = localStorage.getItem(DAILY_STORAGE_KEY);

                data = await fetchDailyFlag();
                setFlag(data);

                if (rawStored) {
                    try {
                        const parsed: StoredDailyPayload = JSON.parse(rawStored);
                        if (parsed.date === today && parsed.evaluation) {
                            setEvaluation(parsed.evaluation);

                            const recoveredColors: Record<string, string> = {};
                            parsed.evaluation.regions.forEach((r) => {
                                recoveredColors[r.regionId] = r.userColor;
                            });
                            setSelectedColors(recoveredColors);
                            setLoading(false);
                            return;
                        } else {
                            localStorage.removeItem(DAILY_STORAGE_KEY);
                        }
                    } catch {
                        localStorage.removeItem(DAILY_STORAGE_KEY);
                    }
                }
            } else {
                data = await fetchRandomFlag();
                setFlag(data);
            }

            const extractedRegions = extractRegionIds(data.svg);
            const initialColors: Record<string, string> = {};

            if (mode === 'random') {
                extractedRegions.forEach((regionId) => {
                    initialColors[regionId] = generateRandomHex();
                });
            } else {
                extractedRegions.forEach((regionId, index) => {
                    initialColors[regionId] = data.desaturatedColors?.[index] || DEFAULT_REGION_COLOR;
                });
            }

            setSelectedColors(initialColors);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error loading flag');
        } finally {
            setLoading(false);
        }
    }, [mode]);

    useEffect(() => {
        loadNewGame();
    }, [loadNewGame]);

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

            const result: EvaluationData = { regions, overallScore, correctColorsMap };
            setEvaluation(result);

            if (mode === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                const dailyPayload: StoredDailyPayload = {
                    date: today,
                    evaluation: result,
                };
                localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyPayload));
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error submitting answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateColor = (regionId: string, color: string) => {
        setSelectedColors((prev) => ({ ...prev, [regionId]: color }));
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