import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sparkles, Icosahedron, TorusKnot } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * 0.25) * 0.5;
    ref.current.rotation.y = t * 0.35;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1.35, 4]}>
        <MeshDistortMaterial
          color="#7C5CFF"
          emissive="#22D3B1"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.85}
          distort={0.35}
          speed={1.6}
        />
      </Icosahedron>
    </Float>
  );
}

function OrbitingKnot() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = Math.cos(t * 0.4) * 2.6;
    ref.current.position.y = Math.sin(t * 0.6) * 0.7;
    ref.current.position.z = Math.sin(t * 0.4) * 1.4;
    ref.current.rotation.x = t * 0.5;
    ref.current.rotation.y = t * 0.3;
  });
  return (
    <TorusKnot ref={ref} args={[0.28, 0.09, 128, 32]}>
      <meshStandardMaterial color="#22D3B1" emissive="#22D3B1" emissiveIntensity={0.9} roughness={0.2} metalness={0.9} />
    </TorusKnot>
  );
}

const CAMERA_PROPS = { position: [0, 0, 4.2] as [number, number, number], fov: 45 };
const GL_PROPS = { antialias: true, alpha: true };

const Scene3D: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <Canvas dpr={[1, 2]} camera={CAMERA_PROPS} gl={GL_PROPS}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#a58bff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#22D3B1" />
        <Core />
        <OrbitingKnot />
        <Sparkles count={40} scale={6} size={2.4} speed={0.4} color="#a58bff" />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  </div>
);

export default Scene3D;
