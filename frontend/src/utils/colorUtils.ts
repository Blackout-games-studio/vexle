export interface RGB {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

export interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

export interface HSV {
    h: number; // 0-360
    s: number; // 0-100
    v: number; // 0-100
}

export interface LAB {
    l: number; // 0-100
    a: number; // -128 to 127
    b: number; // -128 to 127
}

// Helper: Normalize Hex
export const normalizeHex = (hex: string): string => {
    let clean = hex.trim().replace(/^#/, '').toLowerCase();
    if (clean.length === 3) {
        clean = clean.split('').map((c) => c + c).join('');
    }
    return `#${clean.padStart(6, '0')}`;
};

// Hex <-> RGB
export const hexToRgb = (hex: string): RGB => {
    const clean = normalizeHex(hex).replace('#', '');
    const num = parseInt(clean, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
    const toHex = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// RGB <-> HSV
export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
    const rN = r / 255, gN = g / 255, bN = b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
            case gN: h = (bN - rN) / d + 2; break;
            case bN: h = (rN - gN) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

export const hsvToRgb = ({ h, s, v }: HSV): RGB => {
    const hN = (h % 360) / 60;
    const sN = s / 100;
    const vN = v / 100;
    const i = Math.floor(hN);
    const f = hN - i;
    const p = vN * (1 - sN);
    const q = vN * (1 - f * sN);
    const t = vN * (1 - (1 - f) * sN);

    let r = 0, g = 0, b = 0;
    switch (i % 6) {
        case 0: r = vN; g = t; b = p; break;
        case 1: r = q; g = vN; b = p; break;
        case 2: r = p; g = vN; b = t; break;
        case 3: r = p; g = q; b = vN; break;
        case 4: r = t; g = p; b = vN; break;
        case 5: r = vN; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// RGB <-> HSL
export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
    const rN = r / 255, gN = g / 255, bN = b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch (max) {
        case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
        case gN: h = (bN - rN) / d + 2; break;
        case bN: h = (rN - gN) / d + 4; break;
    }
    return { h: Math.round((h / 6) * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// RGB -> CIELAB (D65 Illuminant)
export const rgbToLab = ({ r, g, b }: RGB): LAB => {
    let rN = r / 255, gN = g / 255, bN = b / 255;
    rN = rN > 0.04045 ? Math.pow((rN + 0.055) / 1.055, 2.4) : rN / 12.92;
    gN = gN > 0.04045 ? Math.pow((gN + 0.055) / 1.055, 2.4) : gN / 12.92;
    bN = bN > 0.04045 ? Math.pow((bN + 0.055) / 1.055, 2.4) : bN / 12.92;

    let x = (rN * 0.4124 + gN * 0.3576 + bN * 0.1805) * 100;
    let y = (rN * 0.2126 + gN * 0.7152 + bN * 0.0722) * 100;
    let z = (rN * 0.0193 + gN * 0.1192 + bN * 0.9505) * 100;

    // D65 Standard Reference Values
    x /= 95.047;
    y /= 100.00;
    z /= 108.883;

    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const fx = f(x), fy = f(y), fz = f(z);

    return {
        l: 116 * fy - 16,
        a: 500 * (fx - fy),
        b: 200 * (fy - fz),
    };
};

// CIEDE2000 Delta E Calculation (ΔE*00)
export const deltaE2000 = (lab1: LAB, lab2: LAB): number => {
    const deg2rad = (deg: number) => (deg * Math.PI) / 180;
    const rad2deg = (rad: number) => (rad * 180) / Math.PI;

    const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
    const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;

    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const C_bar = (C1 + C2) / 2;

    const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));
    const a1_prime = a1 * (1 + G);
    const a2_prime = a2 * (1 + G);

    const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
    const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

    const h1_prime = Math.abs(a1_prime) + Math.abs(b1) === 0 ? 0 : (rad2deg(Math.atan2(b1, a1_prime)) + 360) % 360;
    const h2_prime = Math.abs(a2_prime) + Math.abs(b2) === 0 ? 0 : (rad2deg(Math.atan2(b2, a2_prime)) + 360) % 360;

    const delta_L_prime = L2 - L1;
    const delta_C_prime = C2_prime - C1_prime;

    let delta_h_prime = 0;
    if (C1_prime * C2_prime !== 0) {
        if (Math.abs(h2_prime - h1_prime) <= 180) {
            delta_h_prime = h2_prime - h1_prime;
        } else if (h2_prime - h1_prime > 180) {
            delta_h_prime = h2_prime - h1_prime - 360;
        } else {
            delta_h_prime = h2_prime - h1_prime + 360;
        }
    }

    const delta_H_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(deg2rad(delta_h_prime / 2));

    const L_bar_prime = (L1 + L2) / 2;
    const C_bar_prime = (C1_prime + C2_prime) / 2;

    let h_bar_prime = 0;
    if (C1_prime * C2_prime !== 0) {
        if (Math.abs(h1_prime - h2_prime) <= 180) {
            h_bar_prime = (h1_prime + h2_prime) / 2;
        } else if (h1_prime + h2_prime < 360) {
            h_bar_prime = (h1_prime + h2_prime + 360) / 2;
        } else {
            h_bar_prime = (h1_prime + h2_prime - 360) / 2;
        }
    }

    const T =
        1 -
        0.17 * Math.cos(deg2rad(h_bar_prime - 30)) +
        0.24 * Math.cos(deg2rad(2 * h_bar_prime)) +
        0.32 * Math.cos(deg2rad(3 * h_bar_prime + 6)) -
        0.2 * Math.cos(deg2rad(4 * h_bar_prime - 63));

    const delta_theta = 30 * Math.exp(-Math.pow((h_bar_prime - 275) / 25, 2));
    const R_C = 2 * Math.sqrt(Math.pow(C_bar_prime, 7) / (Math.pow(C_bar_prime, 7) + Math.pow(25, 7)));
    const S_L = 1 + (0.015 * Math.pow(L_bar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar_prime - 50, 2));
    const S_C = 1 + 0.045 * C_bar_prime;
    const S_H = 1 + 0.015 * C_bar_prime * T;
    const R_T = -Math.sin(deg2rad(2 * delta_theta)) * R_C;

    const k_L = 1, k_C = 1, k_H = 1;

    const termL = delta_L_prime / (k_L * S_L);
    const termC = delta_C_prime / (k_C * S_C);
    const termH = delta_H_prime / (k_H * S_H);

    return Math.sqrt(termL * termL + termC * termC + termH * termH + R_T * termC * termH);
};

export const calculateDeltaEPercentage = (userHex: string, targetHex: string): { deltaE: number; score: number } => {
    const lab1 = rgbToLab(hexToRgb(userHex));
    const lab2 = rgbToLab(hexToRgb(targetHex));
    const deltaE = deltaE2000(lab1, lab2);

    if (deltaE <= 1.0) return { deltaE, score: 100 };
    const k = 0.086;
    const rawScore = 100 * Math.exp(-k * (deltaE - 1.0));

    const score = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));
    return { deltaE, score };
};


// Converts a HEX color to its desaturated (monochrome/grayscale) HEX equivalent
export const desaturateHex = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return '#808080';
    if (cleanHex === "FFFFFF") return '#121212';

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Perceptual luminance weights
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const grayHex = gray.toString(16).padStart(2, '0');

    return `#${grayHex}${grayHex}${grayHex}`;
};

export const hslToRgb = ({ h, s, l }: HSL): RGB => {
    const hNormalized = h / 360;
    const sNormalized = s / 100;
    const lNormalized = l / 100;

    let r: number, g: number, b: number;

    if (sNormalized === 0) {
        // Achromatic (grey)
        r = g = b = lNormalized;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            let normalizedT = t;
            if (normalizedT < 0) normalizedT += 1;
            if (normalizedT > 1) normalizedT -= 1;

            if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
            if (normalizedT < 1 / 2) return q;
            if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
            return p;
        };

        const q = lNormalized < 0.5
            ? lNormalized * (1 + sNormalized)
            : lNormalized + sNormalized - lNormalized * sNormalized;
        const p = 2 * lNormalized - q;

        r = hue2rgb(p, q, hNormalized + 1 / 3);
        g = hue2rgb(p, q, hNormalized);
        b = hue2rgb(p, q, hNormalized - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};