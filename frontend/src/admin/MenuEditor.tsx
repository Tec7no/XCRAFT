import React, { useState } from "react";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEditMode } from "@/admin/EditModeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Eye, EyeOff, Plus, Menu, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavItem } from "@/config/site-settings.types";
import { PREDEFINED_ROUTES } from "@/config/predefined-routes";

export function MenuEditor() {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const { t, lang } = useLanguage();
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState({ labelEn: "", labelAr: "", href: "", isCustom: false });

    // Only render for admins in edit mode
    if (!isEditMode || !canEdit) return null;

    const navItems = settings.nav?.items || [];

    const moveItem = (index: number, direction: "up" | "down") => {
        const newItems = [...navItems];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        updateSettings(prev => ({
            ...prev,
            nav: { items: newItems },
        }));
    };

    const toggleVisibility = (itemId: string) => {
        updateSettings(prev => ({
            ...prev,
            nav: {
                items: (prev.nav?.items || []).map(item =>
                    item.id === itemId ? { ...item, visible: !item.visible } : item
                ),
            },
        }));
    };

    const updateItemField = (itemId: string, field: keyof NavItem, value: string | boolean) => {
        updateSettings(prev => ({
            ...prev,
            nav: {
                items: (prev.nav?.items || []).map(item =>
                    item.id === itemId ? { ...item, [field]: value } : item
                ),
            },
        }));
    };

    const deleteItem = (itemId: string) => {
        updateSettings(prev => ({
            ...prev,
            nav: {
                items: (prev.nav?.items || []).filter(item => item.id !== itemId),
            },
        }));
    };

    const addNewItem = () => {
        if (!newItem.labelEn.trim() || !newItem.href.trim()) {
            toast({
                title: lang === "ar" ? "خطأ" : "Error",
                description: lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields.",
                variant: "destructive",
            });
            return;
        }

        const id = `custom_${Date.now()}`;
        const labelKey = `nav.${id}`;

        // Add translation keys
        updateSettings(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                en: { ...prev.translations.en, [labelKey]: newItem.labelEn },
                ar: { ...prev.translations.ar, [labelKey]: newItem.labelAr || newItem.labelEn },
            },
            nav: {
                items: [
                    ...(prev.nav?.items || []),
                    { id, labelKey, href: newItem.href, visible: true },
                ],
            },
        }));

        setNewItem({ labelEn: "", labelAr: "", href: "", isCustom: false });
        setIsAddDialogOpen(false);
        toast({
            title: lang === "ar" ? "تمت الإضافة" : "Item Added",
            description: lang === "ar" ? "تم إضافة عنصر القائمة" : "Menu item added successfully.",
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Menu className="h-4 w-4 text-[#C8A96A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {lang === "ar" ? "تعديل القائمة" : "Menu Editor"}
                </h3>
            </div>

            <div className="space-y-2">
                {navItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-all duration-200 space-y-3 ${item.visible
                            ? "bg-white/5 border-white/10 hover:border-[#C8A96A]/30"
                            : "bg-black/20 border-white/5 opacity-50"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-200">
                                {t(item.labelKey)}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(index, "up")}
                                    disabled={index === 0}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(index, "down")}
                                    disabled={index === navItems.length - 1}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleVisibility(item.id)}
                                    className={`h-6 w-6 p-0 ${item.visible ? "text-[#C8A96A]" : "text-gray-600 hover:text-gray-400"}`}
                                >
                                    {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                                {item.id.startsWith("custom_") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteItem(item.id)}
                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={PREDEFINED_ROUTES.find(r => r.path === item.href) ? item.href : "custom"}
                                onValueChange={(val) => {
                                    if (val !== "custom") {
                                        updateItemField(item.id, "href", val);
                                    } else {
                                        // Set to empty to trigger manual Input visibility
                                        updateItemField(item.id, "href", "");
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs bg-black/40 border-white/10 text-gray-300 focus:ring-[#C8A96A] flex-1">
                                    <SelectValue placeholder="Select Route" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    {PREDEFINED_ROUTES.map(route => (
                                        <SelectItem key={route.path} value={route.path} className="text-xs">
                                            {route.label} ({route.path})
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom" className="text-xs font-bold text-[#C8A96A]">
                                        Custom URL...
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {(!PREDEFINED_ROUTES.find(r => r.path === item.href)) && (
                                <Input
                                    value={item.href}
                                    onChange={(e) => updateItemField(item.id, "href", e.target.value)}
                                    placeholder="Enter Custom URL"
                                    className="h-8 text-xs bg-black/40 border-white/10 text-gray-300 placeholder:text-gray-600 focus-visible:ring-[#C8A96A]/50 focus-visible:border-[#C8A96A] flex-1"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="bg-white/10" />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed border-[#C8A96A]/30 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] bg-transparent"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === "ar" ? "إضافة عنصر" : "Add Menu Item"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {lang === "ar" ? "إضافة عنصر قائمة جديد" : "Add New Menu Item"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Label (English)</Label>
                            <Input
                                value={newItem.labelEn}
                                onChange={(e) => setNewItem(prev => ({ ...prev, labelEn: e.target.value }))}
                                placeholder="e.g., New Arrivals"
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Label (Arabic)</Label>
                            <Input
                                value={newItem.labelAr}
                                onChange={(e) => setNewItem(prev => ({ ...prev, labelAr: e.target.value }))}
                                placeholder="e.g., وصل حديثاً"
                                dir="rtl"
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Link Destination</Label>
                            <Select
                                value={newItem.isCustom ? "custom" : newItem.href}
                                onValueChange={(val) => {
                                    if (val === "custom") {
                                        setNewItem(prev => ({ ...prev, isCustom: true }));
                                    } else {
                                        setNewItem(prev => ({ ...prev, href: val, isCustom: false }));
                                    }
                                }}
                            >
                                <SelectTrigger className="bg-black/40 border-white/10 text-white">
                                    <SelectValue placeholder="Choose a page..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    {PREDEFINED_ROUTES.map(route => (
                                        <SelectItem key={route.path} value={route.path}>
                                            {route.label} ({route.path})
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom" className="font-bold text-[#C8A96A]">
                                        Custom / Outside Link
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {(newItem.isCustom || !newItem.href) && (
                                <div className="pt-2">
                                    <Input
                                        value={newItem.href}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, href: e.target.value }))}
                                        placeholder="e.g., #new-arrivals or /custom-page"
                                        className="bg-black/40 border-white/10 text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">
                            {lang === "ar" ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button onClick={addNewItem} className="bg-[#C8A96A] hover:bg-[#B69655] text-white">
                            {lang === "ar" ? "إضافة" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
