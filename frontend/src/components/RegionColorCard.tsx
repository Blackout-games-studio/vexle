import React from 'react';

export interface RegionColorData {
    regionId: string;
    userColor: string;
    correctColor: string;
    scorePercentage?: number;
    isCorrect?: boolean;
}

interface RegionColorCardProps {
    region: RegionColorData;
    variant?: 'color-match' | 'tile-match';
    showPercentage?: boolean;
}

export const RegionColorCard: React.FC<RegionColorCardProps> = ({
                                                                    region,
                                                                    variant = 'color-match',
                                                                    showPercentage = true,
                                                                }) => {
    const formattedRegionId = region.regionId.replace('-', ' ');

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border transition-colors ${
                region.isCorrect !== undefined
                    ? region.isCorrect
                        ? 'border-emerald-500/40'
                        : 'border-rose-500/40'
                    : 'border-[#2e2e2e] hover:border-[#333333]'
            }`}
        >
            <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                <span className="text-sm font-medium text-neutral-200 capitalize truncate">
                    {formattedRegionId}
                </span>
                {showPercentage && region.scorePercentage !== undefined && (
                    <span className="text-xs font-mono text-neutral-500">
                        {region.scorePercentage}% match
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {variant === 'color-match' ? (
                    <div className="flex items-center rounded-lg overflow-hidden border border-[#333333] h-7 w-20 shadow-sm">
                        <div
                            className="h-full w-1/2 relative group"
                            style={{ backgroundColor: region.userColor }}
                            title={`Yours: ${region.userColor}`}
                        />
                        <div className="w-[1px] h-full bg-[#333333]" />
                        <div
                            className="h-full w-1/2 relative group"
                            style={{ backgroundColor: region.correctColor }}
                            title={`Target: ${region.correctColor}`}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className="w-8 h-8 rounded-md border border-[#111] shadow-md transition-transform hover:scale-105"
                                style={{ backgroundColor: region.userColor }}
                                title={`Submission: ${region.userColor}`}
                            />
                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">
                                Yours
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div
                                className="w-8 h-8 rounded-md border border-[#111] shadow-md transition-transform hover:scale-105"
                                style={{ backgroundColor: region.correctColor }}
                                title={`Correct: ${region.correctColor}`}
                            />
                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">
                                Target
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};