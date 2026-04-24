'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, useCursor, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function MinimalAnimeGirl({ mouseTarget }: { mouseTarget: React.MutableRefObject<THREE.Vector3> }) {
  const headRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  useCursor(hovered);

  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const skinColor = '#Fdf2ee';
  const hairColor = '#2D2A4A';
  const eyeColor = '#b392f0';

  useFrame((state, delta) => {
    if (headRef.current) {
      // Look at logic
      const targetPos = new THREE.Vector3(
        mouseTarget.current.x * 5,
        mouseTarget.current.y * 5,
        4
      );
      
      const currentRotation = headRef.current.quaternion.clone();
      const targetMatrix = new THREE.Matrix4().lookAt(
        headRef.current.position,
        targetPos,
        new THREE.Vector3(0, 1, 0)
      );
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
      
      // Smoothly interpolate rotation
      headRef.current.quaternion.slerp(targetQuaternion, 6 * delta);

      // Bounce on hover
      const targetY = hovered ? 0.3 : 0;
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, targetY, 8 * delta);
    }
  });

  return (
    <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.05 : 1}>
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1}>
        <group position={[0, 0, 0]}>
          
          {/* Head & Hair Group */}
          <group ref={headRef} position={[0, 1.2, 0]}>
            
            {/* Cute Rounded Head */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 64, 64]} />
              <meshStandardMaterial color={skinColor} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Hair Base */}
            <mesh position={[0, 0.1, -0.1]} castShadow>
              <sphereGeometry args={[1.05, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshStandardMaterial color={hairColor} roughness={0.6} />
            </mesh>
            
            {/* Front Bangs */}
            <mesh position={[0, 0.6, 0.7]} rotation={[0.4, 0, 0]}>
              <capsuleGeometry args={[0.3, 1.4, 4, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[-0.5, 0.4, 0.6]} rotation={[0.2, 0, -0.4]}>
              <capsuleGeometry args={[0.25, 1.2, 4, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[0.5, 0.4, 0.6]} rotation={[0.2, 0, 0.4]}>
              <capsuleGeometry args={[0.25, 1.2, 4, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>

            {/* Side Hair Tails */}
            <mesh position={[-0.9, -0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
              <capsuleGeometry args={[0.25, 1.5, 8, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[0.9, -0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
              <capsuleGeometry args={[0.25, 1.5, 8, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>

            {/* Hair Accessory (Ribbon/Butterfly) */}
            <group position={[0.7, 0.7, 0.4]} rotation={[0.5, 0.5, -0.4]}>
              <mesh>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshStandardMaterial color={eyeColor} />
              </mesh>
              <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.3, 0]}>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshStandardMaterial color={eyeColor} />
              </mesh>
            </group>

            {/* Anime Eyes */}
            <group position={[0, -0.1, 0.9]}>
              {/* Left Eye */}
              <group position={[-0.35, 0, 0]}>
                {hovered ? (
                  // Happy ^ eye
                  <mesh rotation={[0, 0, 0.5]}>
                    <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                ) : blink ? (
                  // Closed - eye
                  <mesh>
                    <capsuleGeometry args={[0.03, 0.3, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                ) : (
                  // Open Anime Eye
                  <>
                    <mesh>
                      <sphereGeometry args={[0.15, 32, 32]} />
                      <meshBasicMaterial color="#111" />
                    </mesh>
                    {/* Iris */}
                    <mesh position={[0, -0.05, 0.05]}>
                      <sphereGeometry args={[0.12, 32, 32]} />
                      <meshBasicMaterial color={eyeColor} />
                    </mesh>
                    {/* Highlight */}
                    <mesh position={[0.05, 0.05, 0.12]}>
                      <sphereGeometry args={[0.04, 16, 16]} />
                      <meshBasicMaterial color="white" />
                    </mesh>
                  </>
                )}
              </group>

              {/* Right Eye */}
              <group position={[0.35, 0, 0]}>
                {hovered ? (
                  // Happy ^ eye
                  <mesh rotation={[0, 0, -0.5]}>
                    <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                ) : blink ? (
                  // Closed - eye
                  <mesh>
                    <capsuleGeometry args={[0.03, 0.3, 4, 8]} />
                    <meshBasicMaterial color="#111" />
                  </mesh>
                ) : (
                  // Open Anime Eye
                  <>
                    <mesh>
                      <sphereGeometry args={[0.15, 32, 32]} />
                      <meshBasicMaterial color="#111" />
                    </mesh>
                    {/* Iris */}
                    <mesh position={[0, -0.05, 0.05]}>
                      <sphereGeometry args={[0.12, 32, 32]} />
                      <meshBasicMaterial color={eyeColor} />
                    </mesh>
                    {/* Highlight */}
                    <mesh position={[-0.05, 0.05, 0.12]}>
                      <sphereGeometry args={[0.04, 16, 16]} />
                      <meshBasicMaterial color="white" />
                    </mesh>
                  </>
                )}
              </group>
            </group>

            {/* Mouth */}
            <mesh position={[0, -0.35, 0.95]} rotation={[hovered ? Math.PI / 2 : 0, 0, 0]}>
              {hovered ? (
                // Happy open mouth (Torus)
                <torusGeometry args={[0.1, 0.03, 16, 32, Math.PI]} />
              ) : (
                // Tiny dot mouth
                <sphereGeometry args={[0.03, 8, 8]} />
              )}
              <meshBasicMaterial color={hovered ? "#ff6b6b" : "#444"} />
            </mesh>

            {/* Blushes */}
            <mesh position={[-0.5, -0.25, 0.82]}>
              <circleGeometry args={[0.15, 32]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0.5, -0.25, 0.82]}>
              <circleGeometry args={[0.15, 32]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Body (Minimalist floating dress) */}
          <group position={[0, -0.5, 0]}>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.8, 1.5, 32, 1, true]} />
              <meshStandardMaterial color="#fff" side={THREE.DoubleSide} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Belt */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          </group>

        </group>
      </Float>
      
      {/* Dynamic floor shadow */}
      <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
    </group>
  );
}

function Scene() {
  const mouseTarget = useRef(new THREE.Vector3());

  useFrame((state) => {
    // Get mouse coordinates roughly from -1 to 1 based on screen size
    mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, state.pointer.x, 0.1);
    mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, state.pointer.y, 0.1);
  });

  return (
    <>
      <ambientLight intensity={1} color="#fff1e6" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-10, 5, 10]} intensity={2} color="#b392f0" />
      <Environment preset="city" />
      <MinimalAnimeGirl mouseTarget={mouseTarget} />
    </>
  );
}

export function Awwwards3DAssistant({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    // We add absolute positioning to lock it to the right corner, out of the text's way
    <div className={`fixed bottom-[10%] right-[5%] w-[400px] h-[500px] z-[40] pointer-events-auto ${className || ''}`}>
      <Canvas shadows camera={{ position: [0, 1.5, 7], fov: 35 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
