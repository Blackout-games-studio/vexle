import React, { useState, useMemo } from 'react';
import { createFlag, type FlagCreateDto } from '../api/flags';
import { desaturateHex } from '../utils/colorUtils';
import { ColorPicker } from '../components/ColorPicker';
import { useNavigate } from 'react-router-dom';
import {FileWarning} from "lucide-react";

export const AddFlagPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [country, setCountry] = useState<string>('');
    const [svgInput, setSvgInput] = useState<string>('');
    const [tagInput, setTagInput] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    // Array of color regions parsed from SVG
    const [regionColors, setRegionColors] = useState<{ id: string; color: string }[]>([]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

    // Active color picker state
    const [activePicker, setActivePicker] = useState<{
        regionId: string;
        position: { top: number; left: number };
    } | null>(null);

    // Extract region IDs from SVG var(--region-name) declarations
    const extractRegionIds = (svgString: string): string[] => {
        const regex = /var\(\s*--([^,\s)]+)/g;
        const matches = new Set<string>();
        let match;
        while ((match = regex.exec(svgString)) !== null) {
            matches.add(match[1]);
        }
        return Array.from(matches).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });
    };

    // Synchronize dynamic regions when SVG changes
    const handleSvgChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setSvgInput(val);

        const detectedRegions = extractRegionIds(val);
        setRegionColors((prev) => {
            const prevMap = new Map(prev.map((r) => [r.id, r.color]));
            return detectedRegions.map((id) => ({
                id,
                color: prevMap.get(id) || '#ff0000',
            }));
        });
    };

    const handleColorChange = (regionId: string, newColor: string) => {
        setRegionColors((prev) =>
            prev.map((r) => (r.id === regionId ? { ...r, color: newColor } : r))
        );
    };

    const handleOpenPicker = (regionId: string, e: React.MouseEvent<HTMLButtonElement>) => {
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

    const handleAddTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    // Derive target colors and desaturated colors
    const colors = useMemo(() => regionColors.map((r) => r.color), [regionColors]);
    const desaturatedColors = useMemo(
        () => regionColors.map((r) => desaturateHex(r.color)),
        [regionColors]
    );

    // CSS variables for inline SVG rendering
    const fullColorVariables = useMemo(() => {
        return regionColors.reduce((acc, r) => {
            acc[`--${r.id}`] = r.color;
            return acc;
        }, {} as Record<string, string>);
    }, [regionColors]);

    const desaturatedVariables = useMemo(() => {
        return regionColors.reduce((acc, r) => {
            acc[`--${r.id}`] = desaturateHex(r.color);
            return acc;
        }, {} as Record<string, string>);
    }, [regionColors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !country || !svgInput || regionColors.length === 0) {
            setStatusMessage({ text: 'Fill in all fields and ensure SVG has variables.', isError: true });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        const payload: FlagCreateDto = {
            name,
            country,
            svg: svgInput,
            tags,
            colors,
            desaturatedColors,
        };

        try {
            await createFlag(payload);
            setStatusMessage({ text: 'Flag successfully added to database!', isError: false });
            // Reset form
            setName('');
            setCountry('');
            setSvgInput('');
            setTags([]);
            setRegionColors([]);
        } catch (err: any) {
            setStatusMessage({ text: err.message || 'Error submitting flag.', isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            style={{ backgroundColor: '#121212', color: '#e5e5e5' }}
            className="w-full min-h-screen p-4 sm:p-6 space-y-4"
        >
            <div
                style={{ backgroundColor: '#2a1a08', borderColor: '#854d0e', color: '#fef08a' }}
                className="w-full p-3 rounded-xl border flex items-center justify-between text-xs font-semibold"
            >
                <div className="flex items-center gap-2">
                    <span className="text-amber-400"> <FileWarning/> </span>
                    <span>Internal Testing Tool: Remove before production.</span>
                </div>
            </div>

            <header
                style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
                className="w-full p-4 rounded-xl border flex justify-between items-center"
            >
                <h1 className="text-lg font-bold text-white">Add New Flag</h1>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#e5e5e5' }}
                    className="px-4 py-2 rounded-lg hover:bg-neutral-700 transition font-medium text-xs border"
                >
                    ← Back to Game
                </button>
            </header>

            {statusMessage && (
                <div
                    style={{
                        backgroundColor: statusMessage.isError ? '#3a1818' : '#143823',
                        borderColor: statusMessage.isError ? '#6b2121' : '#1e663a',
                        color: statusMessage.isError ? '#f87171' : '#4ade80',
                    }}
                    className="p-3 rounded-lg border text-xs font-semibold"
                >
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-4">
                    <div
                        style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
                        className="p-4 rounded-xl border space-y-4"
                    >
                        <h2 style={{ color: '#888888' }} className="text-xs font-bold uppercase tracking-wider border-b pb-2 border-neutral-800">
                            SVG Data
                        </h2>

                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">
                                Raw SVG Input (CSS Variables like var(--region-1) required)
                            </label>
                            <textarea
                                value={svgInput}
                                onChange={handleSvgChange}
                                rows={8}
                                placeholder="<svg ...><rect fill='var(--region-1)' .../></svg>"
                                style={{ backgroundColor: '#121212', borderColor: '#2e2e2e', color: '#a3a3a3' }}
                                className="w-full p-2.5 rounded-lg border text-xs font-mono focus:outline-none focus:border-neutral-500"
                                required
                            />
                        </div>
                    </div>

                    <div
                        style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
                        className="p-4 rounded-xl border space-y-4"
                    >
                        <h2 style={{ color: '#888888' }} className="text-xs font-bold uppercase tracking-wider border-b pb-2 border-neutral-800">
                            Live Flag Previews
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-neutral-400 mb-1 font-semibold">Full Color</span>
                                <div
                                    style={{ backgroundColor: '#000000', borderColor: '#2e2e2e' }}
                                    className="w-full aspect-[3/2] rounded-lg border overflow-hidden flex items-center justify-center p-2"
                                >
                                    {svgInput ? (
                                        <div
                                            className="w-full h-full"
                                            style={fullColorVariables}
                                            dangerouslySetInnerHTML={{ __html: svgInput }}
                                        />
                                    ) : (
                                        <span className="text-xs text-neutral-600">No SVG Provided</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="block text-xs text-neutral-400 mb-1 font-semibold">Generated Desaturated Color</span>
                                <div
                                    style={{ backgroundColor: '#000000', borderColor: '#2e2e2e' }}
                                    className="w-full aspect-[3/2] rounded-lg border overflow-hidden flex items-center justify-center p-2"
                                >
                                    {svgInput ? (
                                        <div
                                            className="w-full h-full"
                                            style={desaturatedVariables}
                                            dangerouslySetInnerHTML={{ __html: svgInput }}
                                        />
                                    ) : (
                                        <span className="text-xs text-neutral-600">No SVG Provided</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div
                        style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
                        className="p-4 rounded-xl border space-y-4"
                    >
                        <h2 style={{ color: '#888888' }} className="text-xs font-bold uppercase tracking-wider border-b pb-2 border-neutral-800">
                            Metadata
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">Flag Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Flag of Japan"
                                    style={{ backgroundColor: '#121212', borderColor: '#2e2e2e', color: '#ffffff' }}
                                    className="w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:border-neutral-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Japan"
                                    style={{ backgroundColor: '#121212', borderColor: '#2e2e2e', color: '#ffffff' }}
                                    className="w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:border-neutral-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">Tags</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        placeholder="REAL, FICTIONAL, COUNTRY, EUROPE, ..."
                                        style={{ backgroundColor: '#121212', borderColor: '#2e2e2e', color: '#ffffff' }}
                                        className="flex-1 min-w-0 p-2.5 rounded-lg border text-xs focus:outline-none focus:border-neutral-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#ffffff' }}
                                        className="px-3 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-700 shrink-0"
                                    >
                                        Add
                                    </button>
                                </div>

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {tags.map((t) => (
                                            <span
                                                key={t}
                                                style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#d4d4d4' }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px]"
                                            >
                                                {t}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(t)}
                                                    className="hover:text-red-400 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e' }}
                        className="p-4 rounded-xl border space-y-4 flex flex-col justify-between"
                    >
                        <div className="space-y-3">
                            <h2 style={{ color: '#888888' }} className="text-xs font-bold uppercase tracking-wider border-b pb-2 border-neutral-800">
                                Configured Color Regions ({regionColors.length})
                            </h2>

                            {regionColors.length === 0 ? (
                                <p className="text-xs text-neutral-500 py-4 text-center">
                                    Paste valid SVG with <code className="text-neutral-400">var(--region-id)</code> to extract color regions.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                    {regionColors.map((r) => {
                                        const desaturated = desaturateHex(r.color);
                                        return (
                                            <div
                                                key={r.id}
                                                style={{ backgroundColor: '#121212', borderColor: '#2e2e2e' }}
                                                className="p-2.5 rounded-lg border flex flex-col gap-2"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-neutral-300 capitalize truncate">
                                                        {r.id.replace('-', ' ')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleOpenPicker(r.id, e)}
                                                        style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                                                        className="flex items-center gap-2 px-2.5 py-1 rounded border hover:bg-neutral-700 transition"
                                                    >
                                                        <span
                                                            className="w-3.5 h-3.5 rounded border border-neutral-600"
                                                            style={{ backgroundColor: r.color }}
                                                        />
                                                        <span className="text-xs font-mono font-medium text-neutral-200 uppercase">
                                                            {r.color}
                                                        </span>
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800">
                                                    <span className="text-neutral-500">Auto Desaturated:</span>
                                                    <div className="flex items-center gap-1.5 font-mono text-neutral-400">
                                                        <span
                                                            className="w-3 h-3 rounded border border-neutral-700"
                                                            style={{ backgroundColor: desaturated }}
                                                        />
                                                        <span className="uppercase">{desaturated}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ backgroundColor: '#e5e5e5', color: '#121212' }}
                            className="w-full mt-4 py-3 rounded-lg font-semibold text-sm hover:bg-white transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving Flag...' : 'Save Flag to Database'}
                        </button>
                    </div>
                </div>
            </form>

            {activePicker && (
                <ColorPicker
                    initialColor={
                        regionColors.find((r) => r.id === activePicker.regionId)?.color || '#ff0000'
                    }
                    position={activePicker.position}
                    onChange={(newColor) => handleColorChange(activePicker.regionId, newColor)}
                    onClose={() => setActivePicker(null)}
                />
            )}
        </div>
    );
};