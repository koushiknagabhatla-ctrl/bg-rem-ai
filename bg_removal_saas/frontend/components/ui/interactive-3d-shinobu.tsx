'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function ChibiShinobu({ mouseTarget }: { mouseTarget: React.MutableRefObject<THREE.Vector3> }) {
  const headRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Colors based on Shinobu Kocho
  const hairColor = '#2b1b3d';
  const skinColor = '#ffdfd3';
  const uniformColor = '#1a1a2e';
  const haoriColor = '#f2f0e8'; // the butterfly wing pattern base
  const accentColor = '#9d4edd'; // purple accent

  useFrame((state, delta) => {
    // Smoothly interpolate head rotation to look at the mouse target
    if (headRef.current) {
      // Create a target position slightly in front of the camera based on mouse
      const targetPos = new THREE.Vector3(
        mouseTarget.current.x * 5,
        mouseTarget.current.y * 5 + 1.5,
        5 // Look forward
      );
      
      const currentRotation = headRef.current.quaternion.clone();
      const targetMatrix = new THREE.Matrix4().lookAt(
        headRef.current.position,
        targetPos,
        new THREE.Vector3(0, 1, 0)
      );
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
      
      headRef.current.quaternion.slerp(targetQuaternion, 5 * delta);

      // Bounce effect on hover
      const targetY = hovered ? 0.2 : 0;
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, targetY, 10 * delta);
    }
  });

  return (
    <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, 0, 0]}>
          
          {/* Head Group - Rotates to follow cursor */}
          <group ref={headRef} position={[0, 1.2, 0]}>
            {/* Base Head */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>
            
            {/* Hair */}
            <mesh position={[0, 0.1, -0.1]} castShadow>
              <sphereGeometry args={[0.85, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color={hairColor} roughness={0.7} />
            </mesh>

            {/* Hair Bangs */}
            <mesh position={[0, 0.5, 0.6]} castShadow>
              <capsuleGeometry args={[0.2, 0.8, 4, 16]} />
              <meshStandardMaterial color={hairColor} roughness={0.7} />
            </mesh>

            {/* Butterfly Clip */}
            <group position={[0.6, 0.6, 0.3]} rotation={[0, 0, -Math.PI / 4]}>
              <mesh castShadow>
                <coneGeometry args={[0.3, 0.6, 3]} />
                <meshStandardMaterial color={accentColor} />
              </mesh>
              <mesh castShadow rotation={[Math.PI, 0, 0]} position={[0, -0.3, 0]}>
                <coneGeometry args={[0.2, 0.4, 3]} />
                <meshStandardMaterial color={accentColor} />
              </mesh>
            </group>

            {/* Eyes */}
            <group position={[0, 0, 0.75]}>
              <mesh position={[-0.3, 0.1, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color={accentColor} />
              </mesh>
              <mesh position={[0.3, 0.1, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color={accentColor} />
              </mesh>
              {/* Eye highlights */}
              <mesh position={[-0.32, 0.14, 0.08]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="white" />
              </mesh>
              <mesh position={[0.28, 0.14, 0.08]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="white" />
              </mesh>
            </group>

            {/* Smile */}
            <mesh position={[0, -0.2, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#ff9999" />
            </mesh>
            
            {/* Blush */}
            <mesh position={[-0.4, -0.1, 0.7]}>
              <circleGeometry args={[0.12, 16]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.4, -0.1, 0.7]}>
              <circleGeometry args={[0.12, 16]} />
              <meshBasicMaterial color="#ff9999" transparent opacity={0.4} />
            </mesh>
          </group>

          {/* Body */}
          <group position={[0, -0.2, 0]}>
            {/* Torso */}
            <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.4, 0.5, 0.8, 16]} />
              <meshStandardMaterial color={uniformColor} />
            </mesh>

            {/* Haori (Capelet) */}
            <mesh castShadow position={[0, 0.3, -0.1]}>
              <cylinderGeometry args={[0.45, 0.6, 0.7, 16, 1, true, 0, Math.PI]} />
              <meshStandardMaterial color={haoriColor} side={THREE.DoubleSide} />
            </mesh>
            
            {/* Pattern accents on Haori */}
            <mesh position={[0, 0.1, -0.42]}>
              <boxGeometry args={[0.8, 0.1, 0.1]} />
              <meshStandardMaterial color={accentColor} />
            </mesh>
            <mesh position={[-0.45, 0.1, -0.2]} rotation={[0, -Math.PI / 4, 0]}>
              <boxGeometry args={[0.4, 0.1, 0.1]} />
              <meshStandardMaterial color={accentColor} />
            </mesh>
            <mesh position={[0.45, 0.1, -0.2]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.4, 0.1, 0.1]} />
              <meshStandardMaterial color={accentColor} />
            </mesh>

            {/* Belt */}
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.52, 0.52, 0.1, 16]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </group>
        </group>
      </Float>
      <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={5} blur={2} far={4} />
    </group>
  );
}

function Scene() {
  const mouseTarget = useRef(new THREE.Vector3());

  useFrame((state) => {
    // Normalize mouse coordinates (-1 to +1)
    mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, state.pointer.x, 0.1);
    mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, state.pointer.y, 0.1);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <spotLight position={[-10, 10, 10]} intensity={0.5} color="#9d4edd" />
      <Environment preset="city" />
      <ChibiShinobu mouseTarget={mouseTarget} />
    </>
  );
}

export function Interactive3DShinobu({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={className} />;

  return (
    <div className={className}>
      <Canvas shadows camera={{ position: [0, 1.5, 6], fov: 40 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
