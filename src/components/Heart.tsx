/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { ParametricGeometry } from 'three-stdlib';

// Extend so we can use <parametricGeometry /> in JSX
extend({ ParametricGeometry });

// Define the shader material
const GalaxyMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#1a0b2e'), // Deep Purple
    uColorEnd: new THREE.Color('#7600bc'),   // Bright Purple
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Gentle floating distortion
      float distortion = sin(pos.y * 2.0 + uTime) * 0.02;
      pos += normal * distortion;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      vViewPosition = mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;

    // Pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(-vViewPosition);

      // Base lighting
      float light = dot(normal, vec3(0.5, 0.8, 0.5)) * 0.5 + 0.5;

      vec3 color = mix(uColorStart, uColorEnd, light + sin(uTime * 0.5) * 0.2);

      // Add sparkling stars
      float noise = random(vUv + uTime * 0.05); // Animated noise
      if (noise > 0.98) {
          float sparkle = sin(uTime * 10.0 + noise * 100.0) * 0.5 + 0.5;
          color += vec3(1.0, 0.9, 0.5) * sparkle; // Gold sparkles
      }

      // Glow/Rim effect (Fresnel)
      float fresnel = dot(viewDir, normal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.5);

      color += vec3(0.4, 0.6, 1.0) * fresnel; // Blue rim light

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ GalaxyMaterial });

// Add type definition for JSX
declare module '@react-three/fiber' {
  interface ThreeElements {
    galaxyMaterial: any;
    parametricGeometry: any;
  }
}

export const HeartMesh = (props: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Heart Parametric Function
  // Defines a heart shape rotated around Y axis
  const heartFunction = (u: number, v: number, target: THREE.Vector3) => {
    // u [0, 1] -> theta [0, PI] (Profile curve)
    // v [0, 1] -> phi [0, 2PI] (Rotation)

    const theta = u * Math.PI;
    const phi = v * Math.PI * 2;

    // Heart profile in XY plane
    // x = 16sin^3(theta)
    // y = 13cos(theta) - 5cos(2theta) - 2cos(3theta) - cos(4theta)

    const scale = 0.1;

    // Radius from Y axis
    const r = 16 * Math.pow(Math.sin(theta), 3);

    // Vertical position
    const y = 13 * Math.cos(theta) - 5 * Math.cos(2*theta) - 2 * Math.cos(3*theta) - Math.cos(4*theta);

    // Convert to Cartesian 3D
    const x = r * Math.cos(phi) * scale;
    const z = r * Math.sin(phi) * scale;

    target.set(x, y * scale, z);
  };

  useFrame((_state, delta) => {
      if (materialRef.current) {
          materialRef.current.uniforms.uTime.value += delta;
      }
  });

  return (
    <mesh ref={meshRef} {...props}>
      <parametricGeometry args={[heartFunction, 100, 60]} />
      <galaxyMaterial ref={materialRef} transparent />
    </mesh>
  );
};
