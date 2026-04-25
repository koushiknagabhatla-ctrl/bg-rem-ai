"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create sophisticated, flowing organic fluid noise
    float noise = sin(uv.x * 4.0 + time * 0.5) * cos(uv.y * 3.0 + time * 0.3);
    noise += sin(uv.y * 6.0 - time * 0.4) * cos(uv.x * 5.0 + time * 0.6) * 0.5;
    
    // Add swirl dynamics for rich coffee/liquid feel
    noise += sin(length(uv - 0.5) * 5.0 - time * 0.8) * 0.3;
    
    // Mix colors based on noise and position
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    
    // Mix with Gold (color3) instead of pure white for attractiveness
    color = mix(color, color3, pow(abs(noise), 2.0) * intensity);
    
    // Add glow effect (optimized to prevent negative pow NaN glitches)
    float glow = max(0.0, 1.0 - length(uv - 0.5) * 1.5);
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(color * glow, glow * 0.9);
  }
`

export function ShaderPlane({
  position = [0, 0, 0],
  color1 = "#000000",   // Black
  color2 = "#2e1201",   // Brown
  color3 = "#EAA752",   // Gold Highlight
}: {
  position?: [number, number, number]
  color1?: string
  color2?: string
  color3?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
      color3: { value: new THREE.Color(color3) },
    }),
    [color1, color2, color3],
  )

  useFrame((state) => {
    if (mesh.current) {
      uniforms.time.value = state.clock.elapsedTime
      uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position} scale={[12, 12, 1]}>
      <planeGeometry args={[2, 2, 24, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function EnergyRing({
  radius = 1,
  position = [0, 0, 0],
}: {
  radius?: number
  position?: [number, number, number]
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime
      const material = mesh.current.material as THREE.Material
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.8, radius, 32]} />
      <meshBasicMaterial color="#EAA752" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  )
}
