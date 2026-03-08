import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from "react";
import { getStorageItem } from "@/utils/storage";

interface EditModeContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
    setEditMode: (value: boolean) => void;
    canEdit: boolean;
    isEditorPreview: boolean;
    isIframe: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

// Helper to check admin status from storage
function checkIsAdmin(): boolean {
    const user = getStorageItem<{ role?: string } | null>('user', null);
    return Boolean(user && (user.role === 'admin' || user.role === 'manager'));
}

// Detect if we're in any iframe
function detectIframe(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Detect if we're in editor preview mode
function detectEditorPreview(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/editor-preview';
}

// Storage subscription for reactive updates
function subscribeToStorage(callback: () => void) {
    const handler = (e: StorageEvent) => {
        if (e.key === 'townteam_user' || e.key === null) {
            callback();
        }
    };
    window.addEventListener('storage', handler);
    const interval = setInterval(callback, 1000);
    return () => {
        window.removeEventListener('storage', handler);
        clearInterval(interval);
    };
}

interface EditModeProviderProps {
    children: React.ReactNode;
    forceEditorPreview?: boolean;
}

export function EditModeProvider({ children, forceEditorPreview }: EditModeProviderProps) {
    // Detect if we're in editor preview route
    const [isEditorPreview] = useState(() => forceEditorPreview || detectEditorPreview());
    const [isIframe] = useState(() => detectIframe());

    // In editor preview, edit mode is always ON. Otherwise always OFF for customers.
    const [manualEditMode, setManualEditMode] = useState(false);

    // Reactive admin check
    const canEdit = useSyncExternalStore(
        subscribeToStorage,
        checkIsAdmin,
        () => false
    );

    // CORE RULE: Edit mode is ONLY active in editor preview route AND user is admin
    const isEditMode = isEditorPreview && canEdit;

    // These functions do nothing in the new architecture (edit mode is route-based)
    const toggleEditMode = useCallback(() => {
        // No-op: edit mode is controlled by route, not toggle
    }, []);

    const setEditMode = useCallback((_value: boolean) => {
        // No-op: edit mode is controlled by route, not manual setting
    }, []);

    return (
        <EditModeContext.Provider value={{
            isEditMode,
            toggleEditMode,
            setEditMode,
            canEdit,
            isEditorPreview,
            isIframe
        }}>
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    const context = useContext(EditModeContext);
    if (!context) {
        throw new Error("useEditMode must be used within EditModeProvider");
    }
    return context;
}
