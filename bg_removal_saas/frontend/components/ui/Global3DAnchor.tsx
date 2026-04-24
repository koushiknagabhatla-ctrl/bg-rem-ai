'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function GeometricAnchor() {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    // Map the global window scroll to the rotation of the 3D model
    // This perfectly simulates Oryzo's scroll-linked 3D physics
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5, // 1.5 allows for buttery smooth catching up (Oryzo style)
      onUpdate: (self) => {
        if (meshRef.current) {
          // As user scrolls from 0 to 1, rotate the model massively
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
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 0]} />
        <MeshTransmissionMaterial 
          backside
          backsideThickness={1.5}
          thickness={1.5}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#C4956A"
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export function Global3DAnchor() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
      {/* 
        This is the true WebGL background that replaces the CSS blobs.
        It runs entirely on the GPU and maps rotation directly to global G-SAP scrolling.
        We add a soft blur to the canvas to make it feel deeply cinematic and embedded in the background, exactly like Oryzo's coaster object.
      */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] blur-[20px]">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Environment preset="city" />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#E8B98A" />
          <directionalLight position={[-10, -10, -10]} intensity={1} color="#8B5E3C" />
          <GeometricAnchor />
        </Canvas>
      </div>
    </div>
  );
}
