import React, { useEffect, useState } from 'react';
import { CharacterScene } from './CharacterScene';
import { SpeechBubble } from './SpeechBubble';
import { ReminderEventPayload, CharacterAnimationState } from '../shared/types';

export const CharacterWindow: React.FC = () => {
  const [payload, setPayload] = useState<ReminderEventPayload | null>(null);
  const [animState, setAnimState] = useState<CharacterAnimationState>('entering');

  useEffect(() => {
    // Add transparent body class
    document.body.classList.add('character-window-mode');

    if (window.taskBuddy) {
      // Listen for due reminder
      const unsubReminder = window.taskBuddy.onReminderDue((data) => {
        setPayload(data);
        setAnimState('entering');
        setTimeout(() => setAnimState('speaking'), 1000);
      });

      // Listen for preview
      const unsubPreview = window.taskBuddy.onPreviewTriggered((data) => {
        setPayload(data);
        setAnimState('entering');
        setTimeout(() => setAnimState('speaking'), 1000);
      });

      return () => {
        unsubReminder();
        unsubPreview();
      };
    }
  }, []);

  const handleAction = async (action: 'start' | 'snooze' | 'done' | 'dismiss') => {
    if (!payload) return;

    if (action === 'done') {
      setAnimState('celebrating');
    } else {
      setAnimState('dismissed');
    }

    // Delay slightly so celebration/dismiss animation triggers before window hides
    setTimeout(async () => {
      if (window.taskBuddy) {
        await window.taskBuddy.handleReminderAction(action, payload.reminder.id);
      }
      setPayload(null);
    }, 700);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '12px 14px',
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        {/* Floating Windows 11 Reminder Card */}
        {payload && (
          <div style={{ marginBottom: 12 }}>
            <SpeechBubble payload={payload} onAction={handleAction} />
          </div>
        )}

        {/* 3D Cute Robot Mascot Companion (210px wide x 230px tall) */}
        <div
          style={{
            width: 210,
            height: 230,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CharacterScene
            state={animState}
            width={210}
            height={230}
          />
        </div>
      </div>
    </div>
  );
};
