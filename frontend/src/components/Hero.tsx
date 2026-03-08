import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { EditableText } from '@/components/ui/editable-text';
import HeroCarousel from './HeroCarousel';

interface HeroProps {
  onNavigate: (category: string | null) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const { hero } = settings;

  const handleScrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Background carousel */}
      <HeroCarousel />

      {/* Yellow/Gold overlay for SPLASH WOMAN theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/40 via-[#FFD700]/30 to-[#F0E68C]/40" />

      {/* Hero content - Left aligned for SPLASH WOMAN */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start z-10">
        <div className="max-w-2xl">
          {/* "THE NEW COLLECTION" label */}
          <EditableText
            k={hero.pillKey}
            as="p"
            className="text-xs md:text-sm font-semibold mb-6 tracking-[0.3em] uppercase text-[#3a2d23]"
          />

          {/* SPLASH WOMAN heading */}
          <div className="relative">
            <EditableText
              k={hero.titleKey || "hero_title"}
              as="h2"
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.9] tracking-tight uppercase text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] block whitespace-pre-wrap"
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={handleScrollToProducts}
            className="group px-8 md:px-12 py-3 md:py-4 bg-white text-[#3a2d23] font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#3a2d23] hover:text-white transition-all duration-300 shadow-xl rounded-none border-2 border-transparent hover:border-white"
          >
            <EditableText
              k={hero.ctaKey}
              as="span"
              className="group-hover:text-white"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

