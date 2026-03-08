import * as React from 'react';
import { EditableText } from './ui/editable-text';

interface AnnouncementMarqueeProps {
    textKey: string;
}

/**
 * GPU-optimized marquee component using CSS-only animation.
 * - Uses transform: translate3d for GPU acceleration
 * - Pauses on hover
 * - Respects prefers-reduced-motion
 * - No JS timers or intervals
 */
const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = React.memo(({ textKey }) => {
    // Check for performance mode on mount
    const isPerf = React.useMemo(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('perf'),
        []);

    if (isPerf) {
        return (
            <div className="bg-secondary text-secondary-foreground py-1.5 text-center">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    <EditableText k={textKey} as="span" />
                </span>
            </div>
        );
    }

    return (
        <div className="marquee bg-secondary text-secondary-foreground overflow-hidden">
            <div className="marquee__track">
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
                <span className="marquee__item"><EditableText k={textKey} as="span" /></span>
            </div>
        </div>
    );
});

AnnouncementMarquee.displayName = 'AnnouncementMarquee';

export default AnnouncementMarquee;

