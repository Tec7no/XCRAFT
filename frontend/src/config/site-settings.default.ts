import { SiteSettings } from "./site-settings.types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
    version: 8,
    branding: {
        storeName: "Xcraft",
        logo: "/images/logo.png",
    },
    heroSlides: [
        {
            title: "XCRAFT CLOTHING",
            description: "Timeless fashion for the modern soul.",
            media: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "LUXURY BOUTIQUE",
            description: "Curated collections with uncompromising quality.",
            media: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
        }
    ],
    theme: {
        primary: "#000000",
        primaryHover: "#333333",
        bg: "#FFFFFF",
        text: "#000000",
        border: "#E5E5E5",
        card: "#FFFFFF",
    },
    translations: {
        en: {
            // Hero translations
            "hero_newCollection_pill": "New Collection",
            "hero_title": "Xcraft",
            "hero_subtitle": "Redefining Contemporary Fashion. Experience the ultimate quality.",
            "hero.exploreNow": "Explore Now",
            "hero_stat1_title": "Premium",
            "hero_stat1_desc": "Quality Materials",
            "hero_stat2_title": "Fast",
            "hero_stat2_desc": "Delivery & Support",
            // Navigation translations
            "nav.newArrivals": "New Arrivals",
            "nav.bestSellers": "Best Sellers",
            "nav.men": "Men",
            "nav.women": "Women",
            "nav.kids": "Kids",
            "nav.shopAll": "Full Collection",
            // Section titles
            "section.hero": "Hero",
            "section.featured": "Top Deals",
            "section.categories": "Categories",
            "section.bestSellers": "Best Sellers",
            "section.products": "Products",
            "section.newsletter": "Newsletter",
            "section.promoBar": "Promo Bar",
            // Marketing
            "marketing.topBanner": "Free Shipping on All Orders Over 500 EGP!",
        },
        ar: {
            // Hero translations
            "hero_newCollection_pill": "تشكيلة جديدة",
            "hero_title": "Xcraft",
            "hero_subtitle": "إعادة تعريف الموضة العصرية. اختبر الجودة بأعلى مستوى.",
            "hero.exploreNow": "اكتشف الآن",
            "hero_stat1_title": "فاخر",
            "hero_stat1_desc": "خامات عالية الجودة",
            "hero_stat2_title": "سريع",
            "hero_stat2_desc": "توصيل ودعم",
            // Navigation translations
            "nav.newArrivals": "الوصول الجديد",
            "nav.bestSellers": "الأكثر مبيعاً",
            "nav.men": "رجال",
            "nav.women": "نساء",
            "nav.kids": "أطفال",
            "nav.shopAll": "كل المنتجات",
            // Section titles
            "section.hero": "البطل",
            "section.featured": "أفضل العروض",
            "section.categories": "الأقسام",
            "section.bestSellers": "الأكثر مبيعاً",
            "section.products": "المنتجات",
            "section.newsletter": "النشرة البريدية",
            "section.promoBar": "شريط العروض",
            // Marketing
            "marketing.topBanner": "شحن مجاني لجميع الطلبات فوق 500 جنيه!",
        },
    },
    hero: {
        pillKey: "hero_newCollection_pill",
        titleKey: "hero_title",
        subtitleKey: "hero_subtitle",
        ctaKey: "hero.exploreNow",
        ctaScrollTargetId: "home-products",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
        ],
    },
    // Phase 2: Layout configuration
    layout: {
        sectionsOrder: ["hero", "featured", "categories", "bestSellers", "products"],
        sectionsVisibility: {
            hero: true,
            featured: true,
            categories: true,
            bestSellers: true,
            products: true,
            newsletter: true,
            promoBar: true,
        },
    },
    // Phase 2: Navigation configuration
    nav: {
        items: [
            { id: "new_arrivals", labelKey: "nav.newArrivals", href: "/shop/new", visible: true },
            { id: "best_sellers", labelKey: "nav.bestSellers", href: "/shop/best-sellers", visible: true },
            { id: "men", labelKey: "nav.men", href: "/shop/men", visible: true },
            { id: "women", labelKey: "nav.women", href: "/shop/women", visible: true },
            { id: "kids", labelKey: "nav.kids", href: "/shop/kids", visible: true },
            { id: "shop_all", labelKey: "nav.shopAll", href: "/shop", visible: true },
        ],
    },
    marketing: {
        enableTopBanner: true,
        topBannerTextKey: "marketing.topBanner",
        enableNewsletterPopup: true
    },
    banners: {
        topBannerText: {
            en: "Free Shipping on All Orders Over 500 EGP!",
            ar: "شحن مجاني لجميع الطلبات فوق 500 جنيهاً"
        },
        announcementText: {
            en: "Shop the latest trends with best prices",
            ar: "تسوق أحدث الصيحات بأفضل الأسعار"
        }
    },

    // --- Admin Content Defaults ---
    gatewayCategories: [
        {
            id: 'women-collection',
            label: 'Women\'s Collection',
            labelKey: 'nav.women',
            image: 'https://images.unsplash.com/photo-1618245318763-a15156d6b23c?q=80&w=1000&auto=format&fit=crop',
            link: '/shop/women',
            colSpan: 'col-span-1 md:col-span-1',
            rowSpan: 'row-span-1'
        },
        {
            id: 'men-collection',
            label: 'Men\'s Collection',
            labelKey: 'nav.men',
            image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
            link: '/shop/men',
            colSpan: 'col-span-1 md:col-span-1',
            rowSpan: 'row-span-2'
        },
        {
            id: 'new-arrivals',
            label: 'New Arrivals',
            labelKey: 'nav.newArrivals',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
            link: '/shop/new',
            colSpan: 'col-span-1 md:col-span-2',
            rowSpan: 'row-span-1',
            isLarge: true
        },
        {
            id: 'best-sellers',
            label: 'Best Sellers',
            labelKey: 'nav.bestSellers',
            image: 'https://images.unsplash.com/warning-sale-red-bg.jpg',
            link: '/shop/best-sellers',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1',
            customContent: true
        },
        {
            id: 'kids-collection',
            label: 'Kids & Baby',
            labelKey: 'nav.kids',
            image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1000&auto=format&fit=crop',
            link: '/shop/kids',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1'
        }
    ],
    contactInfo: {
        email: 'support@xcraft.com',
        phone: '+20 100 123 4567',
        address: '100 Smart Village, Cairo, Egypt',
        officeHours: 'Mon-Fri from 8am to 5pm.',
        paymentPhone: '01xxxxxxxxx' // Default Instapay/VodafoneCash number
    },
    faqs: [
        {
            id: 'shipping',
            question: "How long does shipping take?",
            answer: "Standard shipping takes 3-5 business days within major cities. Rural areas may take up to 7 business days.",
            visible: true
        },
        {
            id: 'return-policy',
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for all unworn items in their original packaging. Return shipping is free for exchanges.",
            visible: true
        },
        {
            id: 'intl-shipping',
            question: "Do you ship internationally?",
            answer: "Currently we only ship within Egypt. We are working on expanding our delivery network soon.",
            visible: true
        },
        {
            id: 'tracking',
            question: "How can I track my order?",
            answer: "Once your order ships, you will receive an email with a tracking link. You can also view status in 'My Orders' if you have an account.",
            visible: true
        },
        {
            id: 'change-order',
            question: "Can I change my order after placing it?",
            answer: "We process orders quickly, but if you contact us within 1 hour of placing the order, we may be able to modify it.",
            visible: true
        }
    ],
    shippingConfig: {
        freeShippingThreshold: 1000,
        processingDays: '1-2 business days',
        deliveryDays: '3-5 business days',
        flatRateFee: 50 // Default assumption
    },
    socialLinks: [
        { id: 'fb', platform: 'Facebook', url: 'https://facebook.com/xcraft', icon: 'Facebook' },
        { id: 'ig', platform: 'Instagram', url: 'https://instagram.com/xcraft', icon: 'Instagram' },
        { id: 'tw', platform: 'Twitter', url: 'https://twitter.com/xcraft', icon: 'Twitter' },
        { id: 'yt', platform: 'YouTube', url: 'https://youtube.com/@xcraft', icon: 'Youtube' }
    ],
    legal: {
        privacyPolicy: `
            <p>Last updated: February 1, 2026</p>
            <h3>1. Introduction</h3>
            <p>Welcome to Xcraft. We respect your privacy and are committed to protecting your personal data.</p>
            <h3>2. Data We Collect</h3>
            <p>We may collect personal data such as your name, email address, phone number, and shipping address when you place an order or create an account.</p>
            <h3>3. How We Use Your Data</h3>
            <p>We use your data to process orders, manage your account, and send you updates about your order status.</p>
            <h3>4. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal data from unauthorized access or disclosure.</p>
            <h3>5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at support@xcraft.com.</p>
        `,
        termsOfService: `
            <p>Last updated: January 24, 2026</p>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using our website, you agree to be bound by these Terms of Service.</p>
            <h3>2. Purchases</h3>
            <p>If you wish to purchase any product, you may be asked to supply certain information relevant to your purchase.</p>
            <h3>3. Content</h3>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.</p>
            <h3>4. Changes</h3>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time.</p>
        `
    },
    footer: {
        columns: [
            {
                id: 'explore',
                title: 'Explore',
                links: [
                    { id: 'men', label: 'Men\'s Fashion', href: '/shop/men' },
                    { id: 'kids', label: 'Kids\' Collection', href: '/shop/kids' }
                ]
            },
            {
                id: 'support',
                title: 'Support',
                links: [
                    { id: 'help', label: 'Help Center (FAQ)', href: '/faq' },
                    { id: 'contact', label: 'Contact Support', href: '/contact-us' },
                    { id: 'stores', label: 'Store Locator', href: '/store-locator' },
                    { id: 'shipping', label: 'Shipping Info', href: '/shipping-info' },
                    { id: 'track', label: 'Track My Order', href: '/profile' }
                ]
            }
        ]
    }
};
