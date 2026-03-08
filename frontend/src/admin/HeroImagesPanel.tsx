import React, { useState } from "react";
import { useEditMode } from "@/admin/EditModeContext";
import { useSiteSettings } from "@/config/SiteSettingsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface HeroSlide {
    title: string;
    description: string;
    media: string;
}

export function HeroImagesPanel() {
    const { isEditMode, canEdit } = useEditMode();
    const { settings, updateSettings } = useSiteSettings();
    const { lang } = useLanguage();

    // HARD PROTECTION: Only render for admin users in edit mode
    if (!isEditMode || !canEdit) return null;

    // Get hero slides from settings or use defaults
    const heroSlides: HeroSlide[] = settings.heroSlides || [
        {
            title: "SPLASH WOMAN",
            description: "Dive into the new summer collection.",
            media: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
        },
        {
            title: "GOLDEN HOUR",
            description: "Radiate elegance in every moment.",
            media: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80"
        },
        {
            title: "ETHEREAL GLOW",
            description: "Timeless fashion for the modern soul.",
            media: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
        },
    ];

    const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
        const updatedSlides = [...heroSlides];
        updatedSlides[index] = { ...updatedSlides[index], [field]: value };
        updateSettings((prev) => ({
            ...prev,
            heroSlides: updatedSlides,
        }));
    };

    const handleAddSlide = () => {
        const newSlide: HeroSlide = {
            title: "NEW SLIDE",
            description: "Add your description here",
            media: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
        };
        updateSettings((prev) => ({
            ...prev,
            heroSlides: [...heroSlides, newSlide],
        }));
    };

    const handleDeleteSlide = (index: number) => {
        if (heroSlides.length <= 1) {
            alert("You must have at least one hero slide!");
            return;
        }
        const updatedSlides = heroSlides.filter((_, i) => i !== index);
        updateSettings((prev) => ({
            ...prev,
            heroSlides: updatedSlides,
        }));
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSlideChange(index, 'media', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-4 w-4 text-[#C8A96A]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {lang === "ar" ? "صور البطل" : "Hero Images"}
                </h3>
            </div>

            <p className="text-xs text-gray-400">
                {lang === "ar"
                    ? "قم بتحميل الصور للعرض الدوار ثلاثي الأبعاد في الصفحة الرئيسية"
                    : "Upload images for the 3D WebGL hero carousel on the homepage"}
            </p>

            <div className="space-y-6">
                {heroSlides.map((slide, index) => (
                    <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#C8A96A] uppercase tracking-wider">
                                Slide {index + 1}
                            </span>
                            {heroSlides.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSlide(index)}
                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {/* Image Preview */}
                        <div className="relative w-full h-32 bg-black/40 rounded overflow-hidden border border-white/10">
                            <img
                                src={slide.media}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                {lang === "ar" ? "رابط الصورة" : "Image URL"}
                            </Label>
                            <Input
                                value={slide.media}
                                onChange={(e) => handleSlideChange(index, 'media', e.target.value)}
                                placeholder="https://..."
                                className="font-mono text-xs h-8 bg-black/40 border-white/10 text-white focus-visible:ring-[#C8A96A]/50 focus-visible:border-[#C8A96A]"
                            />
                        </div>

                        {/* Upload Button */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                {lang === "ar" ? "أو تحميل صورة" : "Or Upload Image"}
                            </Label>
                            <label className="flex items-center gap-2 px-3 py-2 bg-[#C8A96A]/10 hover:bg-[#C8A96A]/20 border border-[#C8A96A]/30 rounded cursor-pointer transition-colors">
                                <Upload className="h-3 w-3 text-[#C8A96A]" />
                                <span className="text-xs text-[#C8A96A] font-medium">
                                    {lang === "ar" ? "اختر ملف" : "Choose File"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(index, e)}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                {lang === "ar" ? "العنوان" : "Title"}
                            </Label>
                            <Input
                                value={slide.title}
                                onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                                className="text-xs h-8 bg-black/40 border-white/10 text-white focus-visible:ring-[#C8A96A]/50 focus-visible:border-[#C8A96A]"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                {lang === "ar" ? "الوصف" : "Description"}
                            </Label>
                            <Input
                                value={slide.description}
                                onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                                className="text-xs h-8 bg-black/40 border-white/10 text-white focus-visible:ring-[#C8A96A]/50 focus-visible:border-[#C8A96A]"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Slide Button */}
            <Button
                onClick={handleAddSlide}
                className="w-full bg-[#C8A96A]/10 hover:bg-[#C8A96A]/20 border border-[#C8A96A]/30 text-[#C8A96A] font-medium text-xs uppercase tracking-wider"
            >
                + Add Slide
            </Button>
        </div>
    );
}
