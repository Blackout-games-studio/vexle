import { RegionColorCard } from "./RegionColorCard.tsx";

export interface ScrambledEvaluationRegion {
    regionId: string;
    userColor: string;
    correctColor: string;
    isCorrect: boolean;
}

export interface ScrambledEvaluationData {
    scorePercentage: number;
    totalCorrect: number;
    totalRegions: number;
    regions: ScrambledEvaluationRegion[];
}

interface ScrambledEvaluationSummaryProps {
    evaluation: ScrambledEvaluationData;
    onNextFlag: () => void;
}

const getScoreColorClass = (score: number): string => {
    if (score <= 30) return 'text-rose-500';
    if (score <= 70) return 'text-amber-400';
    return 'text-emerald-400';
};

export const ScrambledEvaluationSummary: React.FC<ScrambledEvaluationSummaryProps> = ({
                                                                                          evaluation,
                                                                                          onNextFlag,
                                                                                      }) => {
    const scoreColorClass = getScoreColorClass(evaluation.scorePercentage);

    return (
        <div className="flex flex-col h-full justify-between min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="text-center p-4 bg-[#121212] rounded-xl border border-[#2e2e2e] mb-4 shrink-0">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                        Accuracy
                    </span>
                    <div className={`text-4xl font-black mt-1 ${scoreColorClass}`}>
                        {evaluation.scorePercentage}%
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                        {evaluation.totalCorrect} of {evaluation.totalRegions} placed correctly
                    </p>
                </div>

                <div className="flex justify-between items-center px-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 shrink-0">
                    <span>Region</span>
                    <span className="pr-1">Color Match</span>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    {evaluation.regions.map((r) => (
                        <RegionColorCard
                            key={r.regionId}
                            region={r}
                            variant="tile-match"
                            showPercentage={false}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={onNextFlag}
                className="w-full py-3 mt-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition font-semibold text-sm shadow-md active:scale-[0.99] shrink-0"
            >
                Play Next Flag
            </button>
        </div>
    );
};