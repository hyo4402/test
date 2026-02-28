import Scene3D from './components/Scene3D';
import OverlayUI from './components/OverlayUI';

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 2D UI Overlay */}
      <OverlayUI />

      {/* 3D Scene */}
      <Scene3D />
    </div>
  );
}

export default App;
