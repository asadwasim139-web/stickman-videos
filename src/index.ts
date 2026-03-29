import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { StickmanVideo } from './StickmanVideo';

// GitHub Actions se script load hogi — fallback ke liye default
let script = { scenes: [{ seconds: 6 }] };
try {
  script = require('./data/script.json');
} catch (e) {
  // default script use karo
}

const totalSeconds = script.scenes.reduce((sum: number, s: { seconds: number }) => sum + (s.seconds || 6), 0);
const FPS = 30;
const totalFrames = totalSeconds * FPS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StickmanVideo"
        component={StickmanVideo}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);
