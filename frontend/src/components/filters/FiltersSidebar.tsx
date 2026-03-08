import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { FilterState, toggleArrayValue } from "./filter-utils";

interface FiltersSidebarProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    availableCategories: string[];
    maxPrice: number;
    availableSizes: string[];
    availableColors: string[];
    onApply: () => void;
    onClear: () => void;
    isLoading?: boolean;
}

export default function FiltersSidebar({
    filters,
    setFilters,
    availableCategories,
    maxPrice,
    availableSizes,
    availableColors,
    onApply,
    onClear,
    isLoading = false,
}: FiltersSidebarProps) {
    const { t, lang } = useLanguage();
    const dir = lang === "ar" ? "rtl" : "ltr";

    const handleCategoryToggle = (category: string) => {
        setFilters({
            ...filters,
            categories: toggleArrayValue(filters.categories, category),
        });
    };

    const handlePriceChange = (value: number[]) => {
        setFilters({
            ...filters,
            price: [value[0], value[1]],
        });
    };

    const handleSizeToggle = (size: string) => {
        setFilters({
            ...filters,
            sizes: toggleArrayValue(filters.sizes, size),
        });
    };

    const handleColorToggle = (color: string) => {
        setFilters({
            ...filters,
            colors: toggleArrayValue(filters.colors, color),
        });
    };

    const handleStockToggle = (checked: boolean) => {
        setFilters({
            ...filters,
            inStockOnly: checked,
        });
    };

    return (
        <Card className="rounded-lg border border-border bg-card p-6 shadow-sm h-fit top-4 sticky w-64 shrink-0 hidden md:block" dir={dir}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">{t("filters_title")}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs uppercase font-bold"
                >
                    {t("filters_clear")}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Categories */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground uppercase">{t("filters_category")}</Label>
                    <div className="space-y-2">
                        {availableCategories.map((category) => (
                            <div key={category} className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox
                                    id={`cat-${category}`}
                                    checked={filters.categories.includes(category)}
                                    onCheckedChange={() => handleCategoryToggle(category)}
                                />
                                <Label
                                    htmlFor={`cat-${category}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80 cursor-pointer"
                                >
                                    {/* Translate category if key exists, else show raw */}
                                    {t(`category_${category.toLowerCase()}`)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Price */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-foreground uppercase">{t("filters_price")}</Label>
                        <span className="text-xs text-muted-foreground font-mono">
                            {t("filters_fromTo")
                                .replace('{{min}}', filters.price[0].toLocaleString())
                                .replace('{{max}}', filters.price[1].toLocaleString())
                            } EGP
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={maxPrice}
                        step={50}
                        value={filters.price}
                        onValueChange={handlePriceChange}
                        className="py-4"
                    />
                </div>

                <Separator className="bg-border/50" />

                {/* Sizes */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground uppercase">{t("filters_size")}</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                            const isSelected = filters.sizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => handleSizeToggle(size)}
                                    className={cn(
                                        "h-8 min-w-[2rem] px-2 rounded border text-xs font-bold transition-all",
                                        isSelected
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border bg-background text-foreground hover:border-foreground"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Colors */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground uppercase">{t("filters_color")}</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                            const isSelected = filters.colors.includes(color);
                            return (
                                <button
                                    key={color}
                                    onClick={() => handleColorToggle(color)}
                                    className={cn(
                                        "h-6 w-6 rounded-full border shadow-sm transition-all",
                                        isSelected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "border-border hover:scale-110"
                                    )}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
                                />
                            );
                        })}
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* In Stock */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                        id="inStock"
                        checked={filters.inStockOnly}
                        onCheckedChange={handleStockToggle}
                    />
                    <Label htmlFor="inStock" className="text-sm font-bold text-foreground cursor-pointer">
                        {t("filters_stockOnly")}
                    </Label>
                </div>

            </div>
        </Card>
    );
}
