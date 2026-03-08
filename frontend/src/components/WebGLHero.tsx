import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollToPlugin);
}
import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { useNavigate } from 'react-router-dom';
import { EditableText } from './ui/editable-text';

const SLIDER_CONFIG = {
    settings: {
        transitionDuration: 2.5,
        autoSlideSpeed: 5000,
        currentEffect: "glass",
        speedMultiplier: 1.0,
        distortionStrength: 1.0,
        globalIntensity: 1.0,
        // Glass preset
        glassRefractionStrength: 1.0,
        glassChromaticAberration: 1.0,
        glassBubbleClarity: 1.0,
        glassEdgeGlow: 1.0,
        glassLiquidFlow: 1.0,
    }
};

const fragmentShader = `
uniform sampler2D uTexture1, uTexture2;
uniform float uProgress;
uniform vec2 uResolution, uTexture1Size, uTexture2Size;
uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength;
uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

vec4 glassEffect(vec2 uv, float progress) {
    float time = progress * 5.0 * uSpeedMultiplier;
    vec2 uv1 = getCoverUV(uv, uTexture1Size); 
    vec2 uv2 = getCoverUV(uv, uTexture2Size);
    
    float maxR = length(uResolution) * 0.85; 
    float br = progress * maxR;
    vec2 p = uv * uResolution; 
    vec2 c = uResolution * 0.5;
    float d = length(p - c); 
    float nd = d / max(br, 0.001);
    float param = smoothstep(br + 3.0, br - 3.0, d); // Inside circle

    vec4 img;
    if (param > 0.0) {
            float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
            vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
            vec2 distUV = uv2 - dir * ro;
            distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
            float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
            img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
            if (uGlassEdgeGlow > 0.0) {
            float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
            img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
            }
    } else { 
        img = texture2D(uTexture2, uv2); 
    }
    vec4 oldImg = texture2D(uTexture1, uv1);
    if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
    return mix(oldImg, img, param);
}

void main() {
    gl_FragColor = glassEffect(vUv, uProgress);
}
`;

const vertexShader = `
varying vec2 vUv; 
void main() { 
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
}`;

interface Slide {
    title: string;
    description: string;
    media: string;
}

interface WebGLHeroProps {
    onNavigate?: (category: string | null) => void;
}

const WebGLHero: React.FC<WebGLHeroProps> = ({ onNavigate }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { settings } = useSiteSettings();

    // State for content
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs for Three.js objects to persist across renders without causing re-renders
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const texturesRef = useRef<THREE.Texture[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const isTransitioningRef = useRef(false);

    // Default slides (fallback)
    const defaultSlides: Slide[] = [
        {
            title: "XCRAFT SHOP",
            description: "Dive into the new summer collection.",
            media: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
        },
        {
            title: "GOLDEN HOUR",
            description: "Radiate elegance in every moment.",
            media: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80"
        },
        {
            title: "ETHEREAL GLOW",
            description: "Timeless fashion for the modern soul.",
            media: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
        },
    ];

    // Use slides from settings or fallback to defaults
    const slides: Slide[] = settings.heroSlides && settings.heroSlides.length > 0
        ? settings.heroSlides
        : defaultSlides;

    // Initialize Three.js
    useEffect(() => {
        if (!canvasRef.current) return;

        // SCENE SETUP
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: false,
            alpha: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        const geometry = new THREE.PlaneGeometry(2, 2);

        // MATERIAL SETUP
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture1: { value: null },
                uTexture2: { value: null },
                uProgress: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uTexture1Size: { value: new THREE.Vector2(1, 1) },
                uTexture2Size: { value: new THREE.Vector2(1, 1) },
                uGlobalIntensity: { value: SLIDER_CONFIG.settings.globalIntensity },
                uSpeedMultiplier: { value: SLIDER_CONFIG.settings.speedMultiplier },
                uDistortionStrength: { value: SLIDER_CONFIG.settings.distortionStrength },
                uGlassRefractionStrength: { value: SLIDER_CONFIG.settings.glassRefractionStrength },
                uGlassChromaticAberration: { value: SLIDER_CONFIG.settings.glassChromaticAberration },
                uGlassBubbleClarity: { value: SLIDER_CONFIG.settings.glassBubbleClarity },
                uGlassEdgeGlow: { value: SLIDER_CONFIG.settings.glassEdgeGlow },
                uGlassLiquidFlow: { value: SLIDER_CONFIG.settings.glassLiquidFlow },
            },
            vertexShader,
            fragmentShader,
        });
        materialRef.current = material;

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // TEXTURE LOADING
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;

        const loadTexture = (url: string) => {
            return new Promise<THREE.Texture>((resolve) => {
                textureLoader.load(url, (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.userData.size = new THREE.Vector2(texture.image.width, texture.image.height);
                    resolve(texture);
                });
            });
        };

        Promise.all(slides.map(s => loadTexture(s.media))).then(loadedTextures => {
            texturesRef.current = loadedTextures;
            if (loadedTextures.length >= 2) {
                material.uniforms.uTexture1.value = loadedTextures[0];
                material.uniforms.uTexture2.value = loadedTextures[1];
                material.uniforms.uTexture1Size.value = loadedTextures[0].userData.size;
                material.uniforms.uTexture2Size.value = loadedTextures[1].userData.size;
                setIsLoaded(true);
            }
        });

        // RENDER LOOP
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // RESIZE HANDLER
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            material.uniforms.uResolution.value.set(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            renderer.dispose();
            geometry.dispose();
            // material.dispose(); // ShaderMaterial cleanup
        };
    }, []);

    // SLIDE TRANSITION LOGIC
    const navigateToSlide = (targetIndex: number) => {
        if (isTransitioningRef.current || targetIndex === currentSlideIndex) return;
        if (!materialRef.current || texturesRef.current.length === 0) return;

        isTransitioningRef.current = true;
        const currentTexture = texturesRef.current[currentSlideIndex];
        const targetTexture = texturesRef.current[targetIndex];

        materialRef.current.uniforms.uTexture1.value = currentTexture;
        materialRef.current.uniforms.uTexture2.value = targetTexture;
        materialRef.current.uniforms.uTexture1Size.value = currentTexture.userData.size;
        materialRef.current.uniforms.uTexture2Size.value = targetTexture.userData.size;

        // Animate Content Out
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');

        if (titleEl) gsap.to(titleEl, { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" });
        if (descEl) gsap.to(descEl, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" });

        // Animate Shader
        gsap.fromTo(materialRef.current.uniforms.uProgress,
            { value: 0 },
            {
                value: 1,
                duration: 2.5,
                ease: "power2.inOut",
                onComplete: () => {
                    if (materialRef.current) {
                        materialRef.current.uniforms.uProgress.value = 0;
                        materialRef.current.uniforms.uTexture1.value = targetTexture;
                        materialRef.current.uniforms.uTexture1Size.value = targetTexture.userData.size;
                    }
                    isTransitioningRef.current = false;
                    setCurrentSlideIndex(targetIndex);
                }
            }
        );

        // Animate Content In (Delayed)
        setTimeout(() => {
            setCurrentSlideIndex(targetIndex); // React State Update for text render
            // Logic continues in useEffect based on currentSlideIndex change
        }, 1000);
    };

    // Content Animation Effect
    useEffect(() => {
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');

        if (titleEl && descEl && isLoaded) {
            // Reset positions
            gsap.set(titleEl, { y: 30, opacity: 0 });
            gsap.set(descEl, { y: 20, opacity: 0 });

            // Animate In
            gsap.to(titleEl, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 });
            gsap.to(descEl, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 });
        }
    }, [currentSlideIndex, isLoaded]);

    // Auto-play
    useEffect(() => {
        if (!isLoaded) return;
        const timer = setInterval(() => {
            if (!isTransitioningRef.current) {
                const next = (currentSlideIndex + 1) % slides.length;
                navigateToSlide(next);
            }
        }, 6000);
        return () => clearInterval(timer);
    }, [currentSlideIndex, isLoaded]);

    return (
        <div ref={containerRef} className="relative w-full h-[100vh] overflow-hidden bg-black">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block" />

            {/* Overlay Gradient for Text Readability - Matching Splash Theme */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />

            {/* Content Container */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start">
                <div className="max-w-3xl overflow-hidden p-4">
                    {/* Dynamic Content */}
                    <p id="hero-desc" className="text-white/90 text-sm md:text-lg tracking-[0.2em] uppercase font-medium mb-4 mix-blend-difference">
                        {isLoaded ? slides[currentSlideIndex].description : "Loading Experience..."}
                    </p>
                    <h1 id="hero-title" className="text-[12vw] md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9] uppercase drop-shadow-2xl">
                        {isLoaded ? slides[currentSlideIndex].title : "SPLASH"}
                    </h1>

                    {isLoaded && (
                        <button
                            onClick={() => {
                                const productsSection = document.getElementById('products');
                                if (productsSection) {
                                    gsap.to(window, {
                                        duration: 1.5,
                                        scrollTo: { y: productsSection.offsetTop, autoKill: true },
                                        ease: "power4.inOut"
                                    });
                                    onNavigate?.(null);
                                } else {
                                    navigate('/shop');
                                }
                            }}
                            className="mt-12 px-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 uppercase text-sm"
                        >
                            <EditableText k="hero_cta" as="span" />
                        </button>
                    )}
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-12 right-12 z-30 flex gap-4">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigateToSlide(idx)}
                        className={`w-12 h-1 transition-all duration-300 ${currentSlideIndex === idx ? 'bg-white' : 'bg-white/20 hover:bg-white/50'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default WebGLHero;
