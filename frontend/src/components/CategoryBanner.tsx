import * as React from 'react';

interface CategoryBannerProps {
  selectedCategory: string | null;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ selectedCategory }) => {
  const title = selectedCategory ? `${selectedCategory} Highlights` : 'Curated Collections';
  const subtitle = selectedCategory ? `Top picks in ${selectedCategory}` : 'Fresh arrivals across all categories';

  return (
    <div className="relative w-full h-[160px] md:h-[200px] overflow-hidden rounded-md bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))] to-[hsl(var(--secondary))] border border-border shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" aria-hidden />
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      <div className="relative h-full flex items-center px-6 md:px-10 text-primary-foreground">
        <div className="max-w-xl">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-2 text-secondary">{subtitle}</p>
          <h2 className="text-2xl md:text-4xl font-black leading-tight uppercase tracking-tighter">{title}</h2>
          <p className="text-[11px] md:text-xs text-primary-foreground/80 mt-3 max-w-md">Browse our premium selection of high-quality apparel.</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
