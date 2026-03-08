import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/config/SiteSettingsContext';

import { EditableText } from '@/components/ui/editable-text';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const [user, setUser] = useStorageState<User | null>('user', null);

    return (
        <div className="min-h-screen bg-background flex flex-col">
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
                        <EditableText k="legal_privacy_title" defaultValue="Privacy Policy" as="span" />
                    </h1>
                    <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: settings.legal?.privacyPolicy || '<p>Content not available.</p>' }}
                    />
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default PrivacyPolicy;
