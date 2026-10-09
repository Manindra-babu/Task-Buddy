import * as THREE from 'three';
import { CharacterAnimationState } from '../shared/types';

export class RobotModel {
  public group: THREE.Group;

  // Key joints for procedural animations
  private headGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftForearmGroup: THREE.Group;
  private rightForearmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private starMesh: THREE.Mesh;

  // Face screen texture & canvas
  private faceCanvas: HTMLCanvasElement;
  private faceCtx: CanvasRenderingContext2D;
  private faceTexture: THREE.CanvasTexture;
  private blinkTimer = 0;
  private isBlinking = false;
  private eyeBlinkProgress = 0;
  private speakWave = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. Visor LED Face Canvas (512x256 high-resolution for crisp glowing eyes)
    this.faceCanvas = document.createElement('canvas');
    this.faceCanvas.width = 512;
    this.faceCanvas.height = 256;
    this.faceCtx = this.faceCanvas.getContext('2d')!;
    this.faceTexture = new THREE.CanvasTexture(this.faceCanvas);
    this.faceTexture.colorSpace = THREE.SRGBColorSpace;
    this.faceTexture.minFilter = THREE.LinearFilter;
    this.faceTexture.magFilter = THREE.LinearFilter;

    // Materials - Premium PBR materials matching reference image
    // Crisp glossy white helmet and suit
    const whiteSuitMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.05,
    });

    // Electric vibrant blue suit accent & headphones
    const electricBlueMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.3,
      metalness: 0.15,
    });

    // Cyan glowing ring/trim material
    const cyanGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.1,
    });

    // Dark navy/charcoal suit pants and trims
    const darkNavyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Glossy black visor screen
    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x05070f,
      roughness: 0.08,
      metalness: 0.1,
      map: this.faceTexture,
      emissive: 0xffffff,
      emissiveMap: this.faceTexture,
      emissiveIntensity: 0.95,
    });

    // Golden star material for celebrations
    const goldStarMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.6,
    });

    // -------------------------------------------------------------
    // Build Hierarchical Geometry
    // -------------------------------------------------------------

    // --- TORSO ---
    this.torsoGroup = new THREE.Group();
    this.group.add(this.torsoGroup);

    // Torso Jacket (rounded capsule-like box)
    const jacketGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.62, 32);
    const jacketMesh = new THREE.Mesh(jacketGeo, whiteSuitMaterial);
    jacketMesh.position.y = 0.58;
    this.torsoGroup.add(jacketMesh);

    // Blue Center Vest / Zip Panel
    const vestGeo = new THREE.BoxGeometry(0.24, 0.62, 0.44);
    const vestMesh = new THREE.Mesh(vestGeo, electricBlueMaterial);
    vestMesh.position.set(0, 0.58, 0.04);
    this.torsoGroup.add(vestMesh);

    // Silver Zipper line
    const zipGeo = new THREE.BoxGeometry(0.02, 0.58, 0.46);
    const zipMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const zipMesh = new THREE.Mesh(zipGeo, zipMat);
    zipMesh.position.set(0, 0.58, 0.045);
    this.torsoGroup.add(zipMesh);

    // 'T' Emblem on left chest
    const emblemGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    emblemGeo.rotateX(Math.PI / 2);
    const emblemMesh = new THREE.Mesh(emblemGeo, whiteSuitMaterial);
    emblemMesh.position.set(-0.13, 0.68, 0.23);
    this.torsoGroup.add(emblemMesh);

    // Puffy Collar at neck
    const collarGeo = new THREE.TorusGeometry(0.28, 0.08, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, whiteSuitMaterial);
    collarMesh.position.set(0, 0.88, 0);
    this.torsoGroup.add(collarMesh);

    // Belt / Lower Jacket Trim
    const beltGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.08, 32);
    const beltMesh = new THREE.Mesh(beltGeo, electricBlueMaterial);
    beltMesh.position.y = 0.28;
    this.torsoGroup.add(beltMesh);

    // --- HEAD GROUP ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.02, 0);
    this.torsoGroup.add(this.headGroup);

    // Outer Helmet (Smooth rounded futuristic sphere/capsule)
    const helmetGeo = new THREE.SphereGeometry(0.56, 36, 32);
    helmetGeo.scale(1.08, 0.98, 1.02);
    const helmetMesh = new THREE.Mesh(helmetGeo, whiteSuitMaterial);
    this.headGroup.add(helmetMesh);

    // Glossy Curved Visor Screen (Slightly flattened front sphere)
    const visorGeo = new THREE.SphereGeometry(0.51, 32, 28, 0, Math.PI * 2, 0, Math.PI * 0.55);
    visorGeo.rotateX(Math.PI / 2);
    visorGeo.scale(0.92, 0.78, 0.78);
    const visorMesh = new THREE.Mesh(visorGeo, visorMaterial);
    visorMesh.position.set(0, 0.02, 0.16);
    this.headGroup.add(visorMesh);

    // Visor Outer Blue Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(0.42, 0.035, 16, 48);
    bezelGeo.scale(1.08, 0.88, 1);
    const bezelMesh = new THREE.Mesh(bezelGeo, electricBlueMaterial);
    bezelMesh.position.set(0, 0.02, 0.42);
    this.headGroup.add(bezelMesh);

    // --- HEADPHONES / EAR PIECES (Left and Right) ---
    const buildEarPiece = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const side = isLeft ? 1 : -1;

      // Outer pod
      const podGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 28);
      podGeo.rotateZ(Math.PI / 2);
      const podMesh = new THREE.Mesh(podGeo, electricBlueMaterial);
      earGroup.add(podMesh);

      // Cyan glowing inner ring
      const ringGeo = new THREE.TorusGeometry(0.13, 0.02, 16, 28);
      ringGeo.rotateY(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, cyanGlowMaterial);
      earGroup.add(ringMesh);

      // Center white cap
      const capGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24);
      capGeo.rotateZ(Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeo, whiteSuitMaterial);
      earGroup.add(capMesh);

      earGroup.position.set(side * 0.59, 0.05, 0);
      return earGroup;
    };

    this.headGroup.add(buildEarPiece(true));
    this.headGroup.add(buildEarPiece(false));

    // Headband connecting over the top of helmet
    const headbandGeo = new THREE.TorusGeometry(0.57, 0.03, 16, 36, Math.PI * 0.8);
    headbandGeo.rotateZ(Math.PI * 0.1);
    const headbandMesh = new THREE.Mesh(headbandGeo, electricBlueMaterial);
    headbandMesh.position.set(0, 0.05, 0);
    this.headGroup.add(headbandMesh);

    // --- ARMS & HANDS ---
    // Left Arm (Viewer's right)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.42, 0.74, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.24, 20);
    leftUpperArmGeo.translate(0, -0.12, 0);
    const leftUpperArmMesh = new THREE.Mesh(leftUpperArmGeo, whiteSuitMaterial);
    this.leftArmGroup.add(leftUpperArmMesh);

    // Blue arm cuff
    const leftCuffGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20);
    leftCuffGeo.translate(0, -0.22, 0);
    const leftCuffMesh = new THREE.Mesh(leftCuffGeo, electricBlueMaterial);
    this.leftArmGroup.add(leftCuffMesh);

    this.leftForearmGroup = new THREE.Group();
    this.leftForearmGroup.position.set(0, -0.24, 0);
    this.leftArmGroup.add(this.leftForearmGroup);

    const leftHandGeo = new THREE.SphereGeometry(0.11, 20, 20);
    leftHandGeo.scale(0.9, 1.1, 0.9);
    leftHandGeo.translate(0, -0.1, 0);
    const leftHandMesh = new THREE.Mesh(leftHandGeo, whiteSuitMaterial);
    this.leftForearmGroup.add(leftHandMesh);

    // Right Arm (Viewer's left - the waving/pointing arm)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.42, 0.74, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.24, 20);
    rightUpperArmGeo.translate(0, -0.12, 0);
    const rightUpperArmMesh = new THREE.Mesh(rightUpperArmGeo, whiteSuitMaterial);
    this.rightArmGroup.add(rightUpperArmMesh);

    const rightCuffGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20);
    rightCuffGeo.translate(0, -0.22, 0);
    const rightCuffMesh = new THREE.Mesh(rightCuffGeo, electricBlueMaterial);
    this.rightArmGroup.add(rightCuffMesh);

    this.rightForearmGroup = new THREE.Group();
    this.rightForearmGroup.position.set(0, -0.24, 0);
    this.rightArmGroup.add(this.rightForearmGroup);

    const rightHandGeo = new THREE.SphereGeometry(0.11, 20, 20);
    rightHandGeo.scale(0.9, 1.1, 0.9);
    rightHandGeo.translate(0, -0.1, 0);
    const rightHandMesh = new THREE.Mesh(rightHandGeo, whiteSuitMaterial);
    this.rightForearmGroup.add(rightHandMesh);

    // --- LEGS & CHUNKY ASTRONAUT SNEAKERS ---
    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.2, 0.26, 0);
    this.torsoGroup.add(this.leftLegGroup);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.22, 20);
    legGeo.translate(0, -0.1, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, darkNavyMaterial);
    this.leftLegGroup.add(leftLegMesh);

    // Left Boot
    const bootGeo = new THREE.BoxGeometry(0.22, 0.16, 0.32);
    bootGeo.translate(0, -0.25, 0.05);
    const leftBootMesh = new THREE.Mesh(bootGeo, whiteSuitMaterial);
    this.leftLegGroup.add(leftBootMesh);

    const soleGeo = new THREE.BoxGeometry(0.24, 0.05, 0.34);
    soleGeo.translate(0, -0.32, 0.05);
    const leftSoleMesh = new THREE.Mesh(soleGeo, electricBlueMaterial);
    this.leftLegGroup.add(leftSoleMesh);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.2, 0.26, 0);
    this.torsoGroup.add(this.rightLegGroup);

    const rightLegMesh = new THREE.Mesh(legGeo, darkNavyMaterial);
    this.rightLegGroup.add(rightLegMesh);

    const rightBootMesh = new THREE.Mesh(bootGeo, whiteSuitMaterial);
    this.rightLegGroup.add(rightBootMesh);

    const rightSoleMesh = new THREE.Mesh(soleGeo, electricBlueMaterial);
    this.rightLegGroup.add(rightSoleMesh);

    // --- GOLDEN STAR ACCESSORY (for celebrations / good job) ---
    const starShape = new THREE.Shape();
    const outerRadius = 0.22;
    const innerRadius = 0.1;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starExtrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, starExtrudeSettings);
    this.starMesh = new THREE.Mesh(starGeo, goldStarMaterial);
    this.starMesh.position.set(-0.35, 0.55, 0.3);
    this.starMesh.scale.set(0.65, 0.65, 0.65);
    this.starMesh.visible = false;
    this.torsoGroup.add(this.starMesh);

    // Render initial face screen
    this.renderFace('idle', 0);
  }

  // -----------------------------------------------------------------
  // Visor Canvas LED Eyes Renderer (Cyan-Blue Glowing LEDs)
  // -----------------------------------------------------------------
  public renderFace(state: CharacterAnimationState, time: number) {
    const ctx = this.faceCtx;
    const w = this.faceCanvas.width;
    const h = this.faceCanvas.height;

    // Dark glossy glass background
    ctx.fillStyle = '#060a17';
    ctx.fillRect(0, 0, w, h);

    // Handle natural blinking
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.6) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      this.eyeBlinkProgress += 0.18;
      if (this.eyeBlinkProgress >= Math.PI) {
        this.isBlinking = false;
        this.eyeBlinkProgress = 0;
      }
    }
    const blinkScaleY = this.isBlinking ? Math.max(0.08, 1 - Math.sin(this.eyeBlinkProgress)) : 1.0;

    // Cyan LED glow settings
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#38bdf8';

    const leftEyeX = w * 0.35;
    const rightEyeX = w * 0.65;
    const eyeY = h * 0.48;

    ctx.save();

    switch (state) {
      case 'celebrating':
        // Happy curved arcs (⌒ ⌒) like reference image
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineCap = 'round';

        // Left curved eye
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY + 12, 38, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Right curved eye
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY + 12, 38, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Cheerful blushing cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.beginPath();
        ctx.ellipse(leftEyeX - 16, eyeY + 36, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(rightEyeX + 16, eyeY + 36, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'speaking':
        // Attentive animated eyes + subtle eye bounce with speech wave
        this.speakWave = Math.sin(time * 12);
        const speakScaleY = blinkScaleY * (0.85 + Math.abs(this.speakWave) * 0.25);

        // Draw left eye
        ctx.save();
        ctx.translate(leftEyeX, eyeY);
        ctx.scale(1.0, speakScaleY);
        this.drawRoundedEye(ctx, 0, 0, 26, 38, 14);
        ctx.restore();

        // Draw right eye
        ctx.save();
        ctx.translate(rightEyeX, eyeY);
        ctx.scale(1.0, speakScaleY);
        this.drawRoundedEye(ctx, 0, 0, 26, 38, 14);
        ctx.restore();
        break;

      case 'entering':
        // Greeting wink / friendly wide eyes
        ctx.save();
        ctx.translate(leftEyeX, eyeY);
        ctx.scale(1.0, blinkScaleY);
        this.drawRoundedEye(ctx, 0, 0, 28, 42, 14);
        ctx.restore();

        // Right eye is a joyful arch (winking wave)
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY + 8, 32, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        break;

      case 'dismissed':
      case 'exiting':
        // Calm sleepy / gentle closed eyes (— —)
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 30, eyeY + 6);
        ctx.lineTo(leftEyeX + 30, eyeY + 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightEyeX - 30, eyeY + 6);
        ctx.lineTo(rightEyeX + 30, eyeY + 6);
        ctx.stroke();
        break;

      case 'idle':
      default:
        // Classic calm, rounded pill-shaped glowing cyan eyes
        ctx.save();
        ctx.translate(leftEyeX, eyeY);
        ctx.scale(1.0, blinkScaleY);
        this.drawRoundedEye(ctx, 0, 0, 26, 40, 14);
        ctx.restore();

        ctx.save();
        ctx.translate(rightEyeX, eyeY);
        ctx.scale(1.0, blinkScaleY);
        this.drawRoundedEye(ctx, 0, 0, 26, 40, 14);
        ctx.restore();
        break;
    }

    ctx.restore();
    this.faceTexture.needsUpdate = true;
  }

  private drawRoundedEye(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(x - rx, y - ry, rx * 2, ry * 2, radius);
    ctx.fill();

    // Subtle specular pupil reflection dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - rx * 0.3, y - ry * 0.35, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
  }

  // -----------------------------------------------------------------
  // Procedural Animation System (Supports all 8 States smoothly)
  // -----------------------------------------------------------------
  public update(delta: number, state: CharacterAnimationState, elapsedTime: number) {
    // 1. Update face screen
    this.renderFace(state, elapsedTime);

    // 2. Base natural breathing bounce
    const breathing = Math.sin(elapsedTime * 2.2) * 0.015;
    this.torsoGroup.position.y = breathing;

    // 3. Star accessory visibility
    this.starMesh.visible = state === 'celebrating';
    if (this.starMesh.visible) {
      this.starMesh.rotation.z = Math.sin(elapsedTime * 4) * 0.15;
    }

    // 4. Animate limbs based on active state
    switch (state) {
      case 'entering':
        // Friendly wave gesture (right arm up and waving)
        this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, 0.08, 0.1);
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, 0.05, 0.1);

        // Right arm raised in friendly wave
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, 2.3, 0.1);
        this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0.2, 0.1);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(
          this.rightForearmGroup.rotation.z,
          0.4 + Math.sin(elapsedTime * 7) * 0.35,
          0.2
        );

        // Left arm relaxed at side
        this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(this.leftArmGroup.rotation.z, -0.2, 0.1);
        this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.1);
        this.leftForearmGroup.rotation.z = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.z, 0, 0.1);
        break;

      case 'speaking':
        // Attentive posture, pointing gently with right hand toward the reminder card
        this.headGroup.rotation.z = THREE.MathUtils.lerp(
          this.headGroup.rotation.z,
          Math.sin(elapsedTime * 3) * 0.04,
          0.1
        );
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, -0.15, 0.1);

        // Right arm points toward card (left side of screen)
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, 1.2, 0.1);
        this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0.5, 0.1);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(
          this.rightForearmGroup.rotation.z,
          0.6 + Math.sin(elapsedTime * 4) * 0.08,
          0.1
        );

        // Left arm relaxed
        this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(this.leftArmGroup.rotation.z, -0.25, 0.1);
        this.leftForearmGroup.rotation.z = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.z, -0.1, 0.1);
        break;

      case 'celebrating':
        // Both arms raised in triumph, happy bounce
        this.torsoGroup.position.y = Math.abs(Math.sin(elapsedTime * 5)) * 0.08;
        this.headGroup.rotation.z = Math.sin(elapsedTime * 6) * 0.06;

        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, 2.5, 0.15);
        this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0, 0.15);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.z, 0.2, 0.15);

        this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(this.leftArmGroup.rotation.z, -2.5, 0.15);
        this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.15);
        this.leftForearmGroup.rotation.z = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.z, -0.2, 0.15);
        break;

      case 'dismissed':
      case 'exiting':
        // Quiet sleepy relaxed posture
        this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, 0.14, 0.1);
        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0.12, 0.1);
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, 0.2, 0.1);
        this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(this.leftArmGroup.rotation.z, -0.2, 0.1);
        break;

      case 'idle':
      default:
        // Relaxed natural stance
        this.headGroup.rotation.z = THREE.MathUtils.lerp(
          this.headGroup.rotation.z,
          Math.sin(elapsedTime * 1.5) * 0.03,
          0.05
        );
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, 0, 0.05);
        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0, 0.05);

        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(
          this.rightArmGroup.rotation.z,
          0.25 + Math.sin(elapsedTime * 2) * 0.04,
          0.05
        );
        this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0, 0.05);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.z, 0.1, 0.05);

        this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(
          this.leftArmGroup.rotation.z,
          -0.25 - Math.sin(elapsedTime * 2) * 0.04,
          0.05
        );
        this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.05);
        this.leftForearmGroup.rotation.z = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.z, -0.1, 0.05);
        break;
    }
  }

  public dispose() {
    this.faceTexture.dispose();
  }
}
