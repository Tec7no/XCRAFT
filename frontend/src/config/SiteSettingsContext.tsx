import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SiteSettings } from "./site-settings.types";
import { DEFAULT_SITE_SETTINGS } from "./site-settings.default";
import {
    loadPublishedSettings,
    savePublishedSettings,
    loadDraftSettings,
    saveDraftSettings,
    publishDraft as publishDraftStorage,
    resetDraftToPublished as resetDraftStorage,
    resetAllToDefault,
    fetchSettingsFromDB,
} from "./site-settings.storage";
import { applyThemeToDocument } from "./applyTheme";

interface SiteSettingsContextType {
    settings: SiteSettings;
    updateSettings: (updater: (prev: SiteSettings) => SiteSettings) => void;
    resetToDefault: () => void;
    // Editor-specific functions
    publishDraft: (currentSettings?: SiteSettings) => void;
    resetDraftToPublished: () => void;
    isEditorMode: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

/**
 * Detect if we're in editor preview mode by checking the URL path
 */
function detectEditorMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/editor-preview';
}

interface SiteSettingsProviderProps {
    children: React.ReactNode;
    forceEditorMode?: boolean; // For testing or explicit control
}

export function SiteSettingsProvider({ children, forceEditorMode }: SiteSettingsProviderProps) {
    const [isEditorMode] = useState(() => forceEditorMode ?? detectEditorMode());

    const [settings, setSettings] = useState<SiteSettings>(() => {
        // Load appropriate settings based on mode
        const loaded = isEditorMode ? loadDraftSettings() : loadPublishedSettings();
        applyThemeToDocument(loaded.theme);
        return loaded;
    });

    // On mount, fetch settings from DB and override localStorage
    useEffect(() => {
        fetchSettingsFromDB().then(dbSettings => {
            if (dbSettings) {
                setSettings(prev => ({ ...prev, ...dbSettings }));
                if (isEditorMode) {
                    saveDraftSettings(dbSettings);
                } else {
                    savePublishedSettings(dbSettings);
                }
                applyThemeToDocument(dbSettings.theme);
            }
        });
    }, [isEditorMode]);

    // Debounced save - saves to appropriate storage based on mode
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isEditorMode) {
                saveDraftSettings(settings);
            } else {
                savePublishedSettings(settings);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [settings, isEditorMode]);

    // Apply theme whenever settings.theme changes
    useEffect(() => {
        applyThemeToDocument(settings.theme);
    }, [settings.theme]);

    const updateSettings = useCallback((updater: (prev: SiteSettings) => SiteSettings) => {
        setSettings((prev) => updater(prev));
    }, []);

    const resetToDefault = useCallback(() => {
        resetAllToDefault();
        setSettings(DEFAULT_SITE_SETTINGS);
        applyThemeToDocument(DEFAULT_SITE_SETTINGS.theme);
    }, []);

    const publishDraft = useCallback((currentSettings?: SiteSettings) => {
        const toPublish = currentSettings || settings;
        savePublishedSettings(toPublish);
        saveDraftSettings(toPublish);
        // Always sync to MongoDB
        import('./site-settings.storage').then(({ saveSettingsToDB }) => {
            saveSettingsToDB(toPublish);
        });
    }, [settings]);

    const resetDraftToPublished = useCallback(() => {
        resetDraftStorage();
        // Reload draft settings after reset
        const refreshed = loadDraftSettings();
        setSettings(refreshed);
        applyThemeToDocument(refreshed.theme);
    }, []);

    return (
        <SiteSettingsContext.Provider value={{
            settings,
            updateSettings,
            resetToDefault,
            publishDraft,
            resetDraftToPublished,
            isEditorMode
        }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (!context) {
        throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
    }
    return context;
}