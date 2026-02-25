import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { useHandTracking } from './hooks/useHandTracking';
import clsx from 'clsx';

function App() {
  const { videoRef, gesture, isPresent, handDataRef } = useHandTracking();

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
       {/* Video Feed (Hidden or Overlay for debugging) */}
       {/* Usually hidden in production or styled minimally */}
       <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-30 hover:opacity-100 transition-opacity">
           <video
             ref={videoRef}
             className="w-32 h-24 object-cover rounded-lg border border-white/20 shadow-lg grayscale"
             playsInline
             muted
             style={{ transform: 'scaleX(-1)' }} // Mirror effect
           />
       </div>

       <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          className="w-full h-full block"
          dpr={[1, 2]} // High DPI
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }} // Optimizations
       >
          <Scene handDataRef={handDataRef} gesture={gesture} isPresent={isPresent} />
       </Canvas>

       {/* Minimalist UI Overlay */}
       <div className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center pointer-events-none space-y-4">
          <div className={clsx(
              "px-6 py-3 rounded-full backdrop-blur-md border border-white/10 transition-all duration-500",
              isPresent ? "bg-white/5 translate-y-0 opacity-100" : "bg-transparent translate-y-4 opacity-0"
          )}>
             <p className="text-white font-light tracking-[0.2em] uppercase text-xs">
                {gesture === 'None' ? 'Align Hand' :
                 gesture === 'Fist' ? 'Summoning' :
                 'Interacting'}
             </p>
          </div>

          <div className={clsx(
              "transition-opacity duration-1000 absolute bottom-0 mb-4",
              !isPresent ? "opacity-100 delay-500" : "opacity-0"
          )}>
              <p className="text-white/30 text-xs font-light tracking-[0.3em] uppercase animate-pulse">
                  Raise Hand to Begin
              </p>
          </div>
       </div>

       {/* Brand / Title (Subtle) */}
       <div className="absolute top-6 right-8 pointer-events-none">
           <h1 className="text-white/20 font-thin tracking-[0.5em] text-xs uppercase">Ethereal Heart</h1>
       </div>
    </div>
  );
}

export default App;
