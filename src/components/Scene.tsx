import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { HeartMesh } from './Heart';
import type { HandData, Gesture } from '../hooks/useHandTracking';

interface SceneProps {
  handDataRef: React.MutableRefObject<HandData>;
  gesture: Gesture;
  isPresent: boolean;
}

export const Scene = ({ handDataRef, gesture }: SceneProps) => {
  const heartRef = useRef<THREE.Group>(null);

  // Physics state for inertia
  const velocity = useRef(new THREE.Vector2(0, 0));
  const lastHandPos = useRef(new THREE.Vector2(0, 0));
  const isInteracting = useRef(false);
  const wasPresent = useRef(false);

  useFrame((state) => {
    if (!heartRef.current) return;

    const handData = handDataRef.current;

    if (handData.isPresent && handData.landmarks.length > 0) {
      // Get palm position (Wrist is 0, Middle Finger MCP is 9)
      // Let's use landmark 9 (Middle MCP) as center
      const palm = handData.landmarks[9];

      // Normalize to [-1, 1] range. MediaPipe is [0, 1] (y is inverted?)
      // x: 0 (left) -> 1 (right)
      // y: 0 (top) -> 1 (bottom)

      const x = (palm.x - 0.5) * 2; // -1 to 1
      const y = -(palm.y - 0.5) * 2; // -1 to 1 (inverted Y for 3D)

      const currentPos = new THREE.Vector2(x, y);

      // Handle "Just Appeared" case to avoid jump
      if (!wasPresent.current) {
          lastHandPos.current.copy(currentPos);
          velocity.current.set(0, 0);
      }

      if (gesture === 'Open') {
          // Interaction Mode
          isInteracting.current = true;

          // Move heart to follow hand (with some smoothing)
          // Map x, y to 3D world coordinates roughly
          // At z=0, visible range is roughly x:[-2, 2], y:[-1.5, 1.5] depending on aspect ratio

          const targetX = x * 4;
          const targetY = y * 3;

          heartRef.current.position.x = THREE.MathUtils.lerp(heartRef.current.position.x, targetX, 0.1);
          heartRef.current.position.y = THREE.MathUtils.lerp(heartRef.current.position.y, targetY, 0.1);

          // Rotation based on movement
          // Calculate velocity
          const deltaX = currentPos.x - lastHandPos.current.x;
          const deltaY = currentPos.y - lastHandPos.current.y;

          // Update velocity
          velocity.current.set(deltaX, deltaY);

          // Rotate based on hand rotation (if available) or position
          if (handData.worldLandmarks && handData.worldLandmarks.length > 0) {
             const wrist = handData.worldLandmarks[0];
             const middleMCP = handData.worldLandmarks[9];
             const indexMCP = handData.worldLandmarks[5];
             const pinkyMCP = handData.worldLandmarks[17];

             // Vectors for orientation
             // Forward: Wrist -> Middle MCP
             const forward = new THREE.Vector3(middleMCP.x - wrist.x, -(middleMCP.y - wrist.y), middleMCP.z - wrist.z).normalize();
             // Right: Index MCP -> Pinky MCP (approx)
             const right = new THREE.Vector3(pinkyMCP.x - indexMCP.x, -(pinkyMCP.y - indexMCP.y), pinkyMCP.z - indexMCP.z).normalize();
             // Up: Cross(Right, Forward) - normal to palm
             const up = new THREE.Vector3().crossVectors(right, forward).normalize();

             // Create rotation matrix.

             const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward.negate());
             const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

             heartRef.current.quaternion.slerp(targetQuaternion, 0.1);
          } else {
             // Fallback if no world landmarks
             heartRef.current.rotation.x = THREE.MathUtils.lerp(heartRef.current.rotation.x, y * 0.5, 0.1);
             heartRef.current.rotation.y = THREE.MathUtils.lerp(heartRef.current.rotation.y, x * 0.5, 0.1);
          }

      } else if (gesture === 'Fist') {
          // Trigger appearance / Lock position?

          const targetX = x * 4;
          const targetY = y * 3;

          heartRef.current.position.x = THREE.MathUtils.lerp(heartRef.current.position.x, targetX, 0.2);
          heartRef.current.position.y = THREE.MathUtils.lerp(heartRef.current.position.y, targetY, 0.2);

          // Reset rotation or specific fist animation
          isInteracting.current = false;
      }

      lastHandPos.current.copy(currentPos);
      wasPresent.current = true;

    } else {
        // No hand - Idle
        wasPresent.current = false;
        isInteracting.current = false;

        // Gentle float
        heartRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.002;

        // Apply inertia if any
        heartRef.current.rotation.y += velocity.current.x * 5;
        heartRef.current.rotation.x += velocity.current.y * 5;

        // Friction
        velocity.current.multiplyScalar(0.95);

        // Return to center slowly?
        heartRef.current.position.x = THREE.MathUtils.lerp(heartRef.current.position.x, 0, 0.02);
    }
  });

  return (
    <>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a00e0" />

        <group ref={heartRef}>
            <HeartMesh />
            {gesture === 'Fist' && (
                <Sparkles count={50} scale={3} size={4} speed={0.4} opacity={0.5} color="#ffd700" />
            )}
        </group>

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
    </>
  );
};
