import React, { useEffect, useState } from 'react';
import { CharacterScene } from './CharacterScene';
import { SpeechBubble } from './SpeechBubble';
import { ReminderEventPayload, CharacterAnimationState } from '../shared/types';

export const CharacterWindow: React.FC = () => {
  const [payload, setPayload] = useState<ReminderEventPayload | null>(null);
  const [animState, setAnimState] = useState<CharacterAnimationState>('entering');
  const [avatarModel, setAvatarModel] = useState<'student' | 'robot'>('student');

  useEffect(() => {
    // Add transparent body class
    document.body.classList.add('character-window-mode');

    // Fetch initial settings to get avatarModel
    if (window.taskBuddy) {
      window.taskBuddy.getSettings().then((s) => {
        if (s?.avatarModel) setAvatarModel(s.avatarModel);
      });

      // Listen for due reminder
      const unsubReminder = window.taskBuddy.onReminderDue((data) => {
        setPayload(data);
        setAnimState('entering');
        setTimeout(() => setAnimState('speaking'), 1200);
      });

      // Listen for preview
      const unsubPreview = window.taskBuddy.onPreviewTriggered((data) => {
        setPayload(data);
        setAnimState('entering');
        setTimeout(() => setAnimState('speaking'), 1200);
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

    // Delay slightly so animation can trigger before window hides
    setTimeout(async () => {
      if (window.taskBuddy) {
        await window.taskBuddy.handleReminderAction(action, payload.reminder.id);
      }
      setPayload(null);
    }, 600);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {/* 3D Character Area */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <CharacterScene state={animState} avatarModel={avatarModel} />
      </div>

      {/* Floating Speech Bubble */}
      {payload && (
        <SpeechBubble payload={payload} onAction={handleAction} />
      )}
    </div>
  );
};
