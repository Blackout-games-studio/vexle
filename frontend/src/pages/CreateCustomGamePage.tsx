import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CustomGameConfig, GameMode } from '../types/customGame';

const AVAILABLE_TAGS = [
    { id: 'EUROPE', label: 'Europe' },
    { id: 'ASIA', label: 'Asia' },
    { id: 'AFRICA', label: 'Africa' },
    { id: 'NORTH_AMERICA', label: 'North America' },
    { id: 'SOUTH_AMERICA', label: 'South America' },
    { id: 'OCEANIA', label: 'Oceania' },
    { id: 'COUNTRY', label: 'Countries' },
];

const TIMER_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '60s', value: 60 },
    { label: '90s', value: 90 },
    { label: '120s', value: 120 },
];

export const CreateCustomGamePage: React.FC = () => {
    const navigate = useNavigate();

    const [mode, setMode] = useState<GameMode>('regular');
    const [selectedTags, setSelectedTags] = useState<string[]>(['EUROPE', 'COUNTRY']);
    const [minColors, setMinColors] = useState<number>(2);
    const [maxColors, setMaxColors] = useState<number>(8);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(0);

    useEffect(() => {
        if (mode === 'scrambled' && minColors < 3) {
            setMinColors(3);
        }
    }, [mode, minColors]);

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
        );
    };

    const handleStartGame = () => {
        const config: CustomGameConfig = {
            mode,
            selectedTags,
            minColors,
            maxColors,
            isTimed: timeLimitSeconds > 0,
            timeLimitSeconds,
        };

        navigate('/play/custom', { state: { config } });
    };

    return (
        <div className="min-h-screen bg-[#121212] text-[#e5e5e5] flex flex-col items-center p-6">
            <div className="max-w-3xl w-full space-y-6">

                <header className="flex justify-between items-center p-5 rounded-2xl border border-neutral-800 bg-[#1a1a1a]">
                    <div>
                        <h1 className="text-xl font-bold text-white">Custom Game Mode</h1>
                        <p className="text-xs text-neutral-400 mt-0.5">Configure your parameters and rules</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-800 bg-[#161616] hover:bg-[#222222] transition text-neutral-300 hover:text-white"
                    >
                        Back
                    </button>
                </header>

                <section className="p-5 rounded-2xl border border-neutral-800 bg-[#1a1a1a] space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">1. Game Mode</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { id: 'regular', name: 'Standard', desc: 'Classic flag painting' },
                            { id: 'hard', name: 'Hard Mode', desc: 'Country name is hidden' },
                            { id: 'random', name: 'Random', desc: 'Random colors' },
                            { id: 'scrambled', name: 'Scrambled', desc: 'Shuffled palettes' },
                        ].map((item) => {
                            const active = mode === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setMode(item.id as GameMode)}
                                    className={`p-3.5 text-left rounded-xl border transition ${
                                        active
                                            ? 'border-emerald-500 bg-[#192620] text-white'
                                            : 'border-neutral-800 bg-[#141414] text-neutral-400 hover:border-neutral-700'
                                    }`}
                                >
                                    <div className="font-bold text-sm text-white">{item.name}</div>
                                    <div className="text-[11px] text-neutral-400 mt-1 leading-tight">{item.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="p-5 rounded-2xl border border-neutral-800 bg-[#1a1a1a] space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">2. Tags and Regions</h2>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_TAGS.map((tag) => {
                            const active = selectedTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition ${
                                        active
                                            ? 'border-emerald-500 bg-[#192620] text-white'
                                            : 'border-neutral-800 bg-[#141414] text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                                    }`}
                                >
                                    {tag.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="p-5 rounded-2xl border border-neutral-800 bg-[#1a1a1a] space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">3. Flag Colors</h2>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-neutral-400 block mb-1">Minimum</label>
                                <input
                                    type="number"
                                    min={mode === 'scrambled' ? 3 : 1}
                                    max={maxColors}
                                    value={minColors}
                                    onChange={(e) => setMinColors(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-[#141414] border border-neutral-800 rounded-lg p-2.5 text-sm font-mono text-center text-white focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-neutral-400 block mb-1">Maximum</label>
                                <input
                                    type="number"
                                    min={minColors}
                                    max={12}
                                    value={maxColors}
                                    onChange={(e) => setMaxColors(Math.max(minColors, parseInt(e.target.value) || minColors))}
                                    className="w-full bg-[#141414] border border-neutral-800 rounded-lg p-2.5 text-sm font-mono text-center text-white focus:outline-none focus:border-neutral-600"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="p-5 rounded-2xl border border-neutral-800 bg-[#1a1a1a] space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">4. Round Timer</h2>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                            {TIMER_OPTIONS.map((option) => {
                                const active = timeLimitSeconds === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setTimeLimitSeconds(option.value)}
                                        className={`py-2 rounded-lg text-xs font-semibold transition border ${
                                            active
                                                ? 'border-emerald-500 bg-[#192620] text-white'
                                                : 'border-neutral-800 bg-[#141414] text-neutral-400 hover:border-neutral-700 hover:text-white'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <button
                    type="button"
                    onClick={handleStartGame}
                    disabled={selectedTags.length === 0}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold transition disabled:opacity-50 text-white shadow-lg cursor-pointer"
                >
                    Start Custom Game
                </button>
            </div>
        </div>
    );
};