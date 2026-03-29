import { Composition } from 'remotion';
import { StickmanVideo } from './StickmanVideo';
import scriptRaw from './data/script.json';

const script = scriptRaw as { scenes: Array<{ seconds: number }> };

// Total duration calculate karo
const totalSeconds = script.scenes.reduce((sum, s) => sum + (s.seconds || 6), 0);
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
