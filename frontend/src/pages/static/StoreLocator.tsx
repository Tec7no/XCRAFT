import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

import { EditableText } from '@/components/ui/editable-text';

const StoreLocator = () => {
    const navigate = useNavigate();
    const [user, setUser] = useStorageState<User | null>('user', null);
    const { t, lang } = useLanguage();

    const stores = [
        {
            name: lang === 'ar' ? 'فرع وسط البلد' : 'Downtown Flagship',
            address: lang === 'ar' ? '123 شارع الرئيسي، وسط البلد، القاهرة' : '123 Main Street, Downtown, Cairo',
            phone: '+20 2 1234 5678',
            hours: lang === 'ar' ? 'السبت-الخميس: 10ص–10م، الجمعة: 12م–8م' : 'Mon–Sat: 10AM–10PM, Sun: 12PM–8PM',
        },
        {
            name: lang === 'ar' ? 'فرع سيتي ستارز' : 'City Stars Branch',
            address: lang === 'ar' ? 'مول سيتي ستارز، الدور 2، مصر الجديدة، القاهرة' : 'City Stars Mall, Floor 2, Heliopolis, Cairo',
            phone: '+20 2 2345 6789',
            hours: lang === 'ar' ? 'يومياً: 10ص–11م' : 'Daily: 10AM–11PM',
        },
        {
            name: lang === 'ar' ? 'مول مصر' : 'Mall of Egypt',
            address: lang === 'ar' ? 'مول مصر، الدور 1، مدينة 6 أكتوبر' : 'Mall of Egypt, Floor 1, 6th of October City',
            phone: '+20 2 3456 7890',
            hours: lang === 'ar' ? 'يومياً: 10ص–11م' : 'Daily: 10AM–11PM',
        },
        {
            name: lang === 'ar' ? 'فرع الإسكندرية' : 'Alexandria Branch',
            address: lang === 'ar' ? 'سان ستيفانو جراند بلازا، الإسكندرية' : 'San Stefano Grand Plaza, Alexandria',
            phone: '+20 3 4567 8901',
            hours: lang === 'ar' ? 'السبت-الخميس: 10ص–10م، الجمعة: 12م–8م' : 'Mon–Sat: 10AM–10PM, Sun: 12PM–8PM',
        },
    ];

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
                <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">
                            <EditableText k="stores_title" defaultValue={t('stores_title')} as="span" />
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            <EditableText k="stores_subtitle" defaultValue={t('stores_subtitle')} as="span" />
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stores.map((store, i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-black uppercase tracking-tight text-primary">{store.name}</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
                                        <span>{store.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="text-secondary shrink-0" />
                                        <span dir="ltr">{store.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock size={16} className="text-secondary mt-0.5 shrink-0" />
                                        <span>{store.hours}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default StoreLocator;
