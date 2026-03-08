import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { ListFilter, X } from "lucide-react";
import { FilterState, toggleArrayValue } from "./filter-utils";

interface FiltersPopoverProps {
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

export default function FiltersPopover({
    filters,
    setFilters,
    availableCategories,
    maxPrice,
    availableSizes,
    availableColors,
    onApply,
    onClear,
    isLoading = false,
}: FiltersPopoverProps) {
    const { t, lang } = useLanguage();
    const dir = lang === "ar" ? "rtl" : "ltr";
    const [open, setOpen] = React.useState(false);

    const handleApply = () => {
        onApply();
        setOpen(false);
    };

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
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="md:hidden border-border bg-muted text-foreground hover:bg-background hover:border-foreground transition-all"
                >
                    <ListFilter className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {t("filters_title")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] max-h-[80vh] overflow-y-auto" align="start" dir={dir}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">{t("filters_title")}</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
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
                                        id={`mob-cat-${category}`}
                                        checked={filters.categories.includes(category)}
                                        onCheckedChange={() => handleCategoryToggle(category)}
                                    />
                                    <Label
                                        htmlFor={`mob-cat-${category}`}
                                        className="text-sm font-medium leading-none text-foreground/80"
                                    >
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
                                                : "border-border bg-background text-foreground hover:border-foreground focus:border-foreground"
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

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClear}
                            className="flex-1 border-border text-foreground hover:bg-muted"
                        >
                            {t("filters_clear")}
                        </Button>
                        <Button
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-bold uppercase transition-all"
                        >
                            {t("filters_apply")}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
