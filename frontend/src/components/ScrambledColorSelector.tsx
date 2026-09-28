import React, { useState } from 'react';
import { ScrambledEvaluationSummary } from './ScrambledEvaluationSummary';

const DragGripIcon = () => (
    <svg width="14" height="20" viewBox="0 0 16 24" fill="none" className="text-neutral-500 shrink-0">
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
        <circle cx="10" cy="6" r="1.5" fill="currentColor" />
        <circle cx="6" cy="12" r="1.5" fill="currentColor" />
        <circle cx="10" cy="12" r="1.5" fill="currentColor" />
        <circle cx="6" cy="18" r="1.5" fill="currentColor" />
        <circle cx="10" cy="18" r="1.5" fill="currentColor" />
    </svg>
);

interface ScrambledColorSelectorProps {
    regionIds: string[];
    selectedColors: Record<string, string>;
    evaluation: any;
    onSwapTiles: (sourceRegionId: string, targetRegionId: string) => void;
    onSubmit: () => void;
    onNextFlag: () => void;
}

export const ScrambledColorSelector: React.FC<ScrambledColorSelectorProps> = ({
                                                                                  regionIds,
                                                                                  selectedColors,
                                                                                  evaluation,
                                                                                  onSwapTiles,
                                                                                  onSubmit,
                                                                                  onNextFlag,
                                                                              }) => {
    const [draggedRegion, setDraggedRegion] = useState<string | null>(null);
    const [dragOverRegion, setDragOverRegion] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, regionId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', regionId);
        setDraggedRegion(regionId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, regionId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverRegion !== regionId) {
            setDragOverRegion(regionId);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetRegionId: string) => {
        e.preventDefault();
        setDragOverRegion(null);
        if (draggedRegion && draggedRegion !== targetRegionId) {
            onSwapTiles(draggedRegion, targetRegionId);
        }
        setDraggedRegion(null);
    };

    return (
        <div className="p-4 rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] w-full h-full flex flex-col justify-between">
            {!evaluation ? (
                <div className="flex flex-col h-full justify-between min-h-0">
                    <div className="flex flex-col min-h-0 flex-1">
                        <div className="mb-3 pb-2 border-b border-[#2e2e2e]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Swap Color Tiles
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Drag any row onto another region to swap colors.
                            </p>
                        </div>

                        <div className="space-y-2 overflow-y-auto px-1 py-1 flex-1 custom-scrollbar">
                            {regionIds.map((regionId) => {
                                const color = selectedColors[regionId] || '#404040';
                                const isDragging = draggedRegion === regionId;
                                const isDragOver =
                                    dragOverRegion === regionId && draggedRegion !== regionId;

                                return (
                                    <div
                                        key={regionId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, regionId)}
                                        onDragEnd={() => {
                                            setDraggedRegion(null);
                                            setDragOverRegion(null);
                                        }}
                                        onDragOver={(e) => handleDragOver(e, regionId)}
                                        onDragLeave={() => setDragOverRegion(null)}
                                        onDrop={(e) => handleDrop(e, regionId)}
                                        className={`flex items-center justify-between px-3.5 py-4.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing hover:border-emerald-700 hover:bg-[#252525] ${
                                            isDragOver
                                                ? 'border-emerald-500/80 bg-emerald-950/20'
                                                : 'border-[#2a2a2a] bg-[#161616]'
                                        } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                                        title="Drag row to swap"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2 pointer-events-none">
                                            <DragGripIcon />
                                            <span className="text-xs font-medium text-neutral-200 capitalize truncate">
                                                {regionId.replace('-', ' ')}
                                            </span>
                                        </div>

                                        <div
                                            className="w-6 h-6 rounded border border-neutral-600 shadow-sm flex-shrink-0 pointer-events-none"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={onSubmit}
                        className="w-full py-3 mt-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition font-semibold text-sm shadow-md active:scale-[0.99] flex-shrink-0"
                    >
                        Submit Solution
                    </button>
                </div>
            ) : (
                <ScrambledEvaluationSummary
                    evaluation={evaluation}
                    onNextFlag={onNextFlag}
                />
            )}
        </div>
    );
};