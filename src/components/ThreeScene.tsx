import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = memo(() => {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#7B8BA8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
});

Particles.displayName = 'Particles';

const FloatingGeo = memo(({ position, speed }: { position: [number, number, number]; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * speed * 0.3;
      ref.current.rotation.z += delta * speed * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshBasicMaterial wireframe color="#7C4DFF" opacity={0.3} transparent />
    </mesh>
  );
});

FloatingGeo.displayName = 'FloatingGeo';

const Scene = () => {
  return (
    <>
      <Particles />
      <FloatingGeo position={[-3, 2, -2]} speed={0.5} />
      <FloatingGeo position={[3, -1, -3]} speed={0.3} />
      <FloatingGeo position={[0, -2, -4]} speed={0.4} />
    </>
  );
};

const ThreeScene = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default memo(ThreeScene);
