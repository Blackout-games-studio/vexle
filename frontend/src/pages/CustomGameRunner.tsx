import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CustomGameConfig } from '../types/customGame';
import {DEFAULT_REGION_COLOR, useCustomGameMode} from '../hooks/useCustomGameMode';
import { FlagDisplay } from '../components/FlagDisplay';
import { ColorSelector } from '../components/ColorSelector';
import { EvaluationSummary } from '../components/EvaluationSummary';
import { ColorPicker } from '../components/ColorPicker';
import PageName from "../components/PageName.tsx";

export const CustomGameRunner: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const config: CustomGameConfig | undefined = location.state?.config;

    useEffect(() => {
        if (!config) {
            navigate('/create-custom');
        }
    }, [config, navigate]);

    const {
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
    } = useCustomGameMode(config);

    const [timeLeft, setTimeLeft] = useState<number>(config?.timeLimitSeconds || 0);

    const handleTimedSubmit = useCallback(() => {
        submitAnswer();
    }, [submitAnswer]);

    useEffect(() => {
        if (!config?.isTimed || evaluation || loading) return;

        if (timeLeft <= 0) {
            handleTimedSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, config?.isTimed, evaluation, loading, handleTimedSubmit]);

    useEffect(() => {
        if (config?.isTimed) {
            setTimeLeft(config.timeLimitSeconds);
        }
    }, [flag, config]);

    const [activePicker, setActivePicker] = useState<{
        regionId: string;
        position: { top: number; left: number };
    } | null>(null);

    const handleNextRound = () => {
        setActivePicker(null);
        if (config?.isTimed) {
            setTimeLeft(config.timeLimitSeconds);
        }
        loadNewGame();
    };

    if (!config || loading || !flag) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-[#121212] text-neutral-400 font-medium">
                Loading custom game...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#121212]">
                <div className="p-6 max-w-lg w-full text-red-400 rounded-xl text-center border border-[#333333] bg-[#1e1e1e]">
                    <p className="font-semibold">{error}</p>
                    <button
                        onClick={() => navigate('/create-custom')}
                        className="mt-4 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition font-medium text-sm"
                    >
                        Back to Custom Setup
                    </button>
                </div>
            </div>
        );
    }

    const displayCountryName = config.mode === 'hard' && !evaluation ? '???' : flag.name;

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 bg-[#121212] text-[#e5e5e5] flex flex-col items-center">
            <div className="w-full max-w-7xl space-y-4">
                <header className="w-full flex flex-wrap justify-between items-center p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] gap-3">
                    <div className="flex items-center gap-3">
                        <PageName mode={"Custom"} />
                    </div>

                    {config.isTimed && (
                        <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-sm ${
                            timeLeft <= 5 ? 'border-rose-600 bg-rose-950/60 text-rose-400 animate-pulse' : 'border-[#3a3a3a] bg-[#2a2a2a] text-amber-400'
                        }`}>
                            ⏱️ Time: {timeLeft}s
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/create-custom')}
                            className="px-3 py-1.5 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] text-xs text-neutral-300 hover:bg-neutral-700"
                        >
                            Edit Rules
                        </button>
                        <button
                            onClick={handleNextRound}
                            className="px-3 py-1.5 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] text-xs text-neutral-300 hover:bg-neutral-700"
                        >
                            Skip Flag
                        </button>
                    </div>
                </header>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <FlagDisplay
                        countryName={displayCountryName}
                        svgContent={flag.svg}
                        selectedColors={selectedColors}
                        evaluation={evaluation}
                    />

                    <div className="p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] w-full min-h-[450px] flex flex-col justify-between">
                        {!evaluation ? (
                            <ColorSelector
                                regionIds={regionIds}
                                selectedColors={selectedColors}
                                isSubmitting={isSubmitting}
                                onUpdateColor={updateColor}
                                onSubmit={submitAnswer}
                            />
                        ) : (
                            <EvaluationSummary
                                evaluation={evaluation}
                                onNextFlag={handleNextRound}
                                isDaily={false}
                            />
                        )}
                    </div>
                </div>
            </div>

            {activePicker && (
                <ColorPicker
                    initialColor={selectedColors[activePicker.regionId] || DEFAULT_REGION_COLOR}
                    position={activePicker.position}
                    onChange={(color) => updateColor(activePicker.regionId, color)}
                    onClose={() => setActivePicker(null)}
                />
            )}
        </div>
    );
};