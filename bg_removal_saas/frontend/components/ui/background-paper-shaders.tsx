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
    // Faster, larger amplitude waves for dynamic motion
    pos.y += sin(pos.x * 8.0 + time * 3.0) * 0.15 * intensity;
    pos.x += cos(pos.y * 6.0 + time * 4.0) * 0.1 * intensity;
    pos.z += sin(pos.x * 12.0 + time * 2.0) * 0.2 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1; // Black/Dark Brown
  uniform vec3 color2; // Mid Brown
  uniform vec3 color3; // Lighter Brown/Gold highlights
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Advanced fluid noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Zoom in on the UVs a bit
    vec2 uv = vUv * 1.5 - vec2(0.25);
    
    // Fast moving multi-layered liquid noise
    float n1 = snoise(uv * 2.0 + vec2(time * 0.8, time * 0.5));
    float n2 = snoise(uv * 4.0 - vec2(time * 0.6, time * 0.9));
    float n3 = snoise(uv * 8.0 + vec2(time * 1.5, -time * 1.2));
    
    // Distort UVs using noise for a "marbled"/liquid effect
    vec2 distortedUv = uv + vec2(n2, n1) * 0.15;
    float liquidNoise = snoise(distortedUv * 3.0 + time * 0.5);
    
    // Combine noise
    float finalNoise = (liquidNoise + n1 * 0.5 + n3 * 0.2) * 0.5 + 0.5;
    
    // Multi-color mixing: Dark Black/Brown -> Mid Brown -> Vivid Brown Highlight
    vec3 color = mix(color1, color2, smoothstep(0.1, 0.7, finalNoise));
    color = mix(color, color3, smoothstep(0.65, 1.0, finalNoise) * intensity);
    
    // Create a subtle vignette to blend edges to pure black
    float dist = length(vUv - 0.5) * 2.0;
    float vignette = 1.0 - pow(dist, 3.0);
    vignette = clamp(vignette, 0.0, 1.0);
    
    gl_FragColor = vec4(color * vignette, 1.0);
  }
`

export function ShaderPlane({
  color1 = "#020100", // Deep black/brown
  color2 = "#1F0E05", // Mid warm taupe
  color3 = "#EAA752", // Brilliant gold highlight
}: {
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
    [color1, color2, color3]
  )

  useFrame((state) => {
    if (mesh.current) {
      // 3x time multiplier for very fast liquid motion
      uniforms.time.value = state.clock.elapsedTime * 2.5
      uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.2
    }
  })

  return (
    // Scale plane up so waves don't show geometry edges
    <mesh ref={mesh} scale={[15, 15, 1]}>
      <planeGeometry args={[1, 1, 128, 128]} />
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
