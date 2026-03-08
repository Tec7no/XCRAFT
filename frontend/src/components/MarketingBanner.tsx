
import React from 'react';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { X } from 'lucide-react';

export default function MarketingBanner() {
    const { settings } = useSiteSettings();
    const { lang } = useLanguage();
    const [isVisible, setIsVisible] = React.useState(true);

    if (!settings.marketing?.enableTopBanner || !isVisible) return null;

    let text = settings.translations[lang]?.[settings.marketing.topBannerTextKey] || "Welcome!";

    // Dynamic replacement for Free Shipping Threshold
    const threshold = settings.shippingConfig?.freeShippingThreshold || 1000;
    text = text.replace('500', threshold.toLocaleString())
        .replace('{{threshold}}', threshold.toLocaleString());

    return (
        <div className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest py-2 px-4 text-center relative animate-in slide-in-from-top duration-500">
            <span>{text}</span>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 p-1"
            >
                <X size={12} />
            </button>
        </div>
    );
}
