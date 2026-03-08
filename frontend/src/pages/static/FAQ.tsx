import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { CartItem, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FaqAccordion } from '@/components/ui/faq-chat-accordion';
import { Separator } from '@/components/ui/separator';

import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';

import { EditableText } from '@/components/ui/editable-text';

const FAQ = () => {
    const navigate = useNavigate();
    const { settings } = useSiteSettings();
    const { t } = useLanguage();
    // Use settings or defaults (which should be populated)
    const faqs = settings.faqs || [];

    // Filter out invisible FAQs if we want to respect the 'visible' flag
    const visibleFaqs = faqs.filter(f => f.visible !== false);

    const [cart] = useStorageState<CartItem[]>('cart', []);
    const [wishlist] = useStorageState<string[]>('wishlist', []);
    const [user, setUser] = useStorageState<User | null>('user', null);

    const handleNavigate = (path: string | null) => {
        if (path) navigate(path);
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                onSearchChange={() => { }}
                onNavigate={handleNavigate}
                onAccount={() => navigate('/profile')}
                onLogout={handleLogout}
                onOrders={() => navigate('/profile?tab=orders')}
                user={user}
            />
            <main className="flex-grow pt-10 pb-20 px-4">
                <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-serif font-medium uppercase tracking-tighter text-[#0D0D0D]"><EditableText k="faq_title" as="span" /></h1>
                        <Separator className="w-24 mx-auto bg-[#C8A96A] h-0.5" />
                        <p className="text-muted-foreground pt-2"><EditableText k="faq_subtitle" as="span" /></p>
                    </div>

                    <div className="space-y-4">
                        <FaqAccordion
                            data={visibleFaqs.map((faq, i) => ({
                                id: i + 1,
                                question: faq.question,
                                answer: faq.answer,
                            }))}
                            className="bg-transparent p-0"
                            timestamp={undefined}
                            questionClassName="bg-white border border-[#D8D2C8] hover:bg-white text-[#0D0D0D] font-bold uppercase tracking-wide text-sm py-4 px-6 rounded-lg shadow-sm"
                            answerClassName="bg-[#F8F5F1] text-muted-foreground w-full max-w-none text-sm leading-relaxed border border-[#D8D2C8] shadow-sm"
                        />
                    </div>

                    <div className="bg-[#F8F5F1] rounded-xl p-10 text-center space-y-6 border border-[#D8D2C8]">
                        <HelpCircle className="mx-auto text-[#C8A96A]" size={40} />
                        <h3 className="font-serif font-bold text-2xl text-[#0D0D0D]"><EditableText k="faq_stillHaveQuestions" as="span" /></h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            <EditableText k="faq_cantFind" as="span" /> <a href="/contact-us" className="text-primary font-bold underline"><EditableText k="faq_contactSupport" as="span" /></a>
                        </p>        <button
                            onClick={() => navigate('/contact-us')}
                            className="bg-[#0D0D0D] text-white px-8 py-3 rounded-none font-bold uppercase text-xs tracking-widest hover:bg-[#C8A96A] hover:text-[#0D0D0D] transition-all shadow-lg"
                        >
                            <EditableText k="faq_getInTouch" as="span" />
                        </button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};


export default FAQ;
