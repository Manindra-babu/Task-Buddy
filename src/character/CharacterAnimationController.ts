import * as THREE from 'three';

export type MascotState =
  | 'hidden'
  | 'entering'
  | 'idle'
  | 'greeting'
  | 'speaking'
  | 'thinking'
  | 'alert'
  | 'celebrating'
  | 'listening'
  | 'sleeping'
  | 'dismissing';

export interface AnimationControllerOptions {
  onStateChange?: (state: MascotState) => void;
}

export class CharacterAnimationController {
  private currentState: MascotState = 'idle';
  private mixer: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction: THREE.AnimationAction | null = null;
  private stateTimeout: NodeJS.Timeout | null = null;
  private options?: AnimationControllerOptions;

  constructor(mixer: THREE.AnimationMixer, clips: THREE.AnimationClip[], options?: AnimationControllerOptions) {
    this.mixer = mixer;
    this.options = options;

    // Register all imported clips
    clips.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name.toLowerCase(), action);
    });
  }

  public getCurrentState(): MascotState {
    return this.currentState;
  }

  /**
   * Transition to a new mascot state with smooth crossfading
   */
  public setState(nextState: MascotState, duration?: number): void {
    if (this.currentState === nextState && nextState !== 'speaking') return;

    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = null;
    }

    const previousState = this.currentState;
    this.currentState = nextState;
    if (this.options?.onStateChange) {
      this.options.onStateChange(nextState);
    }

    // Determine target clip and looping behavior
    let targetClipName = '';
    let loopOnce = false;
    let autoReturnToIdleAfter = 0;

    switch (nextState) {
      case 'entering':
      case 'greeting':
        targetClipName = this.findAvailableClip(['wave', 'yes', 'standing']);
        loopOnce = true;
        autoReturnToIdleAfter = 2400; // Returns smoothly to idle after waving
        break;

      case 'speaking':
        targetClipName = this.findAvailableClip(['yes', 'wave', 'idle']);
        loopOnce = false;
        break;

      case 'thinking':
        targetClipName = this.findAvailableClip(['sitting', 'standing', 'idle']);
        loopOnce = true;
        autoReturnToIdleAfter = duration || 3000;
        break;

      case 'alert':
        targetClipName = this.findAvailableClip(['standing', 'walkjump', 'jump', 'idle']);
        loopOnce = true;
        autoReturnToIdleAfter = duration || 2500;
        break;

      case 'celebrating':
        targetClipName = this.findAvailableClip(['thumbsup', 'dance', 'jump', 'wave']);
        loopOnce = true;
        autoReturnToIdleAfter = duration || 3200;
        break;

      case 'listening':
        targetClipName = this.findAvailableClip(['standing', 'sitting', 'idle']);
        loopOnce = false;
        break;

      case 'sleeping':
        targetClipName = this.findAvailableClip(['sitting', 'idle']);
        loopOnce = false;
        break;

      case 'dismissing':
        targetClipName = this.findAvailableClip(['no', 'standing', 'idle']);
        loopOnce = true;
        autoReturnToIdleAfter = 800;
        break;

      case 'hidden':
        this.stopAll();
        return;

      case 'idle':
      default:
        targetClipName = this.findAvailableClip(['idle', 'standing']);
        loopOnce = false;
        break;
    }

    this.playClip(targetClipName, loopOnce, 0.35);

    // If an action should auto-return to idle (e.g. wave or celebrate), schedule it
    if (autoReturnToIdleAfter > 0) {
      this.stateTimeout = setTimeout(() => {
        if (this.currentState === nextState) {
          this.setState('idle');
        }
      }, autoReturnToIdleAfter);
    }
  }

  private findAvailableClip(candidates: string[]): string {
    for (const name of candidates) {
      for (const [key] of this.actions) {
        if (key.includes(name)) return key;
      }
    }
    // Fallback to first available action
    return this.actions.keys().next().value || '';
  }

  private playClip(clipName: string, once = false, fadeTime = 0.35): void {
    if (!clipName) return;
    const nextAction = this.actions.get(clipName.toLowerCase());
    if (!nextAction) return;

    if (this.currentAction === nextAction && nextAction.isRunning()) {
      return;
    }

    if (once) {
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
    } else {
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      nextAction.clampWhenFinished = false;
    }

    nextAction.reset();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, fadeTime, true);
    } else {
      nextAction.fadeIn(fadeTime);
    }

    nextAction.play();
    this.currentAction = nextAction;
  }

  public update(delta: number): void {
    this.mixer.update(delta);
  }

  public stopAll(): void {
    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = null;
    }
    this.mixer.stopAllAction();
    this.currentAction = null;
  }

  public dispose(): void {
    this.stopAll();
    this.actions.clear();
  }
}
