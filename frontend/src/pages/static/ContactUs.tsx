import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { CartItem, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useLanguage } from '@/i18n/LanguageContext';

import { TextDisperse } from '@/components/ui/text-disperse';
import { EditableText } from '@/components/ui/editable-text';

const ContactUs = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { settings } = useSiteSettings();
    const { t } = useLanguage();
    const contactInfo = settings.contactInfo || { email: '', phone: '', address: '', officeHours: '' };
    const [cart] = useStorageState<CartItem[]>('cart', []);
    const [wishlist] = useStorageState<string[]>('wishlist', []);
    const [user, setUser] = useStorageState<User | null>('user', null);
    const [loading, setLoading] = React.useState(false);

    const handleNavigate = (path: string | null) => {
        if (path) navigate(path);
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast({
                title: t('messageSent'),
                description: t('messageSentDesc'),
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
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
                <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary"><EditableText k="contact_title" as="span" /></h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto"><EditableText k="contact_subtitle" as="span" /></p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary/10 rounded-lg">
                                    <Mail className="text-secondary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-wide"><EditableText k="contact_email" as="span" /></h3>
                                    <p className="text-muted-foreground text-sm"><EditableText k="contact_email_desc" as="span" /></p>
                                    <p className="text-primary font-bold mt-1">{contactInfo.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary/10 rounded-lg">
                                    <MapPin className="text-secondary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-wide"><EditableText k="contact_office" as="span" /></h3>
                                    <p className="text-muted-foreground text-sm"><EditableText k="contact_office_desc" as="span" /></p>
                                    <p className="text-primary font-bold mt-1">{contactInfo.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary/10 rounded-lg">
                                    <Phone className="text-secondary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-wide"><EditableText k="contact_phone" as="span" /></h3>
                                    <p className="text-muted-foreground text-sm">{contactInfo.officeHours}</p>
                                    <div className="text-primary font-bold mt-1">
                                        <TextDisperse className="text-base text-primary font-bold">
                                            {contactInfo.phone || "+20 123 456 7890"}
                                        </TextDisperse>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-lg space-y-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><EditableText k="contact_firstName" as="span" /></label>
                                    <input required className="w-full bg-muted border border-border rounded p-3 text-sm focus:border-secondary outline-none" placeholder={t('contact_firstName')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><EditableText k="contact_lastName" as="span" /></label>
                                    <input required className="w-full bg-muted border border-border rounded p-3 text-sm focus:border-secondary outline-none" placeholder={t('contact_lastName')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><EditableText k="contact_email" as="span" /></label>
                                <input required type="email" className="w-full bg-muted border border-border rounded p-3 text-sm focus:border-secondary outline-none" placeholder="you@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><EditableText k="contact_message" as="span" /></label>
                                <textarea required rows={4} className="w-full bg-muted border border-border rounded p-3 text-sm focus:border-secondary outline-none resize-none" placeholder={t('contact_message')} />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-widest py-6">
                                {loading ? <EditableText k="contact_sending" as="span" /> : <><Send size={16} className="mr-2" /> <EditableText k="contact_sendMessage" as="span" /></>}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default ContactUs;
