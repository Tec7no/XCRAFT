import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";

// Register the plugin if we want to use specific scrollTo features
// But we can also animate the scrollTo property directly if the plugin is available
// For simplicity in this environment, we'll use window.scrollTo wrapped in GSAP

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
}

/**
 * Custom smooth scroll to an element using GSAP for a "premium" feel.
 * @param targetId The ID of the element to scroll to
 * @param offset Optional offset from the top
 */
export const scrollToElement = (targetId: string, offset: number = 0) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    // Use GSAP's ScrollToPlugin if registered, otherwise direct animation
    gsap.to(window, {
        duration: 1.5,
        scrollTo: { y: element.offsetTop - offset, autoKill: true },
        ease: "power4.inOut"
    });
};
