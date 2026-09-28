import React from 'react';
import { RegionColorCard } from './RegionColorCard';
import type {EvaluationData} from "../hooks/useMultiModeGame.ts";

interface EvaluationSummaryProps {
    evaluation: EvaluationData;
    onNextFlag: () => void;
    isDaily: boolean;
}

const getScoreColorClass = (score: number): string => {
    if (score <= 30) return 'text-rose-500';
    if (score <= 70) return 'text-amber-400';
    return 'text-emerald-400';
};

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({ evaluation, onNextFlag, isDaily }) => {
    const scoreColorClass = getScoreColorClass(evaluation.overallScore);

    return (
        <div className="flex flex-col h-full justify-between min-h-0">
            <div className="flex-1 flex flex-col min-h-0">

                <div className="text-center p-4 bg-[#121212] rounded-xl border border-[#2e2e2e] mb-4 shrink-0">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                        Overall Match
                    </span>
                    <div className={`text-4xl font-black mt-1 ${scoreColorClass}`}>
                        {evaluation.overallScore}%
                    </div>
                </div>

                <div className="flex justify-between items-center px-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 shrink-0">
                    <span>Region</span>
                    <span>Color Match</span>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    {evaluation.regions.map((reg) => (
                        <RegionColorCard
                            key={reg.regionId}
                            region={reg}
                            variant="color-match"
                            showPercentage={true}
                        />
                    ))}
                </div>
            </div>

            {!isDaily &&
                <button onClick={onNextFlag} className="w-full py-3 mt-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition font-semibold text-sm shadow-md active:scale-[0.99] shrink-0">
                    Play Next Flag
                </button>
            }
        </div>
    );
};