import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, type Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export type Gesture = 'Fist' | 'Open' | 'None';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandData {
  landmarks: Landmark[]; // normalized landmarks
  worldLandmarks: Landmark[]; // world landmarks
  gesture: Gesture;
  isPresent: boolean;
}

// Helper to calculate Euclidean distance
const dist = (p1: Landmark, p2: Landmark) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));

const isFist = (landmarks: Landmark[]) => {
  // Check fingers (Index, Middle, Ring, Pinky)
  // Tips: 8, 12, 16, 20
  // PIPs: 6, 10, 14, 18
  // Wrist is 0

  const wrist = landmarks[0];
  const fingers = [
    { tip: 8, pip: 6 },
    { tip: 12, pip: 10 },
    { tip: 16, pip: 14 },
    { tip: 20, pip: 18 }
  ];

  let curledCount = 0;

  for (const finger of fingers) {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];

    // Check if tip is closer to wrist than PIP (curled)
    if (dist(tip, wrist) < dist(pip, wrist)) {
      curledCount++;
    }
  }

  // Thumb check (optional but helps). If tip (4) is close to Pinky MCP (17)
  const thumbTip = landmarks[4];
  const pinkyMCP = landmarks[17];
  if (dist(thumbTip, pinkyMCP) < 0.2) { // arbitrary threshold, might need tuning
      curledCount++;
  }

  return curledCount >= 3;
};

const isOpen = (landmarks: Landmark[]) => {
   const wrist = landmarks[0];
   const fingers = [
    { tip: 8, pip: 6 },
    { tip: 12, pip: 10 },
    { tip: 16, pip: 14 },
    { tip: 20, pip: 18 }
  ];

  let extendedCount = 0;

  for (const finger of fingers) {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];

    // Check if tip is further from wrist than PIP (extended)
    if (dist(tip, wrist) > dist(pip, wrist)) {
      extendedCount++;
    }
  }

  return extendedCount >= 3;
}

export const useHandTracking = () => {
  const [gesture, setGesture] = useState<Gesture>('None');
  const [isPresent, setIsPresent] = useState(false);
  const handDataRef = useRef<HandData>({
      landmarks: [],
      worldLandmarks: [],
      gesture: 'None',
      isPresent: false
  });

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  const onVideoRef = useCallback((element: HTMLVideoElement | null) => {
      setVideoElement(element);
  }, []);

  useEffect(() => {
     if (!videoElement) return;

     const hands = new Hands({
         locateFile: (file) => {
             return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
         }
     });

     hands.setOptions({
         maxNumHands: 1,
         modelComplexity: 1,
         minDetectionConfidence: 0.5,
         minTrackingConfidence: 0.5
     });

     hands.onResults((results: Results) => {
         if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
             const landmarks = results.multiHandLandmarks[0];
             const worldLandmarks = results.multiHandWorldLandmarks[0];

             let detectedGesture: Gesture = 'None';
             if (isFist(landmarks)) detectedGesture = 'Fist';
             else if (isOpen(landmarks)) detectedGesture = 'Open';
             else detectedGesture = 'Open'; // Default to Open if ambiguous but present

             // Update ref
             handDataRef.current = {
                 landmarks,
                 worldLandmarks,
                 gesture: detectedGesture,
                 isPresent: true
             };

             // Update state
             setGesture(prev => prev !== detectedGesture ? detectedGesture : prev);
             setIsPresent(prev => !prev ? true : prev);

         } else {
             handDataRef.current = { ...handDataRef.current, isPresent: false, gesture: 'None' };
             setIsPresent(prev => prev ? false : prev);
             setGesture(prev => prev !== 'None' ? 'None' : prev);
         }
     });

     const camera = new Camera(videoElement, {
         onFrame: async () => {
             await hands.send({image: videoElement});
         },
         width: 1280,
         height: 720
     });

     camera.start();
     cameraRef.current = camera;
     handsRef.current = hands;

     return () => {
         if (cameraRef.current) {
             cameraRef.current.stop();
             cameraRef.current = null;
         }
         if (handsRef.current) {
             handsRef.current.close();
             handsRef.current = null;
         }
     }
  }, [videoElement]);

  return { videoRef: onVideoRef, gesture, isPresent, handDataRef };
}
