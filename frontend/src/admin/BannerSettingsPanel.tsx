import React, { useState } from 'react';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Save, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function BannerSettingsPanel() {
    const { settings, updateSettings } = useSiteSettings();
    const { lang } = useLanguage();
    const { toast } = useToast();

    const [topBannerEn, setTopBannerEn] = useState(
        settings.banners?.topBannerText.en || 'Free Shipping on All Orders Over 500 EGP!'
    );
    const [topBannerAr, setTopBannerAr] = useState(
        settings.banners?.topBannerText.ar || 'شحن مجاني لجميع الطلبات فوق 500 جنيهاً'
    );
    const [announcementEn, setAnnouncementEn] = useState(
        settings.banners?.announcementText.en || 'Shop the latest trends with best prices'
    );
    const [announcementAr, setAnnouncementAr] = useState(
        settings.banners?.announcementText.ar || 'تسوق أحدث الصيحات بأفضل الأسعار'
    );

    const handleSave = () => {
        updateSettings(prev => ({
            ...prev,
            banners: {
                topBannerText: {
                    en: topBannerEn.trim(),
                    ar: topBannerAr.trim()
                },
                announcementText: {
                    en: announcementEn.trim(),
                    ar: announcementAr.trim()
                }
            }
        }));

        toast({
            title: lang === 'ar' ? 'تم الحفظ' : 'Saved',
            description: lang === 'ar'
                ? 'تم تحديث نصوص البانر بنجاح'
                : 'Banner texts updated successfully',
        });
    };

    return (
        <Card className="border-[#D8D2C8] bg-white">
            <CardHeader className="border-b border-[#D8D2C8]/50 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-[#C8A96A]" />
                    {lang === 'ar' ? 'إعدادات البانر' : 'Banner Settings'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Top Banner Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#C8A96A]" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0D0D0D]">
                            {lang === 'ar' ? 'البانر العلوي' : 'Top Banner'}
                        </h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {lang === 'ar' ? 'النص بالإنجليزية' : 'English Text'}
                        </label>
                        <Input
                            value={topBannerEn}
                            onChange={(e) => setTopBannerEn(e.target.value)}
                            placeholder="Free Shipping on All Orders Over 500 EGP!"
                            className="font-sans bg-background border-border focus:border-[#C8A96A]"
                            dir="ltr"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {lang === 'ar' ? 'النص بالعربية' : 'Arabic Text'}
                        </label>
                        <Input
                            value={topBannerAr}
                            onChange={(e) => setTopBannerAr(e.target.value)}
                            placeholder="شحن مجاني لجميع الطلبات فوق 500 جنيهاً"
                            className="font-sans bg-background border-border focus:border-[#C8A96A]"
                            dir="rtl"
                        />
                    </div>
                </div>

                <Separator className="bg-[#D8D2C8]" />

                {/* Announcement Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#C8A96A]" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0D0D0D]">
                            {lang === 'ar' ? 'شريط الإعلانات' : 'Announcement Bar'}
                        </h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {lang === 'ar' ? 'النص بالإنجليزية' : 'English Text'}
                        </label>
                        <Input
                            value={announcementEn}
                            onChange={(e) => setAnnouncementEn(e.target.value)}
                            placeholder="Shop the latest trends with best prices"
                            className="font-sans bg-background border-border focus:border-[#C8A96A]"
                            dir="ltr"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {lang === 'ar' ? 'النص بالعربية' : 'Arabic Text'}
                        </label>
                        <Input
                            value={announcementAr}
                            onChange={(e) => setAnnouncementAr(e.target.value)}
                            placeholder="تسوق أحدث الصيحات بأفضل الأسعار"
                            className="font-sans bg-background border-border focus:border-[#C8A96A]"
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-muted/30 rounded border border-border space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-3 w-3 text-[#C8A96A]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {lang === 'ar' ? 'معاينة' : 'Preview'}
                        </span>
                    </div>
                    <div className="text-xs text-foreground">
                        <div className="mb-2">
                            <span className="text-[#C8A96A] font-bold">Top Banner: </span>
                            {lang === 'ar' ? topBannerAr : topBannerEn}
                        </div>
                        <div>
                            <span className="text-[#C8A96A] font-bold">Announcement: </span>
                            {lang === 'ar' ? announcementAr : announcementEn}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full bg-[#0D0D0D] hover:bg-[#C8A96A] hover:text-[#0D0D0D] text-white font-bold uppercase tracking-wider"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
            </CardContent>
        </Card>
    );
}
