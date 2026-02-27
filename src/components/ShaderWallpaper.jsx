/**
 * ShaderWallpaper.jsx
 * Full-screen animated shader background using Three.js via @react-three/fiber.
 * Dark mode: slow-drifting orange, purple, green aurora orbs on warm near-black.
 * Light mode: soft peach, gold haze on warm cream.
 * Responds to theme changes via uTheme uniform with smooth LERP.
 * Orb radius: 40–60% of viewport. Animation cycle: ~18s.
 */

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../context/ThemeContext.jsx';

/* ─── GLSL Shaders ─── */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform float uTheme; // 0 = dark, 1 = light
  varying vec2 vUv;

  // Smooth noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    // Very slow time — ~18s full cycle
    float t = uTime * 0.055;

    // Subtle noise for organic texture variation
    float n1 = snoise(uv * 1.2 + vec2(t * 0.4, t * 0.3));
    float noiseVar = n1 * 0.5 + 0.5;

    // ── Slow-drifting orb positions ──
    // Orb A — orange, large, upper-left drift
    vec2 orbA = vec2(0.28 + sin(t * 0.55) * 0.20, 0.50 + cos(t * 0.40) * 0.14);
    // Orb B — purple, large, right side drift
    vec2 orbB = vec2(0.72 + sin(t * 0.38 + 1.57) * 0.18, 0.52 + cos(t * 0.50 + 0.9) * 0.16);
    // Orb C — green/teal, smaller, bottom-center drift
    vec2 orbC = vec2(0.50 + sin(t * 0.28 + 2.80) * 0.16, 0.28 + cos(t * 0.65 + 2.1) * 0.12);

    // Gaussian falloff — controls orb radius (lower divisor = larger orb)
    float dA = length(uv - orbA);
    float dB = length(uv - orbB);
    float dC = length(uv - orbC);

    // Orb intensities: exp(-d^2 / (2*sigma^2))
    // sigma ~0.30 → orb covers ~60% of viewport comfortably
    float sigA = 0.32;
    float sigB = 0.30;
    float sigC = 0.26;
    float fA = exp(-(dA * dA) / (2.0 * sigA * sigA));
    float fB = exp(-(dB * dB) / (2.0 * sigB * sigB));
    float fC = exp(-(dC * dC) / (2.0 * sigC * sigC));

    // ── Full-site light palette — pure white + faint grey orbs ──
    vec3 base = vec3(1.0, 1.0, 1.0); // #ffffff

    vec3 finalColor = base;
    // Subtract very faint grey at orb centres (max ~0.07 darkness)
    finalColor -= vec3(fA * 0.07);
    finalColor -= vec3(fB * 0.05);
    finalColor -= vec3(fC * 0.04);
    finalColor -= vec3(noiseVar * 0.005);
    finalColor  = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ─── Inner plane that animates ─── */

function ShaderPlane({ isDark }) {
  const meshRef = useRef(null);
  const targetTheme = useRef(isDark ? 0.0 : 1.0);
  const currentTheme = useRef(isDark ? 0.0 : 1.0);

  useEffect(() => {
    targetTheme.current = isDark ? 0.0 : 1.0;
  }, [isDark]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    mat.uniforms.uTime.value = clock.getElapsedTime();

    const lerp = (a, b, t) => a + (b - a) * t;
    currentTheme.current = lerp(currentTheme.current, targetTheme.current, 0.025);
    mat.uniforms.uTheme.value = currentTheme.current;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uTheme: { value: isDark ? 0.0 : 1.0 },
        }}
      />
    </mesh>
  );
}

/* ─── Exported component ─── */

function ShaderWallpaper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="wallpaper-layer">
      <Canvas
        orthographic
        camera={{ near: -1, far: 1, zoom: 1 }}
        gl={{ antialias: false, pixelRatio: Math.min(window.devicePixelRatio, 1.5) }}
        style={{ width: '100%', height: '100%' }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        <ShaderPlane isDark={isDark} />
      </Canvas>
    </div>
  );
}

export default ShaderWallpaper;
