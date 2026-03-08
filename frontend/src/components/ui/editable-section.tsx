import React from "react";
import { useEditMode } from "@/admin/EditModeContext";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { Eye, EyeOff, Settings } from "lucide-react";

interface EditableSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

export function EditableSection({ id, title, children }: EditableSectionProps) {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();

    // Get visibility from settings (default to true if not set)
    const sectionKey = `${id}Visible`;
    const sections = settings.featureFlags?.sections as Record<string, boolean> | undefined;
    const isVisible = sections?.[sectionKey] ?? true;

    const toggleVisibility = () => {
        updateSettings((prev) => ({
            ...prev,
            featureFlags: {
                ...prev.featureFlags,
                sections: {
                    ...prev.featureFlags?.sections,
                    [sectionKey]: !isVisible,
                },
            },
        }));
    };

    // If hidden and not in edit mode, don't render
    if (!isVisible && !isEditMode) {
        return null;
    }

    // HARD PROTECTION: Normal mode for non-admins or when edit mode is off
    if (!isEditMode || !canEdit) {
        return <>{children}</>;
    }

    // Edit mode - show toolbar and potentially hidden indicator
    return (
        <div className={`relative ${!isVisible ? "opacity-40" : ""}`}>
            {/* Floating toolbar */}
            <div className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-white/95 border border-[var(--ic-border)] rounded-lg shadow-lg px-2 py-1">
                <span className="text-xs font-bold text-[var(--ic-text)] mr-2">{title}</span>
                <button
                    onClick={toggleVisibility}
                    className={`p-1.5 rounded transition-colors ${isVisible
                        ? "text-green-600 hover:bg-green-50"
                        : "text-red-500 hover:bg-red-50"
                        }`}
                    title={isVisible ? "Hide section" : "Show section"}
                >
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
            </div>

            {/* Hidden overlay */}
            {!isVisible && (
                <div className="absolute inset-0 bg-red-500/10 border-2 border-dashed border-red-300 flex items-center justify-center z-40 pointer-events-none">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Hidden
                    </span>
                </div>
            )}

            {/* Content */}
            {children}
        </div>
    );
}
