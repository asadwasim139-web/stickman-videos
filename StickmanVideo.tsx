import { AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import React from 'react';
import scriptRaw from './data/script.json';

// ─── Types ───────────────────────────────────────────────────────────────────
type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' |
               'dancing' | 'running' | 'thinking' | 'falling' | 'celebrating';

interface Scene {
  id: number;
  seconds: number;
  action: string;
  emotion: Emotion;
  text_overlay: string;
  narration: string;
}

interface Script {
  title: string;
  hook: string;
  scenes: Scene[];
}

// ─── Stickman SVG Component ───────────────────────────────────────────────────
const Stickman: React.FC<{ emotion: Emotion; frame: number }> = ({ emotion, frame }) => {
  const bounce = Math.sin(frame * 0.3) * 5;
  const sway = Math.sin(frame * 0.2) * 8;

  // Arm angles based on emotion
  const armAngles: Record<Emotion, [number, number]> = {
    happy:       [45, -45],
    sad:         [-30, 30],
    angry:       [80, -80],
    surprised:   [90, -90],
    neutral:     [20, -20],
    dancing:     [Math.sin(frame * 0.5) * 60, Math.cos(frame * 0.5) * 60],
    running:     [Math.sin(frame * 0.6) * 70, -Math.sin(frame * 0.6) * 70],
    thinking:    [-10, 70],
    falling:     [120, -120],
    celebrating: [Math.sin(frame * 0.4) * 80 + 80, Math.cos(frame * 0.4) * 80 - 80],
  };

  // Leg positions based on emotion
  const legOffsets: Record<Emotion, [number, number]> = {
    happy:       [0, 0],
    sad:         [0, 0],
    angry:       [10, -10],
    surprised:   [0, 0],
    neutral:     [0, 0],
    dancing:     [Math.sin(frame * 0.5) * 20, -Math.sin(frame * 0.5) * 20],
    running:     [Math.sin(frame * 0.6) * 30, -Math.sin(frame * 0.6) * 30],
    thinking:    [0, 0],
    falling:     [40, -40],
    celebrating: [Math.sin(frame * 0.4) * 15, -Math.sin(frame * 0.4) * 15],
  };

  // Face expressions
  const faceMap: Record<Emotion, React.ReactNode> = {
    happy:       <path d="M-12,5 Q0,18 12,5" stroke="#222" strokeWidth="3" fill="none" />,
    sad:         <path d="M-12,15 Q0,5 12,15" stroke="#222" strokeWidth="3" fill="none" />,
    angry:       <><path d="M-12,5 Q0,14 12,5" stroke="#222" strokeWidth="3" fill="none" /><line x1="-12" y1="-10" x2="-4" y2="-4" stroke="#222" strokeWidth="3" /><line x1="12" y1="-10" x2="4" y2="-4" stroke="#222" strokeWidth="3" /></>,
    surprised:   <><circle cx="0" cy="10" r="8" stroke="#222" strokeWidth="2" fill="white" /><circle cx="0" cy="10" r="3" fill="#222" /></>,
    neutral:     <line x1="-10" y1="10" x2="10" y2="10" stroke="#222" strokeWidth="3" />,
    dancing:     <path d="M-12,5 Q0,20 12,5" stroke="#222" strokeWidth="3" fill="none" />,
    running:     <path d="M-10,5 Q0,16 10,5" stroke="#222" strokeWidth="3" fill="none" />,
    thinking:    <><path d="M-8,10 Q0,18 8,10" stroke="#222" strokeWidth="3" fill="none" /><circle cx="16" cy="-12" r="4" stroke="#222" strokeWidth="2" fill="none" /><circle cx="22" cy="-18" r="3" stroke="#222" strokeWidth="2" fill="none" /><circle cx="27" cy="-24" r="2" stroke="#222" strokeWidth="2" fill="none" /></>,
    falling:     <path d="M-10,8 Q0,18 10,8" stroke="#222" strokeWidth="3" fill="none" />,
    celebrating: <path d="M-14,3 Q0,22 14,3" stroke="#222" strokeWidth="3" fill="none" />,
  };

  const [leftArm, rightArm] = armAngles[emotion];
  const [leftLeg, rightLeg] = legOffsets[emotion];

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const leftArmEnd = {
    x: Math.cos(toRad(leftArm - 90)) * 45,
    y: Math.sin(toRad(leftArm - 90)) * 45,
  };
  const rightArmEnd = {
    x: Math.cos(toRad(rightArm - 90)) * 45,
    y: Math.sin(toRad(rightArm - 90)) * 45,
  };

  return (
    <g transform={`translate(0, ${bounce}) rotate(${sway * 0.3})`}>
      {/* Head */}
      <circle cx="0" cy="-120" r="35" fill="white" stroke="#222" strokeWidth="4" />

      {/* Eyes */}
      <circle cx="-12" cy="-128" r="4" fill="#222" />
      <circle cx="12" cy="-128" r="4" fill="#222" />

      {/* Face expression */}
      <g transform="translate(0, -120)">{faceMap[emotion]}</g>

      {/* Body */}
      <line x1="0" y1="-85" x2="0" y2="0" stroke="#222" strokeWidth="5" strokeLinecap="round" />

      {/* Left arm */}
      <line x1="0" y1="-70" x2={leftArmEnd.x} y2={-70 + leftArmEnd.y} stroke="#222" strokeWidth="4" strokeLinecap="round" />

      {/* Right arm */}
      <line x1="0" y1="-70" x2={rightArmEnd.x} y2={-70 + rightArmEnd.y} stroke="#222" strokeWidth="4" strokeLinecap="round" />

      {/* Left leg */}
      <line x1="0" y1="0" x2={-30 + leftLeg} y2="70" stroke="#222" strokeWidth="4" strokeLinecap="round" />
      <line x1={-30 + leftLeg} y1="70" x2={-45 + leftLeg} y2="120" stroke="#222" strokeWidth="4" strokeLinecap="round" />

      {/* Right leg */}
      <line x1="0" y1="0" x2={30 + rightLeg} y2="70" stroke="#222" strokeWidth="4" strokeLinecap="round" />
      <line x1={30 + rightLeg} y1="70" x2={45 + rightLeg} y2="120" stroke="#222" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
};

// ─── Scene Component ──────────────────────────────────────────────────────────
const SceneView: React.FC<{ scene: Scene; sceneFrame: number; fps: number }> = ({ scene, sceneFrame, fps }) => {
  const enterProgress = spring({ frame: sceneFrame, fps, config: { damping: 20, stiffness: 200 } });
  const textOpacity = interpolate(sceneFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const bgColors: Record<Emotion, string> = {
    happy:       '#FFF9C4',
    sad:         '#E3F2FD',
    angry:       '#FFEBEE',
    surprised:   '#F3E5F5',
    neutral:     '#F5F5F5',
    dancing:     '#FCE4EC',
    running:     '#E8F5E9',
    thinking:    '#E0F7FA',
    falling:     '#FFF3E0',
    celebrating: '#F9FBE7',
  };

  const accentColors: Record<Emotion, string> = {
    happy:       '#F9A825',
    sad:         '#1976D2',
    angry:       '#D32F2F',
    surprised:   '#7B1FA2',
    neutral:     '#616161',
    dancing:     '#E91E63',
    running:     '#2E7D32',
    thinking:    '#00838F',
    falling:     '#E65100',
    celebrating: '#33691E',
  };

  const scale = interpolate(enterProgress, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColors[scene.emotion] }}>
      {/* Background pattern */}
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.06 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill={accentColors[scene.emotion]} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Stickman */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})` }}>
        <svg width="300" height="400" viewBox="-150 -200 300 300">
          <Stickman emotion={scene.emotion} frame={sceneFrame} />
        </svg>
      </div>

      {/* Action label (top) */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        textAlign: 'center', opacity: textOpacity,
        padding: '0 60px',
      }}>
        <span style={{
          background: accentColors[scene.emotion],
          color: 'white',
          padding: '8px 24px',
          borderRadius: 40,
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          letterSpacing: 1,
        }}>
          {scene.emotion.toUpperCase()}
        </span>
      </div>

      {/* Text overlay (bottom) */}
      <div style={{
        position: 'absolute', bottom: 160, left: 0, right: 0,
        textAlign: 'center', opacity: textOpacity,
        padding: '0 50px',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '18px 28px',
          borderRadius: 20,
          fontSize: 38,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          lineHeight: 1.3,
          display: 'inline-block',
          maxWidth: 900,
        }}>
          {scene.text_overlay}
        </div>
      </div>

      {/* Scene number */}
      <div style={{
        position: 'absolute', bottom: 80, right: 50,
        background: 'rgba(0,0,0,0.3)',
        color: 'white',
        padding: '6px 16px',
        borderRadius: 20,
        fontSize: 22,
        fontFamily: 'sans-serif',
        opacity: textOpacity,
      }}>
        {scene.id} / 5
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Video Component ─────────────────────────────────────────────────────
export const StickmanVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const script = scriptRaw as Script;
  const scenes = script.scenes;

  // Current scene figure out karo
  let elapsed = 0;
  let currentScene = scenes[0];
  let sceneFrame = 0;

  for (const scene of scenes) {
    const sceneDuration = scene.seconds * fps;
    if (frame < elapsed + sceneDuration) {
      currentScene = scene;
      sceneFrame = frame - elapsed;
      break;
    }
    elapsed += sceneDuration;
    currentScene = scene;
    sceneFrame = frame - elapsed + scene.seconds * fps;
  }

  return (
    <AbsoluteFill>
      {/* Audio */}
      <Audio src={staticFile('audio/narration.mp3')} />

      {/* Scene */}
      <SceneView scene={currentScene} sceneFrame={sceneFrame} fps={fps} />

      {/* Title bar (pehle 2 seconds) */}
      {frame < fps * 2 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.6)',
          padding: '20px 40px',
          textAlign: 'center',
        }}>
          <div style={{ color: 'white', fontSize: 36, fontWeight: 800, fontFamily: 'sans-serif' }}>
            {script.title}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
