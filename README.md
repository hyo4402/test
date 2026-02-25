# Ethereal Heart - 3D Interactive Hand Tracking

A high-end interactive 3D Web Application using Camera Hand-Tracking.
Built with React, Three.js, MediaPipe, and Tailwind CSS.

## Features

- **3D Heart**: Procedurally generated heart mesh with a custom "Galaxy/Nebula" shader.
- **Hand Tracking**: Uses Google MediaPipe Hands for low-latency detection.
- **Gestures**:
  - **Fist**: Summons/Activates the heart with particle effects.
  - **Open Palm**: Interaction mode (move and rotate the heart).
  - **Swipe**: Inertia-based physics spinning.
- **Visuals**: Bloom post-processing, floating particles, and dynamic lighting.

## Prerequisites

- Node.js (v16 or higher)
- A webcam (for hand tracking)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser at `http://localhost:5173` (or the port shown in terminal).

3. Allow camera access when prompted.

## Usage

- **Show your hand** to the camera.
- **Clench your fist** to summon the heart and emit sparkles.
- **Open your hand** to move the heart around.
- **Swipe** your hand and release to spin the heart.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Shader**: Custom GLSL shader
- **Tracking**: @mediapipe/hands
- **Styling**: Tailwind CSS
