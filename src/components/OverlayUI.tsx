import React from 'react';
import { useStore } from '../store';

export default function OverlayUI() {
  const {
    customText, setCustomText,
    rotationSpeed, setRotationSpeed,
    boxColor, setBoxColor,
    imageUrl, setImageUrl
  } = useStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute top-0 left-0 z-10 p-4 w-full max-w-md pointer-events-none">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/20 pointer-events-auto text-white">
        <h1 className="text-2xl font-bold mb-4">Personalize Your Gift</h1>

        <div className="space-y-4">
          {/* Custom Text Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 rounded border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your message..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium mb-1">Box Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={boxColor}
                onChange={(e) => setBoxColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-white/50 uppercase">{boxColor}</span>
            </div>
          </div>

          {/* Rotation Speed Slider */}
          <div>
            <label className="block text-sm font-medium mb-1">Rotation Speed: {rotationSpeed.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

           {/* Image Upload */}
           <div>
            <label className="block text-sm font-medium mb-1">Upload Image (Texture)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-slate-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-500 file:text-white
                hover:file:bg-indigo-600
                cursor-pointer"
            />
            {imageUrl && (
              <div className="mt-2 text-xs text-green-400">Image loaded!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
