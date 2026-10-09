import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterAnimationController, MascotState } from './CharacterAnimationController';

export interface RiggedRobotLoadResult {
  root: THREE.Group;
  controller: CharacterAnimationController;
  update: (delta: number, elapsed: number, state: MascotState) => void;
  dispose: () => void;
}

export class RiggedRobotModel {
  /**
   * Loads and equips the genuinely rigged robot GLB with high-end PBR materials,
   * animated cyan LED visor, bone-anchored headphones, and full skeletal animation.
   */
  public static async load(modelUrl = './assets/character/robot.glb'): Promise<RiggedRobotLoadResult> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        modelUrl,
        (gltf) => {
          const root = gltf.scene;

          // 1. Dynamic Canvas for Glowing Cyan LED Eyes on Face Screen
          const faceCanvas = document.createElement('canvas');
          faceCanvas.width = 512;
          faceCanvas.height = 256;
          const faceCtx = faceCanvas.getContext('2d')!;
          const faceTexture = new THREE.CanvasTexture(faceCanvas);
          faceTexture.colorSpace = THREE.SRGBColorSpace;
          faceTexture.minFilter = THREE.LinearFilter;
          faceTexture.magFilter = THREE.LinearFilter;

          // 2. Premium PBR Materials Matching Reference Design
          const whiteSuitMaterial = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.25,
            metalness: 0.05,
          });

          const electricBlueMaterial = new THREE.MeshStandardMaterial({
            color: 0x1d4ed8,
            roughness: 0.3,
            metalness: 0.15,
          });

          const cyanGlowMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00b4d8,
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.1,
          });

          const visorMaterial = new THREE.MeshStandardMaterial({
            color: 0x05070f,
            roughness: 0.08,
            metalness: 0.1,
            map: faceTexture,
            emissive: 0xffffff,
            emissiveMap: faceTexture,
            emissiveIntensity: 0.95,
          });

          // 3. Upgrade Skinned Mesh Materials
          root.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // If multi-material array
              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((mat) => {
                  if (mat.name === 'Black') return visorMaterial;
                  if (mat.name === 'Grey') return electricBlueMaterial;
                  return whiteSuitMaterial;
                });
              } else if (mesh.material) {
                if (mesh.material.name === 'Black') {
                  mesh.material = visorMaterial;
                } else if (mesh.material.name === 'Grey') {
                  mesh.material = electricBlueMaterial;
                } else {
                  mesh.material = whiteSuitMaterial;
                }
              }
            }
          });

          // 4. Initialize Three.js AnimationMixer & Controller
          const mixer = new THREE.AnimationMixer(root);
          const controller = new CharacterAnimationController(mixer, gltf.animations);

          // Start in idle
          controller.setState('idle');

          // 8. Face Screen Rendering State
          let blinkTimer = 0;
          let isBlinking = false;
          let eyeBlinkProgress = 0;

          const renderVisorFace = (state: MascotState, time: number) => {
            const ctx = faceCtx;
            const w = faceCanvas.width;
            const h = faceCanvas.height;

            ctx.fillStyle = '#060a17';
            ctx.fillRect(0, 0, w, h);

            // Natural blinking every ~3.5 seconds
            blinkTimer += 0.016;
            if (blinkTimer > 3.5) {
              isBlinking = true;
              blinkTimer = 0;
            }
            if (isBlinking) {
              eyeBlinkProgress += 0.18;
              if (eyeBlinkProgress >= Math.PI) {
                isBlinking = false;
                eyeBlinkProgress = 0;
              }
            }
            const blinkScaleY = isBlinking ? Math.max(0.08, 1 - Math.sin(eyeBlinkProgress)) : 1.0;

            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00f0ff';
            ctx.fillStyle = '#38bdf8';

            const leftEyeX = w * 0.35;
            const rightEyeX = w * 0.65;
            const eyeY = h * 0.48;

            ctx.save();

            switch (state) {
              case 'celebrating':
                // Happy curved arcs (⌒ ⌒)
                ctx.lineWidth = 14;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(leftEyeX, eyeY + 10, 36, Math.PI * 1.15, Math.PI * 1.85);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(rightEyeX, eyeY + 10, 36, Math.PI * 1.15, Math.PI * 1.85);
                ctx.stroke();

                // Blushing cheeks
                ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
                ctx.beginPath();
                ctx.ellipse(leftEyeX - 14, eyeY + 34, 16, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(rightEyeX + 14, eyeY + 34, 16, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

              case 'speaking':
                // Speech wave bounce synchronized with audio
                const speakScale = blinkScaleY * (0.85 + Math.abs(Math.sin(time * 12)) * 0.25);
                ctx.save();
                ctx.translate(leftEyeX, eyeY);
                ctx.scale(1.0, speakScale);
                drawRoundedEye(ctx, 0, 0, 26, 38, 14);
                ctx.restore();

                ctx.save();
                ctx.translate(rightEyeX, eyeY);
                ctx.scale(1.0, speakScale);
                drawRoundedEye(ctx, 0, 0, 26, 38, 14);
                ctx.restore();
                break;

              case 'greeting':
              case 'entering':
                // Friendly wink (left rounded, right arch)
                ctx.save();
                ctx.translate(leftEyeX, eyeY);
                ctx.scale(1.0, blinkScaleY);
                drawRoundedEye(ctx, 0, 0, 28, 42, 14);
                ctx.restore();

                ctx.lineWidth = 14;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(rightEyeX, eyeY + 8, 30, Math.PI * 1.15, Math.PI * 1.85);
                ctx.stroke();
                break;

              case 'sleeping':
              case 'dismissing':
                // Sleepy closed lines (— —)
                ctx.lineWidth = 12;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(leftEyeX - 28, eyeY + 6);
                ctx.lineTo(leftEyeX + 28, eyeY + 6);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(rightEyeX - 28, eyeY + 6);
                ctx.lineTo(rightEyeX + 28, eyeY + 6);
                ctx.stroke();
                break;

              case 'thinking':
              case 'listening':
                // Inquisitive curved eyes with slight upward gaze
                ctx.save();
                ctx.translate(leftEyeX, eyeY - 6);
                ctx.scale(1.0, blinkScaleY);
                drawRoundedEye(ctx, 0, 0, 28, 36, 14);
                ctx.restore();

                ctx.save();
                ctx.translate(rightEyeX, eyeY - 6);
                ctx.scale(1.0, blinkScaleY);
                drawRoundedEye(ctx, 0, 0, 28, 36, 14);
                ctx.restore();
                break;

              case 'idle':
              default:
                // Classic glowing cyan pill-shaped eyes
                ctx.save();
                ctx.translate(leftEyeX, eyeY);
                ctx.scale(1.0, blinkScaleY);
                drawRoundedEye(ctx, 0, 0, 26, 40, 14);
                ctx.restore();

                ctx.save();
                ctx.translate(rightEyeX, eyeY);
                ctx.scale(1.0, blinkScaleY);
                drawRoundedEye(ctx, 0, 0, 26, 40, 14);
                ctx.restore();
                break;
            }

            ctx.restore();
            faceTexture.needsUpdate = true;
          };

          const drawRoundedEye = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, r: number) => {
            ctx.beginPath();
            ctx.roundRect(x - rx, y - ry, rx * 2, ry * 2, r);
            ctx.fill();

            // Pupil specular highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x - rx * 0.3, y - ry * 0.35, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
          };

          // 9. Per-Frame Update Function
          const update = (delta: number, elapsed: number, state: MascotState) => {
            controller.update(delta);
            renderVisorFace(state, elapsed);
          };

          const dispose = () => {
            controller.dispose();
            faceTexture.dispose();
            whiteSuitMaterial.dispose();
            electricBlueMaterial.dispose();
            cyanGlowMaterial.dispose();
            visorMaterial.dispose();
          };

          resolve({
            root,
            controller,
            update,
            dispose,
          });
        },
        undefined,
        (err) => reject(err)
      );
    });
  }
}
