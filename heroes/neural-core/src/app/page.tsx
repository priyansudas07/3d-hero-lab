import { PhysicsPlaygroundCanvas } from '@/components/PhysicsPlayground/PhysicsPlaygroundCanvas';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#030308]">
      <PhysicsPlaygroundCanvas
        particleCount={12000}
        initialMode="ATTRACT"
        gravityStrength={0.5}
        forceStrength={3.0}
        damping={0.95}
        color="#00F0FF"
        backgroundColor="#030308"
      />
    </main>
  );
}
