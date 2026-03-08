import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch (e) {
    return false;
  }
};

const AnimatedShaderBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.log('WebGL not available, using CSS fallback');
      setUseFallback(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    } catch (e) {
      console.log('WebGL renderer creation failed, using CSS fallback');
      setUseFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        // Brand colors in normalized RGB:
        // Deep Ruby: #A31621 → vec3(0.64, 0.086, 0.129)
        // Mocha Mousse: #967969 → vec3(0.588, 0.475, 0.412)
        // Soft Blush: #F3DAD8 → vec3(0.953, 0.855, 0.847)
        // Butter Yellow: #F5E050 → vec3(0.961, 0.878, 0.314)

        vec3 deepRuby = vec3(0.64, 0.086, 0.129);
        vec3 mochaMousse = vec3(0.588, 0.475, 0.412);
        vec3 softBlush = vec3(0.953, 0.855, 0.847);
        vec3 butterYellow = vec3(0.961, 0.878, 0.314);

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 20.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5 + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 20.0));
            
            // Mix brand colors based on position and time
            float colorMix = sin(i * 0.15 + iTime * 0.3) * 0.5 + 0.5;
            float colorMix2 = cos(i * 0.2 + iTime * 0.4) * 0.5 + 0.5;
            
            vec3 color1 = mix(deepRuby, mochaMousse, colorMix);
            vec3 color2 = mix(softBlush, butterYellow, colorMix2);
            vec3 finalColor = mix(color1, color2, sin(i * 0.1 + iTime * 0.2) * 0.5 + 0.5);
            
            vec4 auroraColors = vec4(finalColor, 1.0);
            
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.8)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 20.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  if (useFallback) {
    return (
      <div 
        className="fixed inset-0 -z-10 animate-gradient-shift"
        style={{ 
          pointerEvents: 'none',
          background: 'linear-gradient(-45deg, #A31621, #967969, #F3DAD8, #F5E050, #967969, #A31621)',
          backgroundSize: '400% 400%'
        }}
      />
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedShaderBackground;
