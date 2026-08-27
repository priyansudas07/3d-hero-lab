import { NeuralCoreCanvas } from '@/components/NeuralCore/NeuralCoreCanvas';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#05050A]">
      <NeuralCoreCanvas
        primaryColor="#00F0FF"
        secondaryColor="#7000FF"
        backgroundColor="#05050A"
        headline="Neural Processing Core"
        subheadline="A high-performance interactive 3D WebGL hero component powered by custom GLSL Simplex noise shaders and React Three Fiber."
        ctaText="View Implementation Plan"
      />
    </main>
  );
}
