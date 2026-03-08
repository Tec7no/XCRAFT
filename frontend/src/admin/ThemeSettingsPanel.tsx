import React from "react";
import { useEditMode } from "@/admin/EditModeContext";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ThemeSettingsPanel() {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const { lang, t } = useLanguage();
    const { toast } = useToast();

    // HARD PROTECTION: Only render for admin users in edit mode
    if (!isEditMode || !canEdit) return null;

    const handleColorChange = (key: keyof typeof settings.theme, value: string) => {
        updateSettings((prev) => ({
            ...prev,
            theme: {
                ...prev.theme,
                [key]: value,
            },
        }));
    };

    const handleResetTheme = () => {
        if (!confirm(lang === 'ar'
            ? 'هل أنت متأكد من إعادة ضبط الألوان للقيم الافتراضية؟'
            : 'Are you sure you want to reset colors to defaults?')) {
            return;
        }

        updateSettings((prev) => ({
            ...prev,
            theme: {
                primary: "#b1121a",
                primaryHover: "#333333",
                bg: "#FFFFFF",
                text: "#000000",
                border: "#E5E5E5",
                card: "#FFFFFF",
            }
        }));

        toast({
            title: t('admin_theme_reset_success_title'),
            description: t('admin_theme_reset_success_desc'),
        });

        // Minor delay to let state sync before optional reload if needed
        // But usually SiteSettingsContext handles it
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-[#C8A96A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {lang === "ar" ? "المظهر" : "Appearance"}
                </h3>
            </div>

            <div className="space-y-4">
                {/* Reset Button */}
                <div className="p-3 bg-white/5 rounded-lg border border-dashed border-white/20">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{t('admin_theme_reset_title')}</p>
                            <p className="text-[9px] text-gray-400 leading-tight">{t('admin_theme_reset_desc')}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetTheme}
                            className="h-7 text-[10px] bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20 hover:text-red-300 px-2"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" /> {t('admin_reset_default')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Primary Color */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.primary }}></span>
                            {t('admin_primary_color')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                            />
                            <Input
                                value={settings.theme.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Primary Hover */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.primaryHover }}></span>
                            {t('admin_theme_primary_hover')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.primaryHover}
                                onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                            />
                            <Input
                                value={settings.theme.primaryHover}
                                onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Background */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.bg }}></span>
                            {t('admin_bg_color')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.bg}
                                onChange={(e) => handleColorChange('bg', e.target.value)}
                            />
                            <Input
                                value={settings.theme.bg}
                                onChange={(e) => handleColorChange('bg', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Text Foreground */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.text }}></span>
                            {t('admin_theme_text_fg')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.text}
                                onChange={(e) => handleColorChange('text', e.target.value)}
                            />
                            <Input
                                value={settings.theme.text}
                                onChange={(e) => handleColorChange('text', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Border Color */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.border }}></span>
                            {t('admin_theme_border_color')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.border}
                                onChange={(e) => handleColorChange('border', e.target.value)}
                            />
                            <Input
                                value={settings.theme.border}
                                onChange={(e) => handleColorChange('border', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Card Background */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <Label className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.card }}></span>
                            {t('admin_theme_card_bg')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-10 h-8 p-1 cursor-pointer shrink-0 bg-black/40 border-white/10"
                                value={settings.theme.card}
                                onChange={(e) => handleColorChange('card', e.target.value)}
                            />
                            <Input
                                value={settings.theme.card}
                                onChange={(e) => handleColorChange('card', e.target.value)}
                                className="font-mono text-[10px] uppercase h-8 bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
