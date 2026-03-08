import { ThemeTokens } from "./site-settings.types";

/**
 * Converts a Hex color (e.g., #ffffff) to HSL string (e.g., "0 0% 100%")
 * compatible with Shadcn/Tailwind CSS variables
 */
function hexToHsl(hex: string): string {
    // Remove hash if present
    hex = hex.replace(/^#/, '');

    // Parse r, g, b
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Round values and return space-separated string
    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return `${hDeg} ${sPct}% ${lPct}%`;
}

export function applyThemeToDocument(theme: ThemeTokens): void {
    const root = document.documentElement;

    // 1. Apply Legacy Variables (Hex)
    root.style.setProperty("--ic-primary", theme.primary);
    root.style.setProperty("--ic-primary-hover", theme.primaryHover);
    root.style.setProperty("--ic-bg", theme.bg);
    root.style.setProperty("--ic-text", theme.text);
    root.style.setProperty("--ic-border", theme.border);
    root.style.setProperty("--ic-card", theme.card);

    // 2. Apply Core System Variables (HSL for Shadcn/Tailwind)
    const primaryHsl = hexToHsl(theme.primary);
    const bgHsl = hexToHsl(theme.bg);
    const textHsl = hexToHsl(theme.text);
    const cardHsl = hexToHsl(theme.card);
    const borderHsl = hexToHsl(theme.border);

    // Core Colors
    root.style.setProperty("--primary", primaryHsl);
    // Auto-calculate foreground for primary (white if dark, black if light)
    // Simple logic: if L < 50% -> white, else black
    const primaryL = parseInt(primaryHsl.split(' ')[2]);
    root.style.setProperty("--primary-foreground", primaryL < 50 ? "0 0% 100%" : "0 0% 0%");

    root.style.setProperty("--background", bgHsl);
    root.style.setProperty("--foreground", textHsl);

    root.style.setProperty("--card", cardHsl);
    root.style.setProperty("--card-foreground", textHsl);
    root.style.setProperty("--popover", cardHsl);
    root.style.setProperty("--popover-foreground", textHsl);

    // Secondary - derive from primary or use a specific logic? 
    // For now, let's keep secondary as a muted version of primary or static
    // Or just map it to primary for consistency if not defined
    // root.style.setProperty("--secondary", primaryHsl); 
    // root.style.setProperty("--secondary-foreground", ...);

    // Muted/Accent - derive from bg/card
    // root.style.setProperty("--muted", ...);

    // Borders & Inputs
    root.style.setProperty("--border", borderHsl);
    root.style.setProperty("--input", borderHsl);
    root.style.setProperty("--ring", primaryHsl);
}
