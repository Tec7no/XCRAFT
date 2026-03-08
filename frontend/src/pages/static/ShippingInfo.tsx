import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

import { useSiteSettings } from '@/config/SiteSettingsContext';

import { EditableText } from '@/components/ui/editable-text';

const ShippingInfo = () => {
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const { t, lang } = useLanguage();
    const config = settings.shippingConfig || { freeShippingThreshold: 1000, processingDays: '1-2', deliveryDays: '3-5', flatRateFee: 50 };

    const [user, setUser] = useStorageState<User | null>('user', null);

    return (
        <div className="min-h-screen bg-background flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Header
                onSearchChange={() => { }}
                onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')}
                onAccount={() => navigate('/profile')}
                onLogout={() => { setUser(null); navigate('/'); }}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />
            <main className="flex-grow pt-10 pb-20 px-4">
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">
                        <EditableText k="shipping_title" defaultValue={t('shipping_title')} as="span" />
                    </h1>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        <h3><EditableText k="shipping_delivery_title" defaultValue={t('shipping_delivery_title')} as="span" /></h3>
                        <p><EditableText k="shipping_delivery_desc" defaultValue={t('shipping_delivery_desc')} as="span" /></p>

                        <h3><EditableText k="shipping_costs_title" defaultValue={t('shipping_costs_title')} as="span" /></h3>
                        <p>{t('shipping_costs_free').replace('{{amount}}', config.freeShippingThreshold.toString())} {t('shipping_costs_flat').replace('{{amount}}', config.freeShippingThreshold.toString())}</p>

                        <h3><EditableText k="shipping_times_title" defaultValue={t('shipping_times_title')} as="span" /></h3>
                        <p>{t('shipping_times_desc').replace('{{process}}', config.processingDays + (lang === 'ar' ? ' أيام عمل' : ' business days')).replace('{{delivery}}', config.deliveryDays + (lang === 'ar' ? ' أيام عمل' : ' business days'))}</p>

                        <h3><EditableText k="shipping_tracking_title" defaultValue={t('shipping_tracking_title')} as="span" /></h3>
                        <p><EditableText k="shipping_tracking_desc" defaultValue={t('shipping_tracking_desc')} as="span" /></p>
                    </div>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default ShippingInfo;
