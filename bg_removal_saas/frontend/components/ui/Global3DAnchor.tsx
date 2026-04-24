'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function GeometricAnchor() {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1, 
      onUpdate: (self) => {
        if (meshRef.current) {
          gsap.to(meshRef.current.rotation, {
            y: self.progress * Math.PI * 4,
            x: self.progress * Math.PI * 2,
            z: self.progress * Math.PI,
            ease: "none",
            duration: 0.1
          });
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 0]} />
        <MeshTransmissionMaterial 
          backside
          backsideThickness={5}
          thickness={3}
          ior={1.2}
          chromaticAberration={1}
          anisotropy={0.5}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.2}
          clearcoat={1}
          attenuationDistance={2}
          attenuationColor="#ffffff"
          color="#C4956A"
          roughness={0.05}
          transmission={1}
        />
      </mesh>
    </Float>
  );
}

export function Global3DAnchor() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60 overflow-hidden mix-blend-screen">
      {/* 
        Removed the 20px blur that was turning this into a mud-blob.
        This is now a razor sharp, highly refractive 3D glass object.
      */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] md:w-[80vw] md:h-[100vh]">
        <Canvas camera={{ position: [0, 0, 10], fov: 40 }} dpr={[1, 2]}>
          <Environment preset="city" />
          <ambientLight intensity={2} />
          <directionalLight position={[10, 10, 10]} intensity={4} color="#E8B98A" />
          <directionalLight position={[-10, -10, -10]} intensity={2} color="#8B5E3C" />
          <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={3} color="#ffffff" />
          
          <GeometricAnchor />
          
          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#C4956A" />
        </Canvas>
      </div>
    </div>
  );
}
