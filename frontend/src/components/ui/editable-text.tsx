import React, { useState } from "react";
import { useEditMode } from "@/admin/EditModeContext";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, RotateCcw } from "lucide-react";

interface EditableTextProps {
    k: string;
    defaultValue?: string;
    as?: "p" | "span" | "h1" | "h2" | "h3" | "div";
    className?: string;
    children?: React.ReactNode;
}

export function EditableText({ k, defaultValue, as: Tag = "span", className = "" }: EditableTextProps) {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const { t, lang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [fontSize, setFontSize] = useState<string>("");
    const [draft, setDraft] = useState("");

    // Check if there's an override for this key
    const hasOverride = Boolean(settings.translations?.[lang]?.[k]);
    // Use override -> t(k) -> defaultValue -> k
    const currentValue = settings.translations?.[lang]?.[k] || (t(k) !== k ? t(k) : (defaultValue || k));

    // Check for visual overrides
    const visualOverride = settings.visualOverrides?.[k];
    const currentFontSize = visualOverride?.fontSize;

    const handleOpen = () => {
        setDraft(currentValue);
        setFontSize(currentFontSize || "");
        setIsOpen(true);
    };

    const handleSave = () => {
        updateSettings((prev) => ({
            ...prev,
            translations: {
                ...prev.translations,
                [lang]: {
                    ...prev.translations[lang],
                    [k]: draft,
                },
            },
            visualOverrides: {
                ...prev.visualOverrides,
                [k]: {
                    ...prev.visualOverrides?.[k],
                    ...(fontSize ? { fontSize } : {}),
                }
            }
        }));
        setIsOpen(false);
    };

    const handleReset = () => {
        // Remove the override for this key, reverting to default translation and style
        updateSettings((prev) => {
            const langTranslations = { ...prev.translations[lang] };
            delete langTranslations[k];

            const newVisualOverrides = { ...prev.visualOverrides };
            delete newVisualOverrides[k];

            return {
                ...prev,
                translations: {
                    ...prev.translations,
                    [lang]: langTranslations,
                },
                visualOverrides: newVisualOverrides,
            };
        });
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    // HARD PROTECTION: Normal mode for non-admins or when edit mode is off
    if (!isEditMode || !canEdit) {
        return <Tag className={className} style={{ fontSize: currentFontSize }}>{currentValue}</Tag>;
    }

    // Edit mode
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Tag
                    className={`${className} cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-[var(--ic-primary)] transition-all`}
                    onClick={handleOpen}
                    style={{ fontSize: currentFontSize }}
                >
                    {currentValue}
                </Tag>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 z-[9999]" align="start">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-mono text-muted-foreground">{k}</p>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Content</span>
                        </div>
                        <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="min-h-[80px] text-sm"
                            dir={lang === "ar" ? "rtl" : "ltr"}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Text Size</span>
                            <span className="text-xs font-mono">{fontSize || 'Default'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <input
                                type="range"
                                min="12"
                                max="128"
                                step="1"
                                value={parseInt(fontSize || "16")}
                                onChange={(e) => setFontSize(`${e.target.value}px`)}
                                className="flex-1 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        {(hasOverride || visualOverride) && (
                            <Button size="sm" variant="outline" onClick={handleReset} title="Revert to default">
                                <RotateCcw className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        )}
                        <Button size="sm" onClick={handleSave} className="bg-[var(--ic-primary)] hover:bg-[var(--ic-primary-hover)]">
                            <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
