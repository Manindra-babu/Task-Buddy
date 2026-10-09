import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterAnimationState } from '../shared/types';
import { RiggedRobotModel, RiggedRobotLoadResult } from './RiggedRobotModel';
import { MascotState } from './CharacterAnimationController';

interface CharacterSceneProps {
  state: CharacterAnimationState;
  onError?: (err: Error) => void;
  width?: number;
  height?: number;
}

export const CharacterScene: React.FC<CharacterSceneProps> = ({
  state,
  onError,
  width = 210,
  height = 230,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotResultRef = useRef<RiggedRobotLoadResult | null>(null);
  const stateRef = useRef<CharacterAnimationState>(state);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sync state changes to controller
  useEffect(() => {
    stateRef.current = state;
    if (robotResultRef.current) {
      const mascotState = mapToMascotState(state);
      robotResultRef.current.controller.setState(mascotState);
    }
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderWidth = width;
    const renderHeight = height;

    // 1. Three.js Scene
    const scene = new THREE.Scene();

    // 2. Camera Setup (FOV = 35 for low distortion, portrait framing)
    const fov = 35;
    const aspect = renderWidth / renderHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);

    // 3. Transparent WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(renderWidth, renderHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Soft Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (warm-white from upper front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 4, 3.5);
    scene.add(keyLight);

    // Fill Light (soft blue from front-left)
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 1.3);
    fillLight.position.set(-2.5, 2, 2.5);
    scene.add(fillLight);

    // Rim Light (electric blue from behind to outline the silhouette against dark/light desktops)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(0, 3, -3.5);
    scene.add(rimLight);

    // Ground Bounce
    const bounceLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    bounceLight.position.set(0, -2, 1);
    scene.add(bounceLight);

    // 5. Load Rigged 3D Robot
    let isDestroyed = false;
    let reqId: number;
    const clock = new THREE.Clock();

    RiggedRobotModel.load()
      .then((loaded) => {
        if (isDestroyed) {
          loaded.dispose();
          return;
        }

        robotResultRef.current = loaded;
        scene.add(loaded.root);

        // Precise Mathematical Bounding Box Framing:
        // Guarantees visible character height is ~195 CSS pixels at 100% scale (within 180-240px target)
        // without cropping head, headphones, hands, or sneakers!
        const box = new THREE.Box3().setFromObject(loaded.root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Center model
        loaded.root.position.x = -center.x;
        loaded.root.position.y = -center.y;
        loaded.root.position.z = -center.z;

        // Turn mascot slightly toward the reminder card on the left (-10 degrees)
        loaded.root.rotation.y = -0.18;

        // Camera distance calculation:
        // 85% vertical fill ratio = ~195 CSS pixels visible height in 230px container
        const targetWorldHeight = size.y / 0.85;
        const halfFovRad = ((fov / 2) * Math.PI) / 180;
        const cameraDistance = (targetWorldHeight / 2) / Math.tan(halfFovRad);

        camera.position.set(0, 0, cameraDistance);
        camera.lookAt(0, 0, 0);

        // Initialize state
        loaded.controller.setState(mapToMascotState(stateRef.current));

        // Start render loop only after model is ready
        const renderLoop = () => {
          if (isDestroyed) return;
          reqId = requestAnimationFrame(renderLoop);

          const delta = clock.getDelta();
          const elapsed = clock.getElapsedTime();

          const activeState = mapToMascotState(stateRef.current);
          loaded.update(delta, elapsed, activeState);

          renderer.render(scene, camera);
        };

        renderLoop();
      })
      .catch((err) => {
        console.error('Failed to load rigged 3D mascot:', err);
        setLoadError(err?.message || 'Error loading 3D model');
        if (onError) onError(err);
      });

    // Cleanup when component unmounts
    return () => {
      isDestroyed = true;
      cancelAnimationFrame(reqId);
      if (robotResultRef.current) {
        robotResultRef.current.dispose();
        robotResultRef.current = null;
      }
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  if (loadError) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <span style={{ fontSize: 32 }}>🤖</span>
        <span style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: '#0f172a' }}>
          TaskBuddy
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="drag-region"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none',
      }}
    />
  );
};

function mapToMascotState(state: CharacterAnimationState): MascotState {
  switch (state) {
    case 'entering':
    case 'greeting':
      return 'greeting';
    case 'speaking':
      return 'speaking';
    case 'pointing':
    case 'alert':
      return 'alert';
    case 'thinking':
      return 'thinking';
    case 'celebrating':
      return 'celebrating';
    case 'listening':
      return 'listening';
    case 'sleeping':
      return 'sleeping';
    case 'dismissed':
    case 'exiting':
      return 'dismissing';
    case 'hidden':
      return 'hidden';
    case 'idle':
    default:
      return 'idle';
  }
}
