import { useState, useEffect, useCallback } from 'react';
import { fetchScrambledFlag, type ScrambledFlagData } from '../api/scrambledApi';

export interface ScrambledRegionResult {
    regionId: string;
    userColor: string;
    correctColor: string;
    isCorrect: boolean;
}

export interface ScrambledEvaluation {
    regions: ScrambledRegionResult[];
    scorePercentage: number;
    totalCorrect: number;
    totalRegions: number;
}

export const useScrambledGame = () => {
    const [flagData, setFlagData] = useState<ScrambledFlagData | null>(null);
    const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [evaluation, setEvaluation] = useState<ScrambledEvaluation | null>(null);

    const loadGame = useCallback(async () => {
        setLoading(true);
        setError(null);
        setEvaluation(null);
        try {
            const data = await fetchScrambledFlag();
            setFlagData(data);
            setSelectedColors(data.shuffledColors);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load scrambled flag');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGame();
    }, [loadGame]);

    const swapTiles = (regionA: string, regionB: string) => {
        if (evaluation) return;
        setSelectedColors((prev) => ({
            ...prev,
            [regionA]: prev[regionB],
            [regionB]: prev[regionA],
        }));
    };

    const submit = () => {
        if (!flagData) return;

        let correctCount = 0;
        const regions: ScrambledRegionResult[] = flagData.regionIds.map((regionId) => {
            const userColor = selectedColors[regionId] || '#000000';
            const correctColor = flagData.correctColors[regionId] || '#000000';
            const isCorrect = userColor.toLowerCase() === correctColor.toLowerCase();

            if (isCorrect) correctCount++;

            return {
                regionId,
                userColor,
                correctColor,
                isCorrect,
            };
        });

        const totalRegions = flagData.regionIds.length;
        const scorePercentage = Math.round((correctCount / (totalRegions || 1)) * 100);

        setEvaluation({
            regions,
            scorePercentage,
            totalCorrect: correctCount,
            totalRegions,
        });
    };

    return {
        flagData,
        selectedColors,
        loading,
        error,
        evaluation,
        swapTiles,
        submit,
        loadGame,
    };
};