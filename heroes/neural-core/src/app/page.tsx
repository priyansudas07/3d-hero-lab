import React from 'react';
import { NeuralCoreCanvas } from '@/components/NeuralCore/NeuralCoreCanvas';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#030308] text-white overflow-x-hidden select-none flex flex-col justify-between">
      {/* =========================================================
          BACKGROUND AMBIENCE
          ========================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/[0.03] blur-[150px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[500px] bg-purple-600/[0.03] blur-[150px] rounded-full" />
      </div>

      {/* =========================================================
          3D NEURAL CANVAS BACKGROUND
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
          HEADER / BRAND
          ========================================================= */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
          </div>
          <span className="font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase">
            Synaptic<span className="text-cyan-400">Core</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs text-neutral-400 tracking-wider">
          <a href="#graph" className="hover:text-cyan-400 transition-colors">
            GRAPH
          </a>
          <a href="#impulses" className="hover:text-cyan-400 transition-colors">
            PROPAGATION
          </a>
          <a href="#topology" className="hover:text-cyan-400 transition-colors">
            TOPOLOGY
          </a>
        </nav>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button className="px-3.5 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-cyan-500/40 hover:text-white bg-slate-950/60 backdrop-blur-md transition-all">
            PROD READY
          </button>
        </div>
      </header>

      {/* =========================================================
          HERO CONTENT (UNOBSTRUCTED TOP / BOTTOM SPLIT)
          ========================================================= */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-4 pb-12 flex flex-col items-center justify-between flex-grow pointer-events-none">
        {/* Top Header Statement */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-slate-950/60 backdrop-blur-md mb-4 pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] text-cyan-300 tracking-widest uppercase">
              3D Neural Field Engine
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white max-w-2xl leading-[1.12]">
            Simulate Neural Systems in Real Time
          </h1>
        </div>

        {/* Central Space is Reserved for the 3D Neural Core */}
        <div className="w-full h-44 sm:h-56 md:h-64" />

        {/* Bottom Description & CTAs */}
        <div className="text-center flex flex-col items-center max-w-xl">
          <p className="text-xs sm:text-sm md:text-base text-neutral-400 mb-6 font-normal leading-relaxed">
            3,500 active synaptic nodes with directional multi-hop impulse cascades, raycast hover intelligence, and responsive 3D spatial depth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto pointer-events-auto">
            <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-medium text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_28px_rgba(0,240,255,0.5)] transition-all">
              Initialize Engine
            </button>
            <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/15 hover:border-cyan-500/40 text-neutral-200 hover:text-white bg-slate-950/60 backdrop-blur-md text-xs sm:text-sm font-medium tracking-wide transition-all">
              Inspect Topology
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          FOOTER STATUS
          ========================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between font-mono text-[11px] text-neutral-500 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-neutral-400 tracking-wider">3,500 NODES ACTIVE</span>
        </div>

        <div className="text-cyan-400/90 tracking-wider text-[10px] sm:text-[11px]">
          CLICK ANY NODE TO FIRE CASCADE
        </div>
      </footer>
    </main>
  );
}
