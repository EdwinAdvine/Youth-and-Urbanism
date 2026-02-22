/**
 * AvatarCanvas — core Three.js 3D avatar renderer.
 *
 * Loads a GLB model (Ready Player Me format), applies morph target
 * updates for lip sync and gesture animations, and renders in a
 * transparent <canvas> element.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAvatarStore } from '../../store/avatarStore';

interface AvatarCanvasProps {
  modelUrl: string;
  width?: number | string;
  height?: number | string;
  /** When true, avatar animates at 60fps. When false, only renders on demand. */
  animate?: boolean;
  /** Enable orbit controls for preview mode. */
  enableControls?: boolean;
  className?: string;
}

/** Inner component rendered inside the Canvas. */
function AvatarModel({
  modelUrl,
  animate = false,
}: {
  modelUrl: string;
  animate?: boolean;
}) {
  const { scene } = useGLTF(modelUrl);
  const meshesRef = useRef<THREE.SkinnedMesh[]>([]);

  const currentViseme = useAvatarStore((s) => s.currentViseme);
  const isAvatarSpeaking = useAvatarStore((s) => s.isAvatarSpeaking);

  // Collect all skinned meshes with morph targets
  useEffect(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    scene.traverse((child) => {
      if (
        child instanceof THREE.SkinnedMesh &&
        child.morphTargetInfluences &&
        child.morphTargetDictionary
      ) {
        meshes.push(child);
      }
    });
    meshesRef.current = meshes;
  }, [scene]);

  // Map Oculus viseme IDs to ARKit blendshape names
  const visemeMap = useMemo(
    () => [
      'viseme_sil', // 0: silence
      'viseme_aa',  // 1
      'viseme_E',   // 2
      'viseme_I',   // 3
      'viseme_O',   // 4
      'viseme_U',   // 5
      'viseme_FF',  // 6
      'viseme_TH',  // 7
      'viseme_DD',  // 8
      'viseme_kk',  // 9
      'viseme_CH',  // 10
      'viseme_SS',  // 11
      'viseme_nn',  // 12
      'viseme_RR',  // 13
      'viseme_PP',  // 14
      // Also map to generic jaw opening as fallback
      'jawOpen',
    ],
    []
  );

  useFrame(() => {
    if (!animate && !isAvatarSpeaking) return;

    for (const mesh of meshesRef.current) {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) continue;

      // Reset all viseme influences
      for (const name of visemeMap) {
        const idx = dict[name];
        if (idx !== undefined) {
          // Smooth decay
          influences[idx] = THREE.MathUtils.lerp(influences[idx], 0, 0.3);
        }
      }

      // Apply current viseme
      if (isAvatarSpeaking && currentViseme >= 0 && currentViseme < visemeMap.length) {
        const targetName = visemeMap[currentViseme];
        const idx = dict[targetName];
        if (idx !== undefined) {
          influences[idx] = THREE.MathUtils.lerp(influences[idx], 0.8, 0.5);
        }

        // Also drive jawOpen proportionally
        const jawIdx = dict['jawOpen'];
        if (jawIdx !== undefined) {
          const jawTarget = currentViseme === 0 ? 0 : 0.1 + (currentViseme % 5) * 0.06;
          influences[jawIdx] = THREE.MathUtils.lerp(influences[jawIdx], jawTarget, 0.4);
        }
      }
    }
  });

  return <primitive object={scene} position={[0, -0.5, 0]} scale={1} />;
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  modelUrl,
  width = '100%',
  height = '100%',
  animate = false,
  enableControls = false,
  className = '',
}) => {
  return (
    <div className={className} style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0.5, 1.2], fov: 35 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={0.8} />
        <directionalLight position={[-2, 1, -2]} intensity={0.3} />
        <React.Suspense fallback={null}>
          <AvatarModel modelUrl={modelUrl} animate={animate} />
        </React.Suspense>
        {enableControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
        )}
      </Canvas>
    </div>
  );
};

export default AvatarCanvas;
