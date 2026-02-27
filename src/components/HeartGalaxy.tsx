import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

/**
 * Custom Vertex Shader
 * - Animates particles with a gentle pulse (heartbeat) based on uTime.
 * - Rotates the entire galaxy slowly.
 * - Calculates particle size attenuation based on camera distance.
 */
const vertexShader = `
  uniform float uTime;
  uniform float uSize;

  attribute float aScale;
  attribute vec3 aRandomness;

  varying vec3 vColor;
  varying float vDistance;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Rotate the galaxy slowly
    float angle = uTime * 0.1;
    mat3 rotateY = mat3(
      cos(angle), 0.0, sin(angle),
      0.0, 1.0, 0.0,
      -sin(angle), 0.0, cos(angle)
    );
    modelPosition.xyz = rotateY * modelPosition.xyz;

    // Heartbeat pulse effect: Expand and contract based on sine wave
    float pulse = 1.0 + 0.05 * sin(uTime * 2.0);
    modelPosition.xyz *= pulse;

    // Add some organic movement using randomness
    modelPosition.x += sin(uTime + aRandomness.x * 10.0) * 0.02;
    modelPosition.y += cos(uTime + aRandomness.y * 10.0) * 0.02;
    modelPosition.z += sin(uTime + aRandomness.z * 10.0) * 0.02;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Size attenuation: Particles further away appear smaller
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Pass distance to center for fragment shader coloring
    vDistance = length(position);
  }
`;

/**
 * Custom Fragment Shader
 * - Colors particles based on radial distance from center.
 * - Core: Hot Pink/White -> Outer: Deep Purple/Blue.
 * - Creates a soft, circular particle shape (not square).
 */
const fragmentShader = `
  varying float vDistance;

  void main() {
    // Circular particle shape
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // Color gradient based on distance from center
    // Inner color (Hot Pink/White): vec3(1.0, 0.8, 0.9)
    // Outer color (Deep Purple/Blue): vec3(0.1, 0.0, 0.3)

    vec3 innerColor = vec3(1.0, 0.5, 0.7); // Hot Pink
    vec3 outerColor = vec3(0.2, 0.1, 0.6); // Deep Purple

    // Mix based on vDistance (normalized roughly to heart size ~15-20 units)
    float mixStrength = smoothstep(0.0, 20.0, vDistance);
    vec3 color = mix(innerColor, outerColor, mixStrength);

    // Final color with alpha from circular shape
    gl_FragColor = vec4(color, strength);

    // Discard pixels outside the circle to simulate round points
    if (strength < 0.01) discard;
  }
`;

// Helper function to generate particles outside the component to satisfy linter purity rules
const generateParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const randomness = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // 1. Parametric Heart Equations (Base Position)
    // t goes from 0 to 2*PI
    const t = Math.random() * Math.PI * 2;

    // Heart curve formulas:
    // x = 16 * sin^3(t)
    // y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
    // z needs to be faked/volumetric since the formula is 2D

    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    let z = 0;

    // 2. Volumetric Spread (Randomness/Thickness)
    // Spread particles inward/outward to create volume, not just a line
    // We use a Gaussian-like distribution or simple random spread
    // eslint-disable-next-line
    const spread = (Math.random() - 0.5) * 4; // Spread factor

    // Add volume to Z-axis specifically to make it 3D
    // We scale x, y slightly by a random factor to fill the inside
    const volumeScale = Math.random();
    x *= volumeScale;
    y *= volumeScale;

    // Z-thickness related to how close we are to the center (thicker in middle)
    z = (Math.random() - 0.5) * 10 * volumeScale;

    // 3. Apply randomness/noise to positions
    const rX = (Math.random() - 0.5) * 0.5;
    const rY = (Math.random() - 0.5) * 0.5;
    const rZ = (Math.random() - 0.5) * 0.5;

    // Set positions
    // Scale down slightly to fit camera view better (default formula is quite large)
    const scaleFactor = 0.15;
    positions[i * 3 + 0] = (x + rX) * scaleFactor;
    positions[i * 3 + 1] = (y + rY) * scaleFactor;
    positions[i * 3 + 2] = (z + rZ) * scaleFactor;

    // Random scale for each particle
    scales[i] = Math.random();

    // Randomness attribute for shader animation
    randomness[i * 3 + 0] = Math.random();
    randomness[i * 3 + 1] = Math.random();
    randomness[i * 3 + 2] = Math.random();
  }

  return { positions, scales, randomness };
};

const HeartGalaxy = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const customText = useStore((state) => state.customText);

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: 150.0 }, // Base size for attenuation
  }), []);

  // Generate 20,000 particles in a volumetric heart shape
  const particles = useMemo(() => generateParticles(20000), []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Update time uniform for animation
      // @ts-expect-error - shaderMaterial uniforms are not strictly typed in Three types
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Galaxy Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={particles.scales.length}
            array={particles.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandomness"
            count={particles.randomness.length / 3}
            array={particles.randomness}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={false}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </points>

      {/* Floating Personalized Text at Center */}
      <Text
        position={[0, 0, 1]} // Slightly in front
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ff69b4" // Hot pink outline
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff" // Standard font
      >
        {customText}
      </Text>
    </group>
  );
};

export default HeartGalaxy;
