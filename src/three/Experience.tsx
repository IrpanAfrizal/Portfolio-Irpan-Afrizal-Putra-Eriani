import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function Experience() {
  return (
    <div className="experience" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}