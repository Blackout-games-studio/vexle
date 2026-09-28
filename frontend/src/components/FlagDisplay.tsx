import React, { useRef, useMemo } from 'react';
import { useSliderControls } from '../hooks/useSliderControls';
import { buildCssVarMap } from '../utils/flagUtils';
import {LucideExternalLink} from "lucide-react";
import type {EvaluationData} from "../hooks/useMultiModeGame.ts";

interface FlagDisplayProps {
    countryName: string;
    svgContent: string;
    selectedColors: Record<string, string>;
    evaluation: EvaluationData | null;
}

export const FlagDisplay: React.FC<FlagDisplayProps> = ({
                                                            countryName,
                                                            svgContent,
                                                            selectedColors,
                                                            evaluation,
                                                        }) => {
    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const { sliderPos, handleMouseDown, handleTouchMove } = useSliderControls(sliderContainerRef);

    const userCssVariables = useMemo(() => buildCssVarMap(selectedColors), [selectedColors]);
    const targetCssVariables = useMemo(() => {
        return evaluation ? buildCssVarMap(evaluation.correctColorsMap) : {};
    }, [evaluation]);

    const wikiUrl = useMemo(() => {
        if (!countryName || countryName === '???') return null;
        return `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
    }, [countryName]);

    return (
        <div className="md:col-span-2 p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] flex flex-col items-center justify-center w-full min-h-[450px]">
            <div className="w-full flex justify-between items-center pb-4">
                <p className="text-xl text-[#888888]">
                    Country: <span className="font-semibold text-neutral-200">{countryName}</span>
                </p>

                {evaluation && wikiUrl && (
                    <a
                        href={wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-700 hover:border-neutral-500 transition"
                        title={`Read about ${countryName} on Wikipedia`}
                    >
                        Wikipedia
                        <LucideExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                )}
            </div>

            <div
                ref={sliderContainerRef}
                onMouseDown={evaluation ? handleMouseDown : undefined}
                onTouchMove={evaluation ? handleTouchMove : undefined}
                className={`relative w-full aspect-[3/2] min-h-[320px] sm:min-h-[400px] flex items-center justify-center rounded-lg border border-[#2e2e2e] bg-black select-none ${
                    evaluation ? 'cursor-ew-resize' : ''
                }`}
            >
                <div className="absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain">
                    {!evaluation ? (
                        <div
                            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                            style={userCssVariables}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    ) : (
                        <>
                            <div
                                className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                                style={{
                                    clipPath: `inset(0 0 0 ${sliderPos}%)`,
                                    ...targetCssVariables,
                                }}
                            >
                                <div className="absolute top-3 right-3 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white whitespace-nowrap">
                                    Real
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                                />
                            </div>

                            <div
                                className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                                style={{
                                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                                    ...userCssVariables,
                                }}
                            >
                                <div className="absolute top-3 left-3 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white whitespace-nowrap">
                                    Submission
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                                />
                            </div>
                        </>
                    )}
                </div>

                {evaluation && (
                    <div
                        style={{ left: `${sliderPos}%` }}
                        className="absolute top-0 bottom-0 w-0.5 z-50 pointer-events-none bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#555555] bg-[#1e1e1e] text-white flex items-center justify-center shadow-lg pointer-events-auto cursor-ew-resize">
                            <svg className="w-4 h-4 fill-current text-neutral-300" viewBox="0 0 24 24">
                                <path d="M8.5 17l-5-5 5-5v10zm7-10l5 5-5 5V7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};