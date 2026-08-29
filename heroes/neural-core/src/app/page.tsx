import React from 'react';
import { NeuralCoreCanvas } from '@/components/NeuralCore/NeuralCoreCanvas';

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-[#030308] text-[#E2E8F0] overflow-hidden select-none flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* =========================================================
          LAYER 1: 3D NEURAL CANVAS CENTERPIECE (SLIGHTLY OFFSET TO RIGHT FOR BALANCED SPLIT)
          ========================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <NeuralCoreCanvas
          nodeCount={3500}
          interactionRadius={2.5}
          attractionStrength={0.25}
          primaryColor="#00F0FF"
          secondaryColor="#A040FF"
          backgroundColor="#030308"
          showHUD={false}
          offsetX={1.15}
          className="w-full h-full"
        />
      </div>

      {/* =========================================================
          LAYER 2: EDITORIAL HEADER (DISCIPLINED & TECHNICAL)
          ========================================================= */}
      <header className="relative z-10 w-full flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#94A3B8]">
            LAB // 01
          </div>
          <div className="font-mono text-sm font-semibold tracking-wider text-white">
            SYNAPTIC CORE
          </div>
        </div>

        <div className="hidden md:flex items-center gap-12 font-mono text-[11px] text-[#64748B] tracking-widest uppercase pointer-events-auto">
          <span>GRAPH DYNAMICS</span>
          <span>5-HOP CASCADE</span>
          <span>SPATIAL GRID</span>
        </div>

        <div className="font-mono text-[11px] text-[#64748B] text-right pointer-events-auto">
          <div>LATENCY: &lt;1.2MS</div>
          <div className="text-[#00F0FF]/80">3,500 NODES</div>
        </div>
      </header>

      {/* =========================================================
          LAYER 3: ASYMMETRIC EDITORIAL BODY
          ========================================================= */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-none mb-2">
        {/* Left Column: Typographic Title & Technical Summary */}
        <div className="max-w-lg pointer-events-auto">
          <div className="font-mono text-[11px] text-[#00F0FF] uppercase tracking-[0.25em] mb-2.5">
            Real-Time Neural Topology
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-[54px] font-medium tracking-tight text-white leading-[1.04] mb-4">
            Directional graph flow in 3D space.
          </h1>

          <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed font-normal max-w-md">
            Autonomous multi-hop signal propagation across an instanced spatial grid. Central geodesic processing core coupled to real-time network activity.
          </p>
        </div>

        {/* Right Column: Restrained Technical Controls */}
        <div className="flex flex-col items-start md:items-end gap-3 pointer-events-auto">
          <div className="font-mono text-[10px] text-[#64748B] tracking-wider uppercase mb-1">
            CONTROLS // RAYCAST ENABLED
          </div>

          <div className="flex items-center gap-2.5">
            <button className="px-4 py-2 border border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#030308] font-mono text-xs tracking-wider uppercase transition-all">
              Initialize Cascade
            </button>
            <button className="px-4 py-2 border border-white/15 bg-transparent text-[#94A3B8] hover:text-white hover:border-white/40 font-mono text-xs tracking-wider uppercase transition-all">
              Inspect Graph
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          LAYER 4: TECHNICAL STATUS BAR
          ========================================================= */}
      <footer className="relative z-10 w-full pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-[#64748B] tracking-wider pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
          <span>INTERACTIVE MODE: CLICK ANY NODE</span>
        </div>

        <div className="hidden sm:block pointer-events-auto">
          ROTATION: 3-AXIS UNCOUPLED
        </div>

        <div className="pointer-events-auto">
          EXPERIMENT // 2026.08
        </div>
      </footer>
    </main>
  );
}
