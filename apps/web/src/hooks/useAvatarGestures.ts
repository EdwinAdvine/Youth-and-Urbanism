/**
 * Gesture animation controller for the 3D avatar.
 *
 * Manages a queue of gesture animations, idle loops (blinking, breathing,
 * head sway), and smooth blending between states.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type GestureType =
  | 'smile'
  | 'nod'
  | 'think'
  | 'point'
  | 'excited'
  | 'calm'
  | 'wave'
  | 'emphasize'
  | 'idle';

/** Morph target weights for each gesture (ARKit blendshape names). */
const GESTURE_BLENDSHAPES: Record<GestureType, Record<string, number>> = {
  smile: { mouthSmileLeft: 0.7, mouthSmileRight: 0.7, cheekSquintLeft: 0.3, cheekSquintRight: 0.3 },
  nod: { headNod: 1.0 },
  think: { browInnerUp: 0.5, eyeLookUpLeft: 0.3, eyeLookUpRight: 0.3 },
  point: { handPoint: 1.0 },
  excited: { mouthSmileLeft: 0.9, mouthSmileRight: 0.9, browInnerUp: 0.6, jawOpen: 0.2 },
  calm: { eyeBlinkLeft: 0.1, eyeBlinkRight: 0.1 },
  wave: { handWave: 1.0 },
  emphasize: { browOuterUpLeft: 0.6, browOuterUpRight: 0.6, jawOpen: 0.15 },
  idle: {},
};

/** Duration of each gesture animation in ms. */
const GESTURE_DURATION_MS = 1200;

/** Idle blink interval range in ms. */
const BLINK_MIN_MS = 2500;
const BLINK_MAX_MS = 5000;

interface GestureControls {
  /** Trigger a gesture animation. */
  playGesture: (gesture: GestureType) => void;
  /** Whether the avatar is in idle state. */
  isIdle: boolean;
  /** Currently active animation name. */
  currentAnimation: GestureType;
  /** Current blendshape weights to apply to the mesh. */
  blendshapeWeights: Record<string, number>;
}

export function useAvatarGestures(): GestureControls {
  const [currentAnimation, setCurrentAnimation] = useState<GestureType>('idle');
  const [isIdle, setIsIdle] = useState(true);
  const [blendshapeWeights, setBlendshapeWeights] = useState<Record<string, number>>({});

  const gestureTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const blinkIntervalRef = useRef<ReturnType<typeof setTimeout>>();
  const breathRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  /** Idle animation loop: blink + subtle breathing. */
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
      blinkIntervalRef.current = setTimeout(() => {
        // Quick blink
        setBlendshapeWeights((prev) => ({
          ...prev,
          eyeBlinkLeft: 1.0,
          eyeBlinkRight: 1.0,
        }));
        setTimeout(() => {
          setBlendshapeWeights((prev) => ({
            ...prev,
            eyeBlinkLeft: 0,
            eyeBlinkRight: 0,
          }));
        }, 120);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    // Breathing cycle via rAF
    const breathe = () => {
      breathRef.current += 0.02;
      const breathVal = Math.sin(breathRef.current) * 0.03;
      setBlendshapeWeights((prev) => ({
        ...prev,
        jawOpen: Math.max(prev.jawOpen ?? 0, breathVal > 0 ? breathVal : 0),
      }));
      rafRef.current = requestAnimationFrame(breathe);
    };
    breathe();

    return () => {
      clearTimeout(blinkIntervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const playGesture = useCallback((gesture: GestureType) => {
    clearTimeout(gestureTimeoutRef.current);

    setCurrentAnimation(gesture);
    setIsIdle(gesture === 'idle');

    const targets = GESTURE_BLENDSHAPES[gesture] ?? {};
    setBlendshapeWeights((prev) => ({ ...prev, ...targets }));

    // Auto-return to idle after duration
    if (gesture !== 'idle') {
      gestureTimeoutRef.current = setTimeout(() => {
        // Reset gesture-specific blendshapes
        const reset: Record<string, number> = {};
        for (const key of Object.keys(targets)) {
          reset[key] = 0;
        }
        setBlendshapeWeights((prev) => ({ ...prev, ...reset }));
        setCurrentAnimation('idle');
        setIsIdle(true);
      }, GESTURE_DURATION_MS);
    }
  }, []);

  return { playGesture, isIdle, currentAnimation, blendshapeWeights };
}
