import * as React from 'react';
import { ChevronRight, Home } from '../icons';
import { useLanguage } from '@/i18n/LanguageContext';
import { EditableText } from './editable-text';
import { useNavigate } from 'react-router-dom';


export interface BreadcrumbItem {
    label: React.ReactNode;
    href?: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Helper to check if a ReactNode is our specific Home EditableText
    const isHomeNode = (node: React.ReactNode) => {
        if (!node) return false;
        if (node === 'Home' || node === t('nav_home')) return true;
        if (React.isValidElement(node) && (node.props as any)?.k === 'nav_home') return true;
        return false;
    };

    const shouldShowHome = items.length === 0 || !isHomeNode(items[0].label);

    return (
        <nav className={`flex items-center text-xs md:text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* Home Icon */}
                <li className="flex items-center">
                    {shouldShowHome && (
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="hover:text-primary transition-colors flex items-center"
                            >
                                <Home size={14} className="mr-1 rtl:ml-1" />
                                <span className='hidden sm:inline'><EditableText k="nav_home" as="span" /></span>
                            </button>
                            <ChevronRight size={14} className="mx-2 text-muted-foreground/50 rtl:rotate-180" />
                        </div>
                    )}
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {isLast ? (
                                <span className="font-semibold text-foreground truncate max-w-[150px] md:max-w-xs" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    onClick={item.onClick}
                                    className="hover:text-primary transition-colors hover:underline underline-offset-4"
                                >
                                    {item.label}
                                </button>
                            )}

                            {!isLast && (
                                <ChevronRight size={14} className="mx-2 text-muted-foreground/50 rtl:rotate-180" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
