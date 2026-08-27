import { NeuralCoreCanvas } from '@/components/NeuralCore/NeuralCoreCanvas';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#030308]">
      <NeuralCoreCanvas
        nodeCount={3500}
        interactionRadius={2.5}
        attractionStrength={0.25}
        primaryColor="#00F0FF"
        secondaryColor="#A040FF"
        backgroundColor="#030308"
      />
    </main>
  );
}
