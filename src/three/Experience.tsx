import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function Experience() {
  return (
    <div className="experience">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}