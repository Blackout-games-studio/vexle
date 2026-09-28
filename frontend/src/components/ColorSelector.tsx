import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import {DEFAULT_REGION_COLOR} from "../hooks/useCustomGameMode.ts";


interface ColorSelectorProps {
    regionIds: string[];
    selectedColors: Record<string, string>;
    isSubmitting: boolean;
    onUpdateColor: (regionId: string, color: string) => void;
    onSubmit: () => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
                                                                regionIds,
                                                                selectedColors,
                                                                isSubmitting,
                                                                onUpdateColor,
                                                                onSubmit,
                                                            }) => {
    const [activePicker, setActivePicker] = useState<{
        regionId: string;
        position: { top: number; left: number };
    } | null>(null);

    const handleOpenPicker = (regionId: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pickerWidth = 280;
        const pickerHeight = 360;

        let left = rect.left + window.scrollX;
        if (left + pickerWidth > window.innerWidth - 16) {
            left = window.innerWidth - pickerWidth - 16;
        }

        let top = rect.bottom + window.scrollY + 8;
        if (top + pickerHeight > window.innerHeight + window.scrollY - 16) {
            top = rect.top + window.scrollY - pickerHeight - 8;
        }

        setActivePicker({
            regionId,
            position: { top: Math.max(16, top), left: Math.max(16, left) },
        });
    };

    return (
        <div className="flex flex-col h-full justify-between min-h-0">
            <div className="flex flex-col min-h-0 flex-1">
                <div className="mb-3 pb-2 border-b border-[#2e2e2e] flex-shrink-0">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Select Colors
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Click any region row to pick its color.
                    </p>
                </div>

                <div className="space-y-2 overflow-y-auto px-1 py-1 flex-1 custom-scrollbar">
                    {regionIds.map((regionId) => {
                        const currentColor = selectedColors[regionId] || DEFAULT_REGION_COLOR;
                        const isPickerActive = activePicker?.regionId === regionId;

                        return (
                            <div
                                key={regionId}
                                onClick={(e) => handleOpenPicker(regionId, e)}
                                className={`flex items-center justify-between px-3.5 py-4.5 rounded-lg border transition-all cursor-pointer hover:border-emerald-700 hover:bg-[#252525] ${
                                    isPickerActive
                                        ? 'border-emerald-500/80 bg-emerald-950/20'
                                        : 'border-[#2a2a2a] bg-[#161616]'
                                }`}
                            >
                                <span className="text-xs font-medium text-neutral-200 capitalize truncate flex-1 min-w-0 pr-2">
                                    {regionId.replace('-', ' ')}
                                </span>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div
                                        className="w-5 h-5 rounded border border-neutral-600 shadow-sm"
                                        style={{ backgroundColor: currentColor }}
                                    />
                                    <span className="text-xs font-mono font-medium text-neutral-300 uppercase">
                                        {currentColor}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => {
                    setActivePicker(null);
                    onSubmit();
                }}
                disabled={isSubmitting}
                className="w-full py-3 mt-4 bg-emerald-700 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:opacity-50 text-white rounded-lg transition font-semibold text-sm shadow-md active:scale-[0.99] flex-shrink-0"
            >
                {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
            </button>

            {activePicker && (
                <ColorPicker
                    initialColor={selectedColors[activePicker.regionId] || DEFAULT_REGION_COLOR}
                    position={activePicker.position}
                    onChange={(newColor) => onUpdateColor(activePicker.regionId, newColor)}
                    onClose={() => setActivePicker(null)}
                />
            )}
        </div>
    );
};