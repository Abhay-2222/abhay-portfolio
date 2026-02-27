/**
 * GlassCube.jsx
 * Three.js glass Rubik's cube — 27 crystalline cubies.
 * Canvas is appended to containerRef (inside the sticky hero layer).
 * Rotation: scroll-progress driven (2 full rotations) + slow continuous auto-spin.
 */

import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const CUBIE_SIZE = 0.9
const GAP        = 0.05
const STEP       = CUBIE_SIZE + GAP

export default function GlassCube({ containerRef, scrollProgressRef }) {
  useEffect(() => {
    const container = containerRef?.current ?? document.body

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const initW = container.clientWidth  || window.innerWidth
    const initH = container.clientHeight || window.innerHeight
    renderer.setSize(initW, initH)
    renderer.toneMapping         = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace    = THREE.SRGBColorSpace

    /* Canvas — absolute inside container (100vh sticky layer) */
    const canvas = renderer.domElement
    canvas.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'z-index:10',
      'display:block',
    ].join(';')
    container.appendChild(canvas)

    /* ── Scene + Camera ── */
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 100)
    camera.position.set(0, 0, 8)
    camera.updateProjectionMatrix()

    /* ── Environment (required for glass transmission) ── */
    const pmrem      = new THREE.PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture
    scene.environment = envTexture
    pmrem.dispose()

    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4)
    keyLight.position.set(5, 8, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xf0f4ff, 0.7)
    fillLight.position.set(-5, -3, -5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9)
    rimLight.position.set(0, 0, -8)
    scene.add(rimLight)

    /* ── Cube group — centered at origin, scaled up ── */
    const cubeGroup = new THREE.Group()
    cubeGroup.scale.set(1.2, 1.2, 1.2)
    scene.add(cubeGroup)

    const sharedGeo   = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE)
    const sharedEdges = new THREE.EdgesGeometry(sharedGeo)
    const cubeMaterials = []

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mat = new THREE.MeshPhysicalMaterial({
            color:              0xffffff,
            metalness:          0.0,
            roughness:          0.05,
            transmission:       0.95,
            thickness:          0.5,
            ior:                1.5,
            transparent:        true,
            opacity:            0.90,
            envMapIntensity:    1.2,
            clearcoat:          1.0,
            clearcoatRoughness: 0.05,
          })
          cubeMaterials.push(mat)

          const cubie = new THREE.Mesh(sharedGeo, mat)
          cubie.position.set(x * STEP, y * STEP, z * STEP)
          cubie.add(new THREE.LineSegments(
            sharedEdges,
            new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.10 })
          ))
          cubeGroup.add(cubie)
        }
      }
    }

    /* ── Scroll-driven rotation + continuous auto-spin ── */
    let autoSpin = 0.5 // initial angle offset for a nice starting pose

    /* ── Resize — track container size ── */
    const onResize = () => {
      const w = container.clientWidth  || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    window.addEventListener('resize', onResize)

    /* ── Animation loop ── */
    renderer.setAnimationLoop(() => {
      autoSpin += 0.002
      const scrollProgress  = scrollProgressRef?.current ?? 0
      const baseRotY        = scrollProgress * Math.PI * 4  // 2 full rotations
      cubeGroup.rotation.y  = baseRotY + autoSpin
      cubeGroup.rotation.x  = 0.3 + Math.sin((baseRotY + autoSpin) * 0.3) * 0.10
      renderer.render(scene, camera)
    })

    /* ── Cleanup ── */
    return () => {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      sharedGeo.dispose()
      sharedEdges.dispose()
      cubeMaterials.forEach((m) => m.dispose())
      envTexture.dispose()
      renderer.dispose()
      if (container.contains(canvas)) container.removeChild(canvas)
    }
  }, []) // refs are stable — no deps needed

  return null
}
