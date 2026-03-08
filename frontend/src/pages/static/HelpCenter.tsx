import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Package, Truck, RotateCcw, CreditCard, UserIcon, Mail } from 'lucide-react';

const categories = [
    { icon: UserIcon, title: 'Account & Profile', description: 'Manage your account, update personal info, and reset your password.', link: '/profile' },
    { icon: Package, title: 'Orders & Tracking', description: 'Track your orders, view order history, and manage returns.', link: '/profile?tab=orders' },
    { icon: Truck, title: 'Shipping & Delivery', description: 'Delivery times, shipping costs, and coverage areas.', link: '/shipping-info' },
    { icon: RotateCcw, title: 'Returns & Exchanges', description: 'Return policy, how to initiate a return, and exchange process.', link: '/faq' },
    { icon: CreditCard, title: 'Payment & Billing', description: 'Accepted payment methods, billing issues, and refunds.', link: '/faq' },
    { icon: Mail, title: 'Contact Us', description: 'Reach our support team directly for any other questions.', link: '/contact-us' },
];

import { EditableText } from '@/components/ui/editable-text';

const HelpCenter = () => {
    const navigate = useNavigate();
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
                <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
                    <div className="text-center space-y-4">
                        <HelpCircle className="mx-auto text-secondary" size={48} />
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">
                            <EditableText k="help_title" defaultValue="Help Center" as="span" />
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            <EditableText k="help_subtitle" defaultValue="How can we help you today? Browse the categories below or check our FAQ." as="span" />
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(cat.link)}
                                className="bg-card border border-border rounded-xl p-6 text-left space-y-3 shadow-sm hover:shadow-md hover:border-secondary/50 transition-all group"
                            >
                                <cat.icon size={28} className="text-secondary group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase tracking-wide text-sm text-primary">{cat.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                            </button>
                        ))}
                    </div>

                    <div className="bg-muted rounded-xl p-8 text-center space-y-4 border border-border">
                        <h3 className="font-black text-xl uppercase tracking-tight text-primary">
                            <EditableText k="help_cantFindTitle" defaultValue="Can't find what you need?" as="span" />
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            <EditableText k="help_cantFindDesc" defaultValue="Check our frequently asked questions or contact our support team." as="span" />
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <button
                                onClick={() => navigate('/faq')}
                                className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-primary/90 transition-colors"
                            >
                                <EditableText k="help_viewFAQ" defaultValue="View FAQ" as="span" />
                            </button>
                            <button
                                onClick={() => navigate('/contact-us')}
                                className="border border-primary text-primary px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <EditableText k="help_contactSupport" defaultValue="Contact Support" as="span" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default HelpCenter;
