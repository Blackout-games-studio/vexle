import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    type RGB,
    type HSV,
    type HSL,
    hexToRgb,
    rgbToHex,
    rgbToHsv,
    hsvToRgb,
    rgbToHsl,
    hslToRgb
} from '../utils/colorUtils';

interface ColorPickerProps {
    initialColor: string;
    onChange: (color: string) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

type Mode = 'rgb' | 'hsv' | 'hsl';

interface EyeDropper {
    open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
}

declare global {
    interface Window {
        EyeDropper?: new () => EyeDropper;
    }
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
                                                            initialColor,
                                                            onChange,
                                                            onClose,
                                                            position,
                                                        }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const satValRef = useRef<HTMLDivElement>(null);
    const hueBarRef = useRef<HTMLDivElement>(null);

    const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(initialColor)));
    const [rgb, setRgb] = useState<RGB>(() => hexToRgb(initialColor));
    const [hsl, setHsl] = useState<HSL>(() => rgbToHsl(hexToRgb(initialColor)));
    const [hexInput, setHexInput] = useState<string>(initialColor);
    const [mode, setMode] = useState<Mode>('rgb');

    // Ref to prevent stale closures during global mousemove tracking
    const hsvRef = useRef(hsv);
    hsvRef.current = hsv;

    const updateAllColorFormats = useCallback((newRgb: RGB, newHsv: HSV, newHsl: HSL) => {
        setRgb(newRgb);
        setHsv(newHsv);
        setHsl(newHsl);
        const hex = rgbToHex(newRgb);
        setHexInput(hex);
        onChange(hex);
    }, [onChange]);

    const updateFromHsv = useCallback((newHsv: HSV) => {
        const newRgb = hsvToRgb(newHsv);
        const newHsl = rgbToHsl(newRgb);
        updateAllColorFormats(newRgb, newHsv, newHsl);
    }, [updateAllColorFormats]);

    const updateFromRgb = useCallback((newRgb: RGB) => {
        const newHsv = rgbToHsv(newRgb);
        const newHsl = rgbToHsl(newRgb);
        updateAllColorFormats(newRgb, newHsv, newHsl);
    }, [updateAllColorFormats]);

    const updateFromHsl = useCallback((newHsl: HSL) => {
        const newRgb = hslToRgb(newHsl);
        const newHsv = rgbToHsv(newRgb);
        updateAllColorFormats(newRgb, newHsv, newHsl);
    }, [updateAllColorFormats]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Saturation / Value Drag Handler
    const handleSatValDrag = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!satValRef.current) return;
        const rect = satValRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

        const s = Math.round((x / rect.width) * 100);
        const v = Math.round((1 - y / rect.height) * 100);

        updateFromHsv({ h: hsvRef.current.h, s, v });
    }, [updateFromHsv]);

    const startSatValDrag = (e: React.MouseEvent) => {
        handleSatValDrag(e);
        const onMouseMove = (ev: MouseEvent) => handleSatValDrag(ev);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Hue Drag Handler
    const handleHueDrag = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!hueBarRef.current) return;
        const rect = hueBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const h = Math.round((x / rect.width) * 360) % 360;

        updateFromHsv({ ...hsvRef.current, h });
    }, [updateFromHsv]);

    const startHueDrag = (e: React.MouseEvent) => {
        handleHueDrag(e);
        const onMouseMove = (ev: MouseEvent) => handleHueDrag(ev);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Native EyeDropper API Implementation
    const handleEyeDropper = async () => {
        if (!window.EyeDropper) return;
        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            const newRgb = hexToRgb(result.sRGBHex);
            updateFromRgb(newRgb);
        } catch {
            // User canceled eyedropper selection
        }
    };

    // Hex Input Validation & Parsing
    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setHexInput(raw);

        const cleanHex = raw.replace(/^#/, '');
        let formattedHex = '';

        if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
            formattedHex = `#${cleanHex}`;
        } else if (/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
            formattedHex = `#${cleanHex.split('').map(c => c + c).join('')}`;
        }

        if (formattedHex) {
            updateFromRgb(hexToRgb(formattedHex));
        }
    };

    const pureHueHex = rgbToHex(hsvToRgb({ h: hsv.h, s: 100, v: 100 }));
    const hasEyeDropperSupport = typeof window !== 'undefined' && 'EyeDropper' in window;

    return (
        <div
            ref={containerRef}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                backgroundColor: '#1e1e1e',
                borderColor: '#2e2e2e',
            }}
            className="fixed z-50 w-64 border rounded-xl p-3 text-white text-xs select-none shadow-2xl"
        >
            <div
                ref={satValRef}
                onMouseDown={startSatValDrag}
                style={{ backgroundColor: pureHueHex, borderColor: '#2e2e2e' }}
                className="relative w-full h-32 rounded cursor-crosshair overflow-hidden mb-2.5 border"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                    className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `${hsv.s}%`,
                        top: `${100 - hsv.v}%`,
                        backgroundColor: rgbToHex(rgb),
                    }}
                />
            </div>

            <div
                ref={hueBarRef}
                onMouseDown={startHueDrag}
                style={{
                    background:
                        'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                    borderColor: '#2e2e2e',
                }}
                className="relative w-full h-3 rounded cursor-pointer mb-2.5 border"
            >
                <div
                    className="absolute top-0 bottom-0 w-2 bg-white border border-neutral-500 rounded shadow -translate-x-1/2 pointer-events-none"
                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                />
            </div>

            <div
                style={{ backgroundColor: '#121212', borderColor: '#2e2e2e' }}
                className="flex items-center gap-2 mb-2.5 p-1.5 rounded border"
            >
                <div
                    style={{ backgroundColor: rgbToHex(rgb), borderColor: '#3e3e3e' }}
                    className="w-5 h-5 rounded border flex-shrink-0"
                />

                <div className="flex-1 flex items-center gap-0.5 font-mono text-xs overflow-hidden">
                    <span style={{ color: '#666666' }}>#</span>
                    <input
                        type="text"
                        value={hexInput.replace('#', '')}
                        onChange={handleHexInputChange}
                        className="w-full bg-transparent text-white focus:outline-none uppercase"
                    />
                </div>

                {hasEyeDropperSupport && (
                    <button
                        type="button"
                        onClick={handleEyeDropper}
                        title="Pick color from screen"
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex bg-neutral-900 rounded p-0.5 mb-2.5 border border-neutral-800 text-[10px] font-mono">
                {(['rgb', 'hsv', 'hsl'] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex-1 py-0.5 rounded transition-colors uppercase ${
                            mode === m
                                ? 'bg-neutral-700 text-white font-bold'
                                : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div style={{ color: '#aaaaaa' }} className="space-y-1 font-mono text-[10px]">
                {mode === 'rgb' && (
                    <ChannelGroup
                        channels={[
                            { key: 'r', label: 'R', value: rgb.r, min: 0, max: 255 },
                            { key: 'g', label: 'G', value: rgb.g, min: 0, max: 255 },
                            { key: 'b', label: 'B', value: rgb.b, min: 0, max: 255 },
                        ]}
                        onChange={(key, val) => updateFromRgb({ ...rgb, [key]: val })}
                    />
                )}

                {mode === 'hsv' && (
                    <ChannelGroup
                        channels={[
                            { key: 'h', label: 'H', value: hsv.h, min: 0, max: 360, unit: '°' },
                            { key: 's', label: 'S', value: hsv.s, min: 0, max: 100, unit: '%' },
                            { key: 'v', label: 'V', value: hsv.v, min: 0, max: 100, unit: '%' },
                        ]}
                        onChange={(key, val) => updateFromHsv({ ...hsv, [key]: val })}
                    />
                )}

                {mode === 'hsl' && (
                    <ChannelGroup
                        channels={[
                            { key: 'h', label: 'H', value: hsl.h, min: 0, max: 360, unit: '°' },
                            { key: 's', label: 'S', value: hsl.s, min: 0, max: 100, unit: '%' },
                            { key: 'l', label: 'L', value: hsl.l, min: 0, max: 100, unit: '%' },
                        ]}
                        onChange={(key, val) => updateFromHsl({ ...hsl, [key]: val })}
                    />
                )}
            </div>
        </div>
    );
};

interface ChannelSpec {
    key: string;
    label: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
}

const ChannelGroup: React.FC<{
    channels: ChannelSpec[];
    onChange: (key: string, value: number) => void;
}> = ({ channels, onChange }) => (
    <>
        {channels.map(({ key, label, value, min, max, unit }) => (
            <div key={key} className="flex items-center gap-2">
                <span style={{ color: '#666666' }} className="w-3 uppercase font-bold">
                    {label}
                </span>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(key, Number(e.target.value))}
                    className="w-full h-1 bg-neutral-700 rounded appearance-none cursor-pointer accent-neutral-300"
                />
                <span style={{ color: '#aaaaaa' }} className="w-8 text-right font-mono">
                    {value}{unit || ''}
                </span>
            </div>
        ))}
    </>
);