/**
 * WaterScene.js
 * Three.js WebGL water plane with GLSL shader.
 * Runs as a background layer beneath the SVG fishing scene.
 */
import * as THREE from 'three';

export function initWaterScene(canvas) {
  const W = canvas.offsetWidth  || window.innerWidth;
  const H = canvas.offsetHeight || Math.round(window.innerHeight * 0.32);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100);
  camera.position.z = 10;

  const waterGeo = new THREE.PlaneGeometry(W * 1.6, H, 128, 32);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:           { value: 0 },
      uScrollProgress: { value: 0 },
      uBite:           { value: 0 },
    },
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uScrollProgress;
      uniform float uBite;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float wave1 = sin(pos.x * 0.018 + uTime * 0.75) * 2.2;
        float wave2 = sin(pos.x * 0.045 + uTime * 1.15) * 1.1;
        float wave3 = sin(pos.x * 0.009 - uTime * 0.4)  * 3.0;

        float scrollWave = sin(pos.x * 0.025 + uTime) * uScrollProgress * 3.5;

        float dist       = abs(pos.x - 0.0);
        float biteRipple = sin(dist * 0.12 - uTime * 4.5)
                         * uBite * 5.0
                         * max(0.0, 1.0 - dist / 180.0);

        pos.y += wave1 + wave2 + wave3 + scrollWave + biteRipple;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uBite;
      varying vec2 vUv;

      void main() {
        vec3 waterColor = vec3(0.80, 0.87, 0.92);
        vec3 deepColor  = vec3(0.70, 0.79, 0.87);

        float depth = smoothstep(0.0, 1.0, vUv.y);
        vec3 color  = mix(deepColor, waterColor, depth);

        float shimmer = sin(vUv.x * 22.0 + uTime * 2.2) * 0.025;
        color += shimmer;

        color += uBite * 0.06;

        gl_FragColor = vec4(color, 0.28);
      }
    `,
    transparent: true,
  });

  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0;
  scene.add(water);

  let time  = 0;
  let rafId = null;

  function animate() {
    rafId  = requestAnimationFrame(animate);
    time  += 0.016;
    waterMat.uniforms.uTime.value = time;
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    const nW = canvas.offsetWidth;
    const nH = canvas.offsetHeight;
    renderer.setSize(nW, nH);
    camera.left   = -nW / 2;
    camera.right  =  nW / 2;
    camera.top    =  nH / 2;
    camera.bottom = -nH / 2;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', handleResize);

  return {
    setScrollProgress(v) {
      waterMat.uniforms.uScrollProgress.value = v;
    },
    triggerBite() {
      let start = null;
      function run(ts) {
        if (!start) start = ts;
        const t = (ts - start) / 1500;
        if (t < 1) {
          waterMat.uniforms.uBite.value = Math.sin(t * Math.PI);
          requestAnimationFrame(run);
        } else {
          waterMat.uniforms.uBite.value = 0;
        }
      }
      requestAnimationFrame(run);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    },
  };
}
