import React, { useState } from "react";
import { useEditMode } from "@/admin/EditModeContext";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Image as ImageIcon } from "lucide-react";

interface EditableImageProps {
    path: (string | number)[];
    alt?: string;
    className?: string;
}

// Helper to get nested value
function getNestedValue(obj: any, path: (string | number)[]): any {
    return path.reduce((acc, key) => acc?.[key], obj);
}

// Helper to set nested value immutably
function setNestedValue(obj: any, path: (string | number)[], value: any): any {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    const current = obj?.[head];
    return {
        ...obj,
        [head]: rest.length === 0 ? value : setNestedValue(current, rest, value),
    };
}

export function EditableImage({ path, alt = "Image", className = "" }: EditableImageProps) {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState("");

    const currentValue = getNestedValue(settings, path) || "";

    const handleOpen = () => {
        setDraft(currentValue);
        setIsOpen(true);
    };

    const handleSave = () => {
        updateSettings((prev) => setNestedValue(prev, path, draft));
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    // HARD PROTECTION: Normal mode for non-admins or when edit mode is off
    if (!isEditMode || !canEdit) {
        return (
            <img
                src={currentValue}
                alt={alt}
                className={className}
                loading="lazy"
                decoding="async"
            />
        );
    }

    // Edit mode
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className={`relative cursor-pointer group ${className}`}
                    onClick={handleOpen}
                >
                    <img
                        src={currentValue}
                        alt={alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-[var(--ic-primary)] transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-opacity">
                            <ImageIcon className="h-3 w-3" /> Edit
                        </div>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 z-[9999]" align="start">
                <div className="space-y-3">
                    <p className="text-xs font-mono text-muted-foreground">Image URL</p>
                    <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="https://..."
                        className="text-sm"
                    />
                    {draft && (
                        <div className="w-full h-20 rounded overflow-hidden border">
                            <img src={draft} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} className="bg-[var(--ic-primary)] hover:bg-[var(--ic-primary-hover)]">
                            <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
