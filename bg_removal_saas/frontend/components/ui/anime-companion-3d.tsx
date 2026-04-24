'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, useCursor } from '@react-three/drei';
import * as THREE from 'three';

function PremiumAnimeCompanion({ mouseTarget }: { mouseTarget: React.MutableRefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const [blink, setBlink] = useState(false);

  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const skinColor = '#FDFaF5';
  const hairColor = '#1A1A1A';
  const eyeColor = '#6366F1';

  useFrame((state, delta) => {
    if (headRef.current && groupRef.current) {
      // Get mouse coordinates (-1 to 1)
      const mx = (state.pointer.x * window.innerWidth) / 2;
      const my = (state.pointer.y * window.innerHeight) / 2;

      // Mouse target interpolation
      mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, state.pointer.x, 8 * delta);
      mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, state.pointer.y, 8 * delta);

      // Rotate group slightly based on cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseTarget.current.x * 0.5, 4 * delta);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseTarget.current.y * 0.3, 4 * delta);
      
      // Specifically rotate the head more dramatically, ensuring +Z is forward
      // The face is built on the +Z axis. If we just rotate X/Y, we maintain forward visibility.
      headRef.current.rotation.y = mouseTarget.current.x * 0.6;
      headRef.current.rotation.x = -mouseTarget.current.y * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.8}>
        <group position={[0, 0, 0]}>
          
          {/* Head & Hair Group */}
          <group ref={headRef} position={[0, 1.4, 0]}>
            
            {/* Face/Head Base (Looking +Z) */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 64, 64]} />
              <meshStandardMaterial color={skinColor} roughness={0.2} />
            </mesh>

            {/* Premium Hair (Glassy/Smooth) */}
            <mesh position={[0, 0.1, -0.1]} castShadow>
              <sphereGeometry args={[1.05, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshPhysicalMaterial color={hairColor} roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
            </mesh>
            
            {/* Front Bangs (Curved) */}
            <group position={[0, 0, 0]}>
              <mesh position={[-0.4, 0.6, 0.8]} rotation={[0.4, 0.3, -0.2]}>
                <capsuleGeometry args={[0.2, 1.2, 8, 16]} />
                <meshPhysicalMaterial color={hairColor} roughness={0.3} clearcoat={1} />
              </mesh>
              <mesh position={[0.4, 0.6, 0.8]} rotation={[0.4, -0.3, 0.2]}>
                <capsuleGeometry args={[0.2, 1.2, 8, 16]} />
                <meshPhysicalMaterial color={hairColor} roughness={0.3} clearcoat={1} />
              </mesh>
            </group>

            {/* Hair Accessories (Glowing elements typical of premium Awwwards models) */}
            <mesh position={[-0.95, 0.5, 0.2]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.1, 0.8, 0.4]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.95, 0.5, 0.2]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.1, 0.8, 0.4]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
            </mesh>

            {/* Eyes (Positioned on the +Z curve) */}
            <group position={[0, -0.1, 0.88]}>
              {blink ? (
                // Closed Eyes
                <>
                  <mesh position={[-0.35, 0, 0.08]} rotation={[0, -0.2, 0]}>
                    <capsuleGeometry args={[0.02, 0.25, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                  <mesh position={[0.35, 0, 0.08]} rotation={[0, 0.2, 0]}>
                    <capsuleGeometry args={[0.02, 0.25, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                </>
              ) : (
                // Open Eyes
                <>
                  {/* Left Eye */}
                  <group position={[-0.35, 0, 0.05]} rotation={[0, -0.3, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.15, 32, 32]} />
                      <meshBasicMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, -0.05, 0.06]}>
                      <sphereGeometry args={[0.12, 32, 32]} />
                      <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[0.05, 0.05, 0.12]}>
                      <sphereGeometry args={[0.04, 16, 16]} />
                      <meshBasicMaterial color="white" />
                    </mesh>
                  </group>
                  
                  {/* Right Eye */}
                  <group position={[0.35, 0, 0.05]} rotation={[0, 0.3, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.15, 32, 32]} />
                      <meshBasicMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, -0.05, 0.06]}>
                      <sphereGeometry args={[0.12, 32, 32]} />
                      <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[-0.05, 0.05, 0.12]}>
                      <sphereGeometry args={[0.04, 16, 16]} />
                      <meshBasicMaterial color="white" />
                    </mesh>
                  </group>
                </>
              )}
            </group>

            {/* Tiny Kawaii Mouth */}
            <mesh position={[0, -0.35, 0.95]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color="#444" />
            </mesh>

            {/* Blushes */}
            <mesh position={[-0.45, -0.2, 0.85]} rotation={[0, -0.3, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.45, -0.2, 0.85]} rotation={[0, 0.3, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.6} />
            </mesh>
          </group>

          {/* Minimalist Floating Futuristic Body */}
          <group position={[0, -0.2, 0]}>
            {/* Main torso cloak */}
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.9, 1.8, 32, 1, true]} />
              <meshPhysicalMaterial color="#ffffff" roughness={0.1} transmission={0.9} thickness={0.5} ior={1.5} />
            </mesh>
            
            {/* Inner Core */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.8, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>

            {/* Glowing ring/collar */}
            <mesh position={[0, 0.8, 0]}>
              <torusGeometry args={[0.4, 0.05, 16, 32]} />
              <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} />
            </mesh>
          </group>
        </group>
      </Float>
      
      {/* High-quality dynamic floor shadow */}
      <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000" />
    </group>
  );
}

function Scene() {
  const mouseTarget = useRef(new THREE.Vector3());

  return (
    <>
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={2} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      <spotLight position={[-10, 5, 10]} intensity={3} color="#6366F1" penumbra={1} />
      <spotLight position={[10, -5, 10]} intensity={2} color="#ff9999" penumbra={1} />
      <Environment preset="studio" />
      <PremiumAnimeCompanion mouseTarget={mouseTarget} />
    </>
  );
}

export function Awwwards3DAssistant({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    // Lowered z-index and removed pointer events so it NEVER blocks buttons
    <div className={`fixed bottom-0 right-[5%] w-[500px] h-[600px] z-[0] pointer-events-none opacity-90 transition-opacity duration-1000 ${className || ''}`}>
      <Canvas shadows camera={{ position: [0, 1.5, 8], fov: 35 }} gl={{ antialias: true, alpha: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
