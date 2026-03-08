
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight, Sparkles, MoveRight } from 'lucide-react';
import { EditableSection } from '@/components/ui/editable-section';
import { EditableText } from '@/components/ui/editable-text';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import WebGLHero from '../components/WebGLHero';
import { useStorageState } from '@/utils/storage';

// --- Hero Slide Data ---


// --- Bento Grid Data ---
import { useSiteSettings } from '@/config/SiteSettingsContext';

import { useLanguage } from '@/i18n/LanguageContext';

const GatewayPage = () => {
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const { t } = useLanguage();
    const [user] = useStorageState<any>('user', null);

    // Placeholder functions for Header props
    const handleSearch = (query) => {
        console.log("Search query:", query);
        navigate(`/shop?search=${query}`);
    };

    const handleNavigate = (category) => {
        navigate(`/shop/${category || ''}`);
    };

    const handleLogout = () => {
        import('@/utils/storage').then(({ removeStorageItem }) => {
            removeStorageItem('user');
            navigate('/');
        });
    };

    // Use settings or fallback to empty array if not yet loaded
    const categories = settings.gatewayCategories || [];

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header
                onSearchChange={handleSearch}
                onNavigate={handleNavigate}
                onAccount={() => navigate('/profile')}
                onLogout={handleLogout}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />

            <main className="">
                {/* --- 1. Cinematic Hero Slider --- */}
                <EditableSection id="hero" title="Hero Section">
                    <WebGLHero onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
                </EditableSection>

                {/* --- 2. Infinite Ticker --- */}
                <div className="bg-black text-white overflow-hidden py-3 border-y border-white/10">
                    <div className="flex whitespace-nowrap animate-marquee">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="mx-8 text-xs font-bold uppercase tracking-widest flex items-center gap-4">
                                <EditableText k="gateway_ticker" as="span" /> <Sparkles size={12} />
                            </span>
                        ))}
                    </div>
                </div>

                {/* --- 3. Bento Grid - Trending --- */}
                <EditableSection id="trending-categories" title="Trending Categories">
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <EditableText k="gateway_trending_title" as="h2" className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-primary" />
                                <EditableText k="gateway_trending_desc" as="p" className="text-muted-foreground mt-2 uppercase tracking-widest text-[10px] font-bold" />
                            </div>
                            <Button variant="link" onClick={() => navigate('/shop')} className="hidden md:flex text-primary font-bold uppercase tracking-widest gap-2 text-xs">
                                <EditableText k="gateway_view_all" as="span" /> <MoveRight size={14} />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 auto-rows-[250px]">
                            {categories.filter(cat => !cat.hidden).map((cat, idx) => (
                                <motion.div
                                    key={cat.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(cat.link)}
                                    className={`
                        group relative cursor-pointer overflow-hidden
                        ${cat.colSpan} ${cat.rowSpan}
                        bg-muted
                    `}
                                >
                                    {/* Background */}
                                    {cat.customContent ? (
                                        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                                            <Sparkles size={48} className="mb-4 animate-pulse opacity-50" />
                                            <span className="text-4xl font-black uppercase tracking-tighter mb-2">{cat.label}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t('gateway_trending_title')}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={cat.image}
                                                alt={cat.label}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                                        </>
                                    )}

                                    {/* Content Overlay */}
                                    {!cat.customContent && (
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                            <h3 className={`text-2xl font-black uppercase tracking-tighter text-white transform transition-transform duration-500 group-hover:-translate-y-1 ${cat.isLarge ? 'md:text-4xl' : ''}`}>
                                                {cat.label}
                                            </h3>
                                            <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                                <span className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1.5 mt-2">
                                                    {t('gateway_shop')} <ArrowRight size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </EditableSection>

                {/* --- 4. Brand Philosophy / Full Width --- */}
                <EditableSection id="brand-philosophy" title="Brand Philosophy">
                    <section className="bg-primary text-primary-foreground py-32 px-4 text-center">
                        <div className="max-w-4xl mx-auto">
                            <Sparkles className="mx-auto mb-8 text-secondary animate-pulse" size={48} />
                            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] whitespace-pre-wrap">
                                <EditableText k="gateway_brand_title" as="span" />
                            </h2>
                            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed mb-12">
                                <EditableText k="gateway_brand_desc" as="span" />
                            </p>
                            <Button
                                onClick={() => navigate('/shop')}
                                className="bg-secondary text-secondary-foreground hover:bg-white hover:text-primary px-12 py-8 text-sm font-black uppercase tracking-widest rounded-none transition-all"
                            >
                                <EditableText k="gateway_brand_btn" as="span" />
                            </Button>
                        </div>
                    </section>
                </EditableSection>

            </main >
            <Footer onNavigate={(cat) => navigate(`/shop/${cat || ''}`)} />
        </div >
    );
};

export default GatewayPage;
