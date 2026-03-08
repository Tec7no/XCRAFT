import * as React from 'react';
import { EditableText } from '@/components/ui/editable-text';
import { EditableSection } from '@/components/ui/editable-section';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStorageState } from '@/utils/storage';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
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
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <EditableSection id="about-us" title="About Us">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary mb-6">
                            <EditableText k="about_title" defaultValue="About Us" as="span" />
                        </h1>
                        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                            <p className="mb-4">
                                <EditableText
                                    k="about_p1"
                                    defaultValue="Welcome to XCRAFT. We are dedicated to providing the best quality apparel for the modern lifestyle. Our journey began with a simple idea: to create clothing that combines style, comfort, and durability."
                                    as="span"
                                />
                            </p>
                            <p className="mb-4">
                                <EditableText
                                    k="about_p2"
                                    defaultValue="Our team of designers works tirelessly to bring you the latest trends while maintaining timeless elegance. We believe that fashion is an expression of individuality, and our collections are designed to help you express yours."
                                    as="span"
                                />
                            </p>
                            <p>
                                <EditableText
                                    k="about_p3"
                                    defaultValue="Thank you for choosing us. We look forward to being a part of your journey."
                                    as="span"
                                />
                            </p>
                        </div>
                    </EditableSection>
                </div>
            </main>
            <Footer onNavigate={(cat) => navigate(cat ? `/shop/${cat}` : '/shop')} />
        </div>
    );
};

export default AboutUs;
