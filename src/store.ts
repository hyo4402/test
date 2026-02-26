import { create } from 'zustand';

interface AppState {
  customText: string;
  imageUrl: string | null;
  rotationSpeed: number;
  boxColor: string;
  setCustomText: (text: string) => void;
  setImageUrl: (url: string | null) => void;
  setRotationSpeed: (speed: number) => void;
  setBoxColor: (color: string) => void;
}

export const useStore = create<AppState>((set) => ({
  customText: 'Hello World',
  imageUrl: null,
  rotationSpeed: 1,
  boxColor: '#6366f1', // Indigo-500 default
  setCustomText: (text) => set({ customText: text }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  setBoxColor: (color) => set({ boxColor: color }),
}));
