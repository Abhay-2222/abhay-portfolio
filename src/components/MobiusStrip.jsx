/**
 * MobiusStrip.jsx
 *
 * Parametric Möbius strip rendered with @react-three/fiber.
 * Custom shader: gradient flows along the strip's u-axis over time.
 * DoubleSide + transparent material so both faces render with correct color.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Shaders ─────────────────────────────────────────────── */
const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;

  vec3 palette(float t) {
    // c1: portfolio orange · c2: indigo · c3: warm gold
    vec3 c1 = vec3(0.784, 0.376, 0.165);
    vec3 c2 = vec3(0.357, 0.310, 0.808);
    vec3 c3 = vec3(0.910, 0.694, 0.282);
    float s = 1.0 / 3.0;
    if (t < s)        return mix(c1, c2, smoothstep(0.0, 1.0, t / s));
    else if (t < 2.0*s) return mix(c2, c3, smoothstep(0.0, 1.0, (t - s) / s));
    else              return mix(c3, c1, smoothstep(0.0, 1.0, (t - 2.0*s) / s));
  }

  void main() {
    // gradient travels along the strip (u axis), wraps seamlessly
    float t = fract(vUv.x * 1.4 - uTime * 0.11);
    vec3 col = palette(t);

    // specular-ish shimmer across the width
    float shimmer = 0.5 + 0.5 * sin(vUv.y * 3.14159);
    col = mix(col * 0.82, col, shimmer);

    // soft edge fade to avoid hard boundary
    float edge = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);

    gl_FragColor = vec4(col, edge);
  }
`;

/* ─── Geometry + mesh ─────────────────────────────────────── */
function MobiusMesh() {
  const meshRef = useRef();
  const matRef  = useRef();

  /* parametric geometry */
  const geo = useMemo(() => {
    const uSegs = 256, vSegs = 28;
    const R = 1.1, w = 0.52;
    const positions = [], uvs = [], indices = [];

    for (let i = 0; i <= uSegs; i++) {
      for (let j = 0; j <= vSegs; j++) {
        const u = (i / uSegs) * Math.PI * 2;
        const v = (j / vSegs - 0.5) * w;
        positions.push(
          (R + v * Math.cos(u / 2)) * Math.cos(u),
          (R + v * Math.cos(u / 2)) * Math.sin(u),
          v * Math.sin(u / 2),
        );
        uvs.push(i / uSegs, j / vSegs);
      }
    }
    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j;
        const b = (i + 1) * (vSegs + 1) + j;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setIndex(indices);
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    return g;
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = 0.42 + Math.sin(t * 0.28) * 0.08;
      meshRef.current.rotation.z = t * 0.22;
    }
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
  });

  return (
    <mesh ref={meshRef} geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
}

/* ─── Export ──────────────────────────────────────────────── */
export default function MobiusStrip({ style }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 44 }}
      style={style}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <MobiusMesh />
    </Canvas>
  );
}
