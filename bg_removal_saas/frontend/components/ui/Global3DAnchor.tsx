'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

function AuthenticRobot() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load the production GLB model from our public directory
  const { scene, animations } = useGLTF('/robot.glb');
  const { actions } = useAnimations(animations, groupRef);

  // Play the Idle animation natively if it exists
  useEffect(() => {
    if (actions && actions['Idle']) {
       actions['Idle'].play();
    }
  }, [actions]);

  // Traverse the external GLTF and inject Liquid Glass properties!
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Inject extreme liquid glass physics into the robot
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#C4956A"),
          transmission: 1, // Full glass refraction
          opacity: 1,
          metalness: 0.1,
          roughness: 0.05,
          ior: 1.5,
          thickness: 3,
          envMapIntensity: 2,
          clearcoat: 1,
        });
      }
    });
  }, [scene]);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1, 
      onUpdate: (self) => {
        if (groupRef.current) {
          gsap.to(groupRef.current.position, {
            y: -2 - (self.progress * 8), // Dive deep on scroll!
            z: self.progress * 6,
            ease: "power2.out",
            duration: 0.5
          });
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating bob
      groupRef.current.position.y += Math.sin(t * 2) * 0.005;
      
      // Interactive Pointer Tracking (peachweb.io style)
      // The robot rotates to face your cursor!
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 4, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
    }
  });

  return (
    <group ref={groupRef} scale={0.7} position={[0, -2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// Ensure the massive GLB is preloaded by Next.js
useGLTF.preload('/robot.glb');

export function Global3DAnchor() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60 overflow-hidden mix-blend-screen">
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] md:w-[80vw] md:h-[100vh]">
        <Canvas camera={{ position: [0, 0, 10], fov: 40 }} dpr={[1, 2]}>
          <Environment preset="city" />
          <ambientLight intensity={2} />
          <directionalLight position={[10, 10, 10]} intensity={4} color="#E8B98A" />
          <directionalLight position={[-10, -10, -10]} intensity={2} color="#8B5E3C" />
          <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={3} color="#ffffff" />
          
          <AuthenticRobot />
          
          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#C4956A" />
        </Canvas>
      </div>
    </div>
  );
}
