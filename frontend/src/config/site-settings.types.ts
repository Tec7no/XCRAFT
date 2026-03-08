
export interface ThemeTokens {
    primary: string;
    primaryHover: string;
    bg: string;
    text: string;
    border: string;
    card: string;
}

export interface HeroSettings {
    pillKey: string;
    titleKey: string;
    subtitleKey: string;
    ctaKey: string;
    ctaScrollTargetId: string;
    images: string[];
}

export interface HeroSlide {
    title: string;
    description: string;
    media: string;
}

export interface TranslationsBundle {
    en: Record<string, string>;
    ar: Record<string, string>;
}

// Phase 2: Navigation item configuration
export interface NavItem {
    id: string;
    labelKey: string;
    href: string;
    visible: boolean;
}

// Phase 2: Layout settings for section management
export interface LayoutSettings {
    sectionsOrder: string[];
    sectionsVisibility: Record<string, boolean>;
}

// Phase 2: Navigation settings
export interface NavSettings {
    items: NavItem[];
}

export interface MarketingSettings {
    enableTopBanner: boolean;
    topBannerTextKey: string;
    enableNewsletterPopup: boolean;
}

export interface BannerSettings {
    topBannerText: {
        en: string;
        ar: string;
    };
    announcementText: {
        en: string;
        ar: string;
    };
}

export interface BrandingSettings {
    storeName: string;
    logo?: string;
}

export interface SiteSettings {
    version: number;
    branding?: BrandingSettings;
    theme: ThemeTokens;
    translations: TranslationsBundle;
    hero: HeroSettings;
    // Phase 2: Layout and navigation
    layout?: LayoutSettings;
    nav?: NavSettings;
    marketing?: MarketingSettings;
    banners?: BannerSettings;

    // Admin Dashboard Content Control
    gatewayCategories?: GatewayCategoryCard[];
    contactInfo?: ContactInfo;
    faqs?: FAQItem[];
    shippingConfig?: ShippingConfig;
    socialLinks?: SocialLinks;
    legal?: LegalSettings;
    footer?: FooterSettings;
    heroSlides?: HeroSlide[];

    // Legacy feature flags (kept for compatibility)
    featureFlags?: {
        sections?: {
            heroVisible?: boolean;
            featuredVisible?: boolean;
            categoriesVisible?: boolean;
            bestSellersVisible?: boolean;
            productsVisible?: boolean;
        };
    };
    // Visual overrides for editable elements
    visualOverrides?: Record<string, {
        fontSize?: string;
        color?: string;
    }>;
}

export interface GatewayCategoryCard {
    id: string;
    labelKey: string; // or just label string if we want direct text
    label?: string; // fallback
    image: string;
    link: string;
    colSpan: string;
    rowSpan: string;
    isLarge?: boolean;
    customContent?: boolean; // simplistic flag for now
    hidden?: boolean;
}

export interface ContactInfo {
    email: string;
    phone: string;
    address: string;
    officeHours: string;
    paymentPhone?: string; // Instapay/VodafoneCash number for checkout
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    visible: boolean;
}

export interface ShippingConfig {
    freeShippingThreshold: number;
    processingDays: string;
    deliveryDays: string;
    flatRateFee: number;
}

export interface SocialLinkItem {
    id: string;
    platform: string;
    url: string;
    icon: string;
}

export type SocialLinks = SocialLinkItem[];

export interface LegalSettings {
    privacyPolicy: string;
    termsOfService: string;
}

export interface FooterLink {
    id: string;
    label: string;
    href: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
}

export interface FooterSettings {
    columns: FooterColumn[];
}
