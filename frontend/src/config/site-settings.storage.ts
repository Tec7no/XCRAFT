import { SiteSettings } from "./site-settings.types";
import { DEFAULT_SITE_SETTINGS } from "./site-settings.default";

// ==================== LOCALSTORAGE KEYS ====================
const PUBLISHED_KEY = "XCRAFT_SITE_SETTINGS_PUBLISHED_V1";
const DRAFT_KEY = "XCRAFT_SITE_SETTINGS_DRAFT_V1";

// ==================== PUBLISHED SETTINGS ====================
// Used by the public customer-facing site

/**
 * Load published settings from localStorage.
 * If missing → returns DEFAULT_SITE_SETTINGS
 * If parse error → returns DEFAULT_SITE_SETTINGS
 * If version mismatch → returns DEFAULT_SITE_SETTINGS
 */
export function loadPublishedSettings(): SiteSettings {
    try {
        const raw = localStorage.getItem(PUBLISHED_KEY);
        if (!raw) return DEFAULT_SITE_SETTINGS;

        const parsed = JSON.parse(raw) as SiteSettings;

        if (parsed.version !== DEFAULT_SITE_SETTINGS.version) {
            console.warn("Published settings version mismatch, resetting to defaults.");
            return DEFAULT_SITE_SETTINGS;
        }

        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch (error) {
        console.error("Failed to load published settings:", error);
        return DEFAULT_SITE_SETTINGS;
    }
}

/**
 * Save published settings to localStorage.
 */
export function savePublishedSettings(next: SiteSettings): void {
    try {
        localStorage.setItem(PUBLISHED_KEY, JSON.stringify(next));
    } catch (error) {
        console.error("Failed to save published settings:", error);
    }
}

// ==================== DRAFT SETTINGS ====================
// Used by the admin editor preview

/**
 * Load draft settings from localStorage.
 * If missing → returns published settings (NOT default)
 * If parse error → returns published settings
 * If version mismatch → returns published settings
 */
export function loadDraftSettings(): SiteSettings {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) {
            // If no draft exists, start from published (not default)
            return loadPublishedSettings();
        }

        const parsed = JSON.parse(raw) as SiteSettings;

        if (parsed.version !== DEFAULT_SITE_SETTINGS.version) {
            console.warn("Draft settings version mismatch, resetting to published.");
            return loadPublishedSettings();
        }

        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch (error) {
        console.error("Failed to load draft settings:", error);
        return loadPublishedSettings();
    }
}

/**
 * Save draft settings to localStorage.
 */
export function saveDraftSettings(next: SiteSettings): void {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch (error) {
        console.error("Failed to save draft settings:", error);
    }
}

// ==================== PUBLISH / RESET ACTIONS ====================

/**
 * Publish draft to production - copies draft settings to published.
 */
export function publishDraft(): void {
    const draft = loadDraftSettings();
    savePublishedSettings(draft);
}

/**
 * Reset draft to match published settings (discard unpublished changes).
 */
export function resetDraftToPublished(): void {
    const published = loadPublishedSettings();
    saveDraftSettings(published);
}

/**
 * Reset all settings (both published and draft) to DEFAULT_SITE_SETTINGS.
 */
export function resetAllToDefault(): void {
    savePublishedSettings(DEFAULT_SITE_SETTINGS);
    saveDraftSettings(DEFAULT_SITE_SETTINGS);
}

// ==================== LEGACY COMPATIBILITY ====================
// Keep old function names for backward compatibility

export function loadSiteSettings(): SiteSettings {
    return loadPublishedSettings();
}

export function saveSiteSettings(settings: SiteSettings): void {
    savePublishedSettings(settings);
}

export function resetSiteSettings(): void {
    resetAllToDefault();
}

