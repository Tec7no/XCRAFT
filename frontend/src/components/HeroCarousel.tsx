import * as React from 'react';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { EditableImage } from '@/components/ui/editable-image';

const SLIDE_INTERVAL = 6000; // Auto-advance every 6 seconds

// Hero images for SPLASH WOMAN theme - vibrant summer aesthetic
const heroImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80', // Woman in summer attire with sunglasses
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80', // Fashion summer collection
];

/**
 * Lightweight hero carousel using CSS scroll-snap.
 * - No heavy slider libraries
 * - Uses native scrolling + scroll-snap for smooth transitions
 * - Auto-advances with setInterval (no React state for slide index)
 * - Pauses on hover
 */
const HeroCarousel: React.FC = React.memo(() => {
    const { settings } = useSiteSettings();
    const displayImages = settings.hero?.images?.length ? settings.hero.images : heroImages;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const intervalRef = React.useRef<number | null>(null);
    const currentSlideRef = React.useRef(0);

    const startAutoplay = React.useCallback(() => {
        if (intervalRef.current) return;
        // Disable autoplay in performance mode
        if (document.documentElement.classList.contains('perf')) return;

        // Auto-advance
        intervalRef.current = window.setInterval(() => {
            const container = containerRef.current;
            if (!container) return;

            currentSlideRef.current = (currentSlideRef.current + 1) % displayImages.length;
            const scrollPosition = currentSlideRef.current * container.offsetWidth;

            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
        }, SLIDE_INTERVAL);
    }, [displayImages.length]);

    const stopAutoplay = React.useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        startAutoplay();
        return () => stopAutoplay();
    }, [startAutoplay, stopAutoplay]);

    return (
        <div
            ref={containerRef}
            className="hero-carousel"
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
            onTouchStart={stopAutoplay}
            onTouchEnd={startAutoplay}
        >
            {displayImages.map((src, index) => (
                <div key={index} className="hero-carousel__slide">
                    <EditableImage
                        path={['hero', 'images', index]}
                        alt={`Hero slide ${index + 1}`}
                        className="hero-carousel__image"
                    />
                </div>
            ))}
        </div>
    );
});

HeroCarousel.displayName = 'HeroCarousel';

export default HeroCarousel;
