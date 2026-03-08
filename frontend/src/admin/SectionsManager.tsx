import React, { useState } from "react";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEditMode } from "@/admin/EditModeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Eye, EyeOff, Plus, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Available section templates that can be added
const SECTION_TEMPLATES = [
    { id: "hero", nameKey: "section.hero" },
    { id: "featured", nameKey: "section.featured" },
    { id: "categories", nameKey: "section.categories" },
    { id: "bestSellers", nameKey: "section.bestSellers" },
    { id: "products", nameKey: "section.products" },
    { id: "newsletter", nameKey: "section.newsletter" },
    { id: "promoBar", nameKey: "section.promoBar" },
];

export function SectionsManager() {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const { t, lang } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Only render for admins in edit mode
    if (!isEditMode || !canEdit) return null;

    const sectionsOrder = settings.layout?.sectionsOrder || [];
    const sectionsVisibility = settings.layout?.sectionsVisibility || {};

    const moveSection = (index: number, direction: "up" | "down") => {
        const newOrder = [...sectionsOrder];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

        updateSettings(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                sectionsOrder: newOrder,
                sectionsVisibility: prev.layout?.sectionsVisibility || {},
            },
        }));
    };

    const toggleVisibility = (sectionId: string) => {
        const currentVisibility = sectionsVisibility[sectionId] !== false;

        updateSettings(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                sectionsOrder: prev.layout?.sectionsOrder || [],
                sectionsVisibility: {
                    ...prev.layout?.sectionsVisibility,
                    [sectionId]: !currentVisibility,
                },
            },
        }));
    };

    const addSection = (sectionId: string) => {
        if (sectionsOrder.includes(sectionId)) {
            toast({
                title: lang === "ar" ? "موجود بالفعل" : "Already Added",
                description: lang === "ar" ? "هذا القسم موجود بالفعل" : "This section is already in the layout.",
                variant: "destructive",
            });
            return;
        }

        updateSettings(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                sectionsOrder: [...(prev.layout?.sectionsOrder || []), sectionId],
                sectionsVisibility: {
                    ...prev.layout?.sectionsVisibility,
                    [sectionId]: true,
                },
            },
        }));

        setIsAddDialogOpen(false);
        toast({
            title: lang === "ar" ? "تمت الإضافة" : "Section Added",
            description: lang === "ar" ? "تم إضافة القسم بنجاح" : "Section added successfully.",
        });
    };

    const removeSection = (sectionId: string) => {
        updateSettings(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                sectionsOrder: (prev.layout?.sectionsOrder || []).filter(id => id !== sectionId),
                sectionsVisibility: prev.layout?.sectionsVisibility || {},
            },
        }));
    };

    const getSectionName = (sectionId: string) => {
        const template = SECTION_TEMPLATES.find(t => t.id === sectionId);
        return template ? t(template.nameKey) : sectionId;
    };

    const availableToAdd = SECTION_TEMPLATES.filter(t => !sectionsOrder.includes(t.id));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="h-4 w-4 text-[#C8A96A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {lang === "ar" ? "إدارة الأقسام" : "Sections Manager"}
                </h3>
            </div>

            <div className="space-y-2">
                {sectionsOrder.map((sectionId, index) => {
                    const isVisible = sectionsVisibility[sectionId] !== false;
                    return (
                        <div
                            key={sectionId}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${isVisible
                                ? "bg-white/5 border-white/10 hover:border-[#C8A96A]/30"
                                : "bg-black/20 border-white/5 opacity-50"
                                }`}
                        >
                            <span className="text-sm font-medium text-gray-200">
                                {getSectionName(sectionId)}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSection(index, "up")}
                                    disabled={index === 0}
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSection(index, "down")}
                                    disabled={index === sectionsOrder.length - 1}
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleVisibility(sectionId)}
                                    className={`h-7 w-7 p-0 ${isVisible ? "text-[#C8A96A]" : "text-gray-600 hover:text-gray-400"}`}
                                >
                                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Separator className="bg-white/10" />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed border-[#C8A96A]/30 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] bg-transparent"
                        disabled={availableToAdd.length === 0}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === "ar" ? "إضافة قسم" : "Add Section"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {lang === "ar" ? "اختر قسم للإضافة" : "Choose a Section to Add"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                        {availableToAdd.map(template => (
                            <Button
                                key={template.id}
                                variant="outline"
                                className="justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                                onClick={() => addSection(template.id)}
                            >
                                {t(template.nameKey)}
                            </Button>
                        ))}
                        {availableToAdd.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                {lang === "ar" ? "جميع الأقسام مضافة" : "All sections are already added."}
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
