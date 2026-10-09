import React, { useState } from 'react';
import { CharacterScene } from './CharacterScene';
import { CharacterAnimationState } from '../shared/types';
import {
  Play,
  Sparkles,
  Volume2,
  CheckCircle2,
  Moon,
  Clock,
  HelpCircle,
  Eye,
  ArrowLeft,
  Activity,
  Smile,
} from 'lucide-react';

export const CharacterPreviewStudio: React.FC = () => {
  const [activeState, setActiveState] = useState<CharacterAnimationState>('idle');
  const [speechText, setSpeechText] = useState(
    "Hey! Your hackathon submission is due tomorrow. Let's make sure your demo video and repo are ready!"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const statesList: {
    key: CharacterAnimationState;
    label: string;
    icon: React.ReactNode;
    desc: string;
    autoReturn: string;
  } = [
    {
      key: 'idle',
      label: '1. Idle',
      icon: <Smile size={16} color="#2563eb" />,
      desc: 'Gentle skeletal breathing, natural blinks every ~3.5s, subtle weight shifts.',
      autoReturn: 'Looping',
    },
    {
      key: 'greeting',
      label: '2. Greeting (Wave)',
      icon: <Sparkles size={16} color="#d97706" />,
      desc: 'Turns toward user, raises arm, executes friendly wave, winks eye, then smoothly crossfades back to idle.',
      autoReturn: 'Auto returns in 2.4s',
    },
    {
      key: 'speaking',
      label: '3. Speaking',
      icon: <Volume2 size={16} color="#16a34a" />,
      desc: 'Synchronized head nodding, speech gesture emphasis, animated cyan LED speaking pulses.',
      autoReturn: 'While TTS speaks',
    },
    {
      key: 'thinking',
      label: '4. Thinking',
      icon: <HelpCircle size={16} color="#8b5cf6" />,
      desc: 'Slight head tilt, inquisitive upward glance, curious arched cyan eyes.',
      autoReturn: 'Auto returns in 3.0s',
    },
    {
      key: 'alert',
      label: '5. Reminder Alert',
      icon: <Clock size={16} color="#ea580c" />,
      desc: 'Attention-catching stance, attentive alert eyes, looks toward the reminder card.',
      autoReturn: 'Auto returns in 2.5s',
    },
    {
      key: 'celebrating',
      label: '6. Task Completed',
      icon: <CheckCircle2 size={16} color="#16a34a" />,
      desc: 'Joyful victory pose, golden star accessory in hand, blushing cheeks, happy curved eyes.',
      autoReturn: 'Auto returns in 3.2s',
    },
    {
      key: 'sleeping',
      label: '7. Quiet Hours',
      icon: <Moon size={16} color="#6366f1" />,
      desc: 'Relaxed sleeping posture, sleepy closed eyes (— —), resting head.',
      autoReturn: 'Holds until woken',
    },
    {
      key: 'listening',
      label: '8. Listening',
      icon: <Eye size={16} color="#0284c7" />,
      desc: 'Attentive posture, subtle head tilt, wide observant eyes.',
      autoReturn: 'Holds while active',
    },
  ];

  const handleTestState = (stateKey: CharacterAnimationState) => {
    setActiveState(stateKey);
    if (stateKey === 'speaking') {
      triggerTestTTS();
    }
  };

  const triggerTestTTS = async () => {
    setIsSpeaking(true);
    setActiveState('speaking');

    if (window.taskBuddy) {
      const settings = await window.taskBuddy.getSettings();
      if (settings.voiceEnabled) {
        // Speak via preview IPC
        await window.taskBuddy.previewCharacter();
      }
    }

    setTimeout(() => {
      setIsSpeaking(false);
      setActiveState('idle');
    }, 4500);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Top QA Navigation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="#dashboard"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              TaskBuddy 2.0 Animation QA Studio
            </h1>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Rigged 3D Mascot Skeletal Animation & Visor Expression Inspector
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            }}
          >
            Rig: 43 Bones Active
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}
          >
            PBR Ceramic Materials
          </span>
        </div>
      </header>

      {/* Main Studio Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Interactive 3D Viewport */}
        <div
          style={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e2e8f0',
            position: 'relative',
            backgroundRadial: 'radial-gradient(circle at center, #f8fafc 0%, #cbd5e1 100%)',
          }}
        >
          {/* Transparent Stage Card */}
          <div
            style={{
              width: 320,
              height: 350,
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <CharacterScene state={activeState} width={260} height={280} />

            {/* Active Status Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Activity size={12} color="#38bdf8" />
              <span>State: {activeState.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right: QA Animation Trigger Panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Animation States & Transitions
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Trigger each state independently to inspect skeletal motion, blending, and visor expressions:
            </p>
          </div>

          {/* Animation State Buttons Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statesList.map((item) => {
              const isSelected = activeState === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTestState(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSelected ? '#2563eb' : '#94a3b8',
                      backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      marginLeft: 8,
                    }}
                  >
                    {item.autoReturn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Offline Windows TTS Test Box */}
          <div
            style={{
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Volume2 size={16} color="#2563eb" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                Offline Windows TTS Synchronization
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              Plays through local Windows SAPI speech while synchronizing head nodding, gestures, and LED speaking waves:
            </p>
            <textarea
              className="form-input"
              rows={2}
              style={{ width: '100%', fontSize: 12, resize: 'none', marginBottom: 8 }}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
            />
            <button
              onClick={triggerTestTTS}
              disabled={isSpeaking}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <Play size={13} />
              {isSpeaking ? 'Speaking Active...' : 'Play Test Reminder Speech'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
