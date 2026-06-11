import React, { Component, ErrorInfo, ReactNode, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Model failed to load, falling back to empty canvas:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ModelProps {
  modelPath: string;
}

function Model({ modelPath }: ModelProps) {
  const { scene, animations } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, modelRef);

  // Play the first available animation automatically
  React.useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstActionKey = Object.keys(actions)[0];
      actions[firstActionKey]?.play();
    }
  }, [actions]);

  // Apply custom materials to match the Kohnrad brand palette
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#a3e635'),
          emissive: new THREE.Color('#a3e635'),
          emissiveIntensity: 0.15,
          roughness: 0.4,
          metalness: 0.6,
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (modelRef.current) {
      // Subtle floating animation on the Y position (keeps the hovering effect)
      modelRef.current.position.y = -3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      // Positioned to the bottom-right and scaled up
      position={[6, -4, 0]} 
      scale={[3, 3, 3]} 
      rotation={[0, 0, 0]}
    />
  );
}

export default function HeroCanvas({ modelPath = '/assets/model.glb' }: { modelPath?: string }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1.5, 5] }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-3, 2, -3]} intensity={0.8} color="#a3e635" />
        <pointLight position={[0, -2, 0]} intensity={0.4} color="#f97316" />
        
        <ErrorBoundary fallback={null}>
          <Model modelPath={modelPath} />
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}
