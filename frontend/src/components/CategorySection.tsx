import * as React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import CategoryCards from './ui/category-cards';
import { EditableSection } from './ui/editable-section';

interface CategorySectionProps {
    onCategorySelect: (category: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategorySelect }) => {
    const { t, lang } = useLanguage();

    // Define categories with keys for editable content
    const categories = [
        {
            key: 'Men',
            titleKey: 'category_men',
            imageUrl: 'https://images.unsplash.com/photo-1625910513413-5fc6d0f35826?w=600&h=800&fit=crop'
        },
        {
            key: 'Women',
            titleKey: 'category_women',
            imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop'
        },
        {
            key: 'Kids',
            titleKey: 'category_kids',
            imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=800&fit=crop'
        },
    ];

    return (
        <EditableSection id="categories" title={t('section_categories')}>
            <CategoryCards
                titleKey="section_categories"
                categories={categories}
                onSelect={onCategorySelect}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
        </EditableSection>
    );
};

export default CategorySection;


