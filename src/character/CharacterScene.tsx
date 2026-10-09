import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterAnimationState } from '../shared/types';

interface CharacterSceneProps {
  state: CharacterAnimationState;
  avatarModel?: 'student' | 'robot';
  onError?: (err: Error) => void;
}

export const CharacterScene: React.FC<CharacterSceneProps> = ({
  state,
  avatarModel = 'student',
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const characterMeshRef = useRef<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 440;
    const height = containerRef.current.clientHeight || 420;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Adjusted camera position to frame the upper body & face nicely in the bottom area
    camera.position.set(0, 1.4, 2.5);
    camera.lookAt(0, 0.9, 0);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(3, 6, 4);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // 5. Load 3D model
    const loader = new GLTFLoader();
    const modelPath =
      avatarModel === 'robot'
        ? './assets/character/robot.glb'
        : './assets/character/character.glb';

    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene;
        characterMeshRef.current = root;

        // Customize meshes: Hide weapon attachments if present
        root.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            const name = mesh.name.toLowerCase();
            if (
              name.includes('sniper') ||
              name.includes('smg') ||
              name.includes('gun') ||
              name.includes('pistol') ||
              name.includes('revolver') ||
              name.includes('rocket') ||
              name.includes('knife') ||
              name.includes('shotgun') ||
              name.includes('ak') ||
              name.includes('shovel')
            ) {
              mesh.visible = false;
            }

            // Apply vibrant student outfit colors
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.name === 'Character_Main') {
                mat.color.set('#2563eb'); // TaskBuddy student blue
                mat.roughness = 0.4;
              } else if (mat.name === 'Pants') {
                mat.color.set('#1e293b'); // Navy trousers
              }
            }
          }
        });

        // Scale & position model
        root.scale.set(1.1, 1.1, 1.1);
        root.position.set(0, -0.4, 0);
        scene.add(root);

        // Setup animation mixer
        const mixer = new THREE.AnimationMixer(root);
        mixerRef.current = mixer;

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          actionsRef.current.set(clip.name, action);
        });

        // Trigger entrance wave
        playStateAnimation('entering');
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D character asset:', err);
        setLoadError(err.message);
        if (onError) onError(err);
      }
    );

    // 6. Animation render loop
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Gentle procedural idle breathing/hover if model is loaded
      if (characterMeshRef.current) {
        characterMeshRef.current.position.y =
          -0.4 + Math.sin(clock.getElapsedTime() * 1.5) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [avatarModel]);

  // Handle state changes
  useEffect(() => {
    playStateAnimation(state);
  }, [state]);

  const playStateAnimation = (animState: CharacterAnimationState) => {
    const mixer = mixerRef.current;
    if (!mixer || actionsRef.current.size === 0) return;

    let targetClipName = '';
    const availableClips = Array.from(actionsRef.current.keys());

    // Map high-level state to available animation clip
    switch (animState) {
      case 'entering':
        targetClipName =
          availableClips.find((c) => c.includes('Wave')) || availableClips[0];
        break;
      case 'speaking':
        targetClipName =
          availableClips.find((c) => c.includes('Yes')) ||
          availableClips.find((c) => c.includes('Idle')) ||
          availableClips[0];
        break;
      case 'celebrating':
        targetClipName =
          availableClips.find((c) => c.includes('Jump')) ||
          availableClips.find((c) => c.includes('Dance')) ||
          availableClips.find((c) => c.includes('Wave')) ||
          availableClips[0];
        break;
      case 'dismissed':
      case 'exiting':
        targetClipName =
          availableClips.find((c) => c.includes('No')) ||
          availableClips.find((c) => c.includes('Idle')) ||
          availableClips[0];
        break;
      case 'idle':
      default:
        targetClipName =
          availableClips.find((c) => c.includes('Idle')) || availableClips[0];
        break;
    }

    const nextAction = actionsRef.current.get(targetClipName);
    if (!nextAction) return;

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.3);
    }

    nextAction.reset().fadeIn(0.3).play();
    currentActionRef.current = nextAction;
  };

  if (loadError) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
        <div style={{ fontWeight: 700, color: '#0f172a' }}>TaskBuddy Companion</div>
        <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
          Visual fallback mode active
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="drag-region"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'grab',
      }}
    />
  );
};
