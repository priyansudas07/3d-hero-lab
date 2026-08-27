import { FluidParticleCanvas } from '@/components/FluidParticleField/FluidParticleCanvas';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#030308]">
      <FluidParticleCanvas
        particleCount={25000}
        forceRadius={3.0}
        forceStrength={2.5}
        vortexStrength={1.8}
        damping={0.96}
        turbulence={0.4}
        color="#00F0FF"
        backgroundColor="#030308"
      />
    </main>
  );
}
