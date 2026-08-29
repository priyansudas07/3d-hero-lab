import React from 'react';
import { NeuralCoreCanvas } from '@/components/NeuralCore/NeuralCoreCanvas';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#030308] text-white overflow-x-hidden select-none">
      {/* =========================================================
          LAYER 1: BACKGROUND ATMOSPHERIC GRADIENTS
          ========================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/[0.04] blur-[140px] rounded-full" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/[0.03] blur-[160px] rounded-full" />
      </div>

      {/* =========================================================
          LAYER 2: 3D NEURAL CORE CENTERPIECE
          ========================================================= */}
      <div className="absolute inset-0 z-0">
        <NeuralCoreCanvas
          nodeCount={3500}
          interactionRadius={2.5}
          attractionStrength={0.25}
          primaryColor="#00F0FF"
          secondaryColor="#A040FF"
          backgroundColor="#030308"
          showHUD={false}
          className="w-full h-full"
        />
      </div>

      {/* =========================================================
          LAYER 3: INTERFACE CONTENT (BRAND, HERO TYPOGRAPHY, CTAS)
          ========================================================= */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen pointer-events-none">
        {/* Navigation Bar */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-lg border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase">
              Synapse<span className="text-cyan-400">Core</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs text-neutral-400 tracking-wider">
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">
              ARCHITECTURE
            </a>
            <a href="#signals" className="hover:text-cyan-400 transition-colors">
              SIGNALS
            </a>
            <a href="#topology" className="hover:text-cyan-400 transition-colors">
              TOPOLOGY
            </a>
          </nav>

          <div className="flex items-center gap-4 font-mono text-xs">
            <button className="px-4 py-2 rounded-lg border border-white/10 text-neutral-300 hover:border-cyan-500/40 hover:text-white bg-slate-950/40 backdrop-blur-md transition-all">
              SYSTEM v6.5
            </button>
          </div>
        </header>

        {/* Hero Body Content */}
        <section className="w-full max-w-4xl mx-auto px-6 text-center mt-auto mb-auto py-12 flex flex-col items-center">
          {/* Small Contextual Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-6 pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[11px] text-cyan-300/90 tracking-widest uppercase">
              Autonomous Neural Visualization Engine
            </span>
          </div>

          {/* Main Hero Statement */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-3xl">
            Simulate Intelligence{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-purple-500">
              at Synaptic Depth
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Real-time graph-coupled neural field simulation driven by 3,500 active synaptic nodes, directional pulse propagation, and spatial depth dynamics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-medium text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.35)] hover:shadow-[0_0_32px_rgba(0,240,255,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              Initialize Neural Engine
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/15 hover:border-cyan-500/40 text-neutral-200 hover:text-white bg-slate-950/50 backdrop-blur-md text-sm font-medium tracking-wide transition-all">
              Explore Topology
            </button>
          </div>
        </section>

        {/* Footer / Interaction Status Bar */}
        <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between font-mono text-[11px] text-neutral-500 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            <span className="text-neutral-400 tracking-wider">NETWORK STATUS: OPTIMAL</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-neutral-400 tracking-widest text-[10px]">
            <span>NODES: 3,500</span>
            <span>MAX HOPS: 5</span>
            <span>TOPOLOGY: 3D GRAPH</span>
          </div>

          <div className="text-cyan-400/80 tracking-wider">
            INTERACTIVE // CLICK NODES TO PULSE
          </div>
        </footer>
      </div>
    </main>
  );
}
