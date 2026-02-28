import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import HeartGalaxy from './HeartGalaxy';

export default function Scene3D() {
  return (
    <div className="absolute inset-0 z-0 bg-gray-900">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lights (Though Galaxy is emissive, lights help with other potential objects) */}
        <ambientLight intensity={0.2} />

        {/* The Heart Galaxy Particle System */}
        <HeartGalaxy />

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#5e1b48" />
        <Environment preset="city" />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
