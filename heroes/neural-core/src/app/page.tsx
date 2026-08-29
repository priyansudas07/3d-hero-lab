'use client';

import React, {
  useRef,
  useCallback,
} from 'react';

import {
  NeuralCoreCanvas,
} from '@/components/NeuralCore/NeuralCoreCanvas';

import type {
  SynapticNetworkState,
} from '@/components/NeuralCore/SynapticNodes';

export default function Home() {
  const networkRef =
    useRef<SynapticNetworkState>({
      positions: null,
      adjacency: null,
      edges: [],
      signalIntensities: new Map(),
      nodeCount: 0,
      signalPropagator: null,
    });

  /*
   * Button -> NeuralCore Micro-Interaction:
   * Fires a real neural cascade along a connected graph node on click.
   */
  const handleTriggerCascade = useCallback(() => {
    const net = networkRef.current;
    if (net.signalPropagator && net.adjacency && net.adjacency.size > 0) {
      const nodeKeys = Array.from(net.adjacency.keys()).filter(
        (id) => (net.adjacency?.get(id)?.length ?? 0) > 1
      );
      if (nodeKeys.length > 0) {
        const randomStartNode =
          nodeKeys[Math.floor(Math.random() * nodeKeys.length)];
        net.signalPropagator.triggerSignal(
          randomStartNode,
          net.adjacency,
          2.6,
          1.0
        );
      }
    }
  }, []);

  return (
    <div className="relative w-full bg-[#030308] text-[#E2E8F0] select-none font-sans scroll-smooth">
      {/* =========================================================
          HERO SECTION (100vh FULLSCREEN CENTERPIECE)
          ========================================================= */}
      <section className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 md:p-10">
        {/* =======================================================
            LAYER 1: 3D NEURAL CANVAS CENTERPIECE
            ======================================================= */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <NeuralCoreCanvas
            networkRef={networkRef}
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

        {/* =======================================================
            LAYER 2: EDITORIAL HEADER
            ======================================================= */}
        <header className="relative z-10 w-full flex items-start justify-between pointer-events-none pb-4 border-b border-white/[0.04]">
          {/* Brand / Identity */}
          <div className="flex flex-col gap-0.5 pointer-events-auto">
            <div className="font-mono text-xs md:text-sm font-semibold tracking-wider text-white">
              SYNAPSE LAB
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#94A3B8]">
              EXPERIMENTAL SOFTWARE & 3D SYSTEMS
            </div>
          </div>

          {/* Essential Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden sm:flex items-center gap-8 md:gap-10 font-mono text-[11px] text-[#64748B] tracking-widest uppercase pointer-events-auto"
          >
            <a
              href="#projects"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/30 px-1 py-0.5"
            >
              WORK
            </a>
            <a
              href="#archive"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/30 px-1 py-0.5"
            >
              ARCHIVE
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/30 px-1 py-0.5"
            >
              GITHUB ↗
            </a>
          </nav>

          {/* Minimal Telemetry State */}
          <div className="font-mono text-[10px] md:text-[11px] text-[#64748B] text-right pointer-events-auto">
            <div>STATUS // ACTIVE</div>
            <div className="text-[#00F0FF]/90">ONLINE</div>
          </div>
        </header>

        {/* =======================================================
            LAYER 3: ASYMMETRIC EDITORIAL BODY
            ======================================================= */}
        <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-none mb-2">
          {/* Left Column: Typographic Headline & Authentic Summary */}
          <div className="max-w-lg pointer-events-auto">
            <div className="font-mono text-[11px] text-[#00F0FF] uppercase tracking-[0.25em] mb-2.5">
              Software Engineering & Graphics
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-white leading-[1.05] mb-4">
              Building software systems and interactive 3D interfaces.
            </h1>

            <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed font-normal max-w-md">
              Computer science student exploring full-stack engineering, real-time WebGL graphics, and graph-coupled simulation systems.
            </p>
          </div>

          {/* Right Column: Direct Tactile Controls */}
          <div className="flex flex-col items-start md:items-end gap-3 pointer-events-auto">
            <div className="font-mono text-[10px] text-[#64748B] tracking-wider uppercase mb-1">
              INTERACTIVE HERO // RAYCAST
            </div>

            <div className="flex items-center gap-2.5">
              {/* Primary Action Button */}
              <button
                onClick={handleTriggerCascade}
                className="
                  px-4.5
                  py-2.5
                  border
                  border-[#00F0FF]/50
                  bg-[#00F0FF]/10
                  text-[#00F0FF]
                  hover:bg-[#00F0FF]
                  hover:text-[#030308]
                  hover:border-[#00F0FF]
                  active:scale-[0.97]
                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-[#00F0FF]
                  font-mono
                  text-xs
                  tracking-wider
                  uppercase
                  transition-all
                  duration-200
                  ease-out
                  cursor-pointer
                "
              >
                Fire Neural Pulse
              </button>

              {/* Secondary Action: Scroll to Projects */}
              <a
                href="#projects"
                className="
                  px-4.5
                  py-2.5
                  border
                  border-white/15
                  bg-transparent
                  text-[#94A3B8]
                  hover:text-white
                  hover:border-white/40
                  hover:bg-white/[0.03]
                  active:scale-[0.97]
                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-white/40
                  font-mono
                  text-xs
                  tracking-wider
                  uppercase
                  transition-all
                  duration-200
                  ease-out
                  cursor-pointer
                "
              >
                Selected Work ↓
              </a>
            </div>
          </div>
        </div>

        {/* =======================================================
            LAYER 4: TECHNICAL STATUS BAR
            ======================================================= */}
        <footer className="relative z-10 w-full pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-[#64748B] tracking-wider pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] motion-safe:animate-pulse" />
            <span>INTERACTION: CLICK / DRAG 3D CORE</span>
          </div>

          <div className="hidden sm:block pointer-events-auto">
            WEBGL2 // THREE.JS / NEXT.JS
          </div>

          <a
            href="#projects"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-200 pointer-events-auto"
          >
            <span>SCROLL TO ARCHIVE</span>
            <span className="text-[#00F0FF]">↓</span>
          </a>
        </footer>
      </section>

      {/* =========================================================
          SECTION 01: CURATED TECHNICAL ARCHIVE
          ========================================================= */}
      <section
        id="projects"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-36 border-t border-white/[0.06]"
      >
        {/* Section Identifier & Metadata Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
              01 // WORK
            </span>
            <span className="text-white/20">/</span>
            <span className="font-mono text-xs text-[#94A3B8] tracking-wider uppercase">
              SYSTEMS ARCHIVE
            </span>
          </div>

          <div className="font-mono text-[11px] text-[#64748B] tracking-widest uppercase hidden sm:block">
            CATALOG // 2025 — 2026
          </div>
        </div>

        {/* Section Title & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.08] mb-4">
              Engineered software and graphics specimens.
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal">
              A curated body of real-time WebGL engines, distributed simulation architectures, and high-performance algorithms.
            </p>
          </div>

          <div className="font-mono text-[11px] text-[#64748B] uppercase tracking-wider">
            [ 03 SPECIMENS DOCUMENTED ]
          </div>
        </div>

        {/* Curated Project Specimens (Asymmetric Editorial Rhythm) */}
        <div className="flex flex-col gap-16">
          {/* =====================================================
              SPECIMEN 01: FEATURED SYSTEM (LARGE VISUAL ARTIFACT)
              ===================================================== */}
          <article className="group relative border border-white/[0.08] bg-white/[0.01] hover:border-[#00F0FF]/40 transition-colors duration-300 p-6 md:p-10 flex flex-col justify-between">
            {/* Specimen Header Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/[0.04] mb-8">
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-[#00F0FF] font-medium">01.01</span>
                <h3 className="text-xl sm:text-3xl font-medium text-white tracking-tight group-hover:text-[#00F0FF] transition-colors duration-200">
                  Neural Core 3D
                </h3>
              </div>
              <div className="font-mono text-xs text-[#94A3B8] tracking-wider uppercase">
                GRAPHICS ENGINE // REAL-TIME WEBGL
              </div>
            </div>

            {/* Specimen Visual Preview Window */}
            <div className="relative w-full h-64 sm:h-96 bg-[#06060E] border border-white/[0.06] overflow-hidden mb-8 flex items-center justify-center">
              {/* Geometric Schematic Grid Background */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:24px_24px]" />
              
              {/* Technical Schematics Diagram */}
              <div className="relative z-10 text-center flex flex-col items-center px-6">
                <div className="w-16 h-16 rounded-full border border-[#00F0FF]/40 flex items-center justify-center mb-4 relative">
                  <div className="w-6 h-6 border border-[#A040FF]/60 rotate-45" />
                  <div className="absolute w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
                </div>
                <div className="font-mono text-xs text-white tracking-widest uppercase mb-1">
                  INSTANCED 3D GRAPH // 3,500 NODES
                </div>
                <div className="font-mono text-[10px] text-[#64748B] tracking-wider max-w-sm">
                  MULTI-HOP IMPULSE CASING • SPATIAL GRID PARTITIONING • GLSL Z-DEPTH ATTENUATION
                </div>
              </div>

              {/* Edge Coordinates */}
              <div className="absolute bottom-3 left-4 font-mono text-[9px] text-[#64748B]">
                COORD // [X: 0.00, Y: 0.00, Z: 9.80]
              </div>
              <div className="absolute bottom-3 right-4 font-mono text-[9px] text-[#00F0FF]/70">
                CASCADE SPEED // 2.40
              </div>
            </div>

            {/* Specimen Description & Footer Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-4 border-t border-white/[0.04]">
              <div className="md:col-span-2">
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-normal max-w-2xl">
                  A high-density 3D neural simulation running 3,500 instanced vertices with graph-bound traveling pulses, raycasting hover recognition, and asymmetric core energy coupling without frame drops.
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-1.5 font-mono text-[11px]">
                <div className="text-[#64748B]">
                  STACK: <span className="text-[#E2E8F0]">THREE.JS · REACT THREE FIBER · GLSL</span>
                </div>
                <div className="text-[#64748B]">
                  YEAR: <span className="text-[#E2E8F0]">2026</span> · STATUS: <span className="text-[#00F0FF]">DEPLOYED</span>
                </div>
              </div>
            </div>
          </article>

          {/* =====================================================
              SECONDARY SPECIMENS: 2-COLUMN ASYMMETRIC GRID
              ===================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SPECIMEN 02 */}
            <article className="group relative border border-white/[0.08] bg-white/[0.01] hover:border-[#00F0FF]/40 transition-colors duration-300 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04] mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#00F0FF]">01.02</span>
                    <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight group-hover:text-[#00F0FF] transition-colors duration-200">
                      Synaptic Dispatch Engine
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B] uppercase">2025</span>
                </div>

                <div className="w-full h-44 bg-[#06060E] border border-white/[0.06] mb-6 flex flex-col items-center justify-center p-4 relative">
                  <div className="font-mono text-[10px] text-[#00F0FF] tracking-widest uppercase mb-1">
                    ASYNCHRONOUS EVENT PIPELINE
                  </div>
                  <div className="font-mono text-[9px] text-[#64748B] text-center max-w-xs">
                    Deterministic signal state propagation with bounded FIFO queues and cycle avoidance.
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed font-normal mb-6">
                  High-throughput event propagation system maintaining deterministic graph states across multi-hop cascades without memory leaks.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.04] font-mono text-[10px] text-[#64748B] flex items-center justify-between">
                <span>TYPESCRIPT · NODE · WEBSOCKETS</span>
                <span className="text-[#00F0FF]">ACTIVE</span>
              </div>
            </article>

            {/* SPECIMEN 03 */}
            <article className="group relative border border-white/[0.08] bg-white/[0.01] hover:border-[#00F0FF]/40 transition-colors duration-300 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04] mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#00F0FF]">01.03</span>
                    <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight group-hover:text-[#00F0FF] transition-colors duration-200">
                      Spatial Grid Partitioning
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B] uppercase">2025</span>
                </div>

                <div className="w-full h-44 bg-[#06060E] border border-white/[0.06] mb-6 flex flex-col items-center justify-center p-4 relative">
                  <div className="font-mono text-[10px] text-[#00F0FF] tracking-widest uppercase mb-1">
                    SUB-MILLISECOND LOOKUP HASH
                  </div>
                  <div className="font-mono text-[9px] text-[#64748B] text-center max-w-xs">
                    Spatial index reducing $O(N^2)$ neighbor queries into $O(1)$ cell lookups.
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed font-normal mb-6">
                  High-performance spatial hashing algorithm partitioning thousands of active 3D coordinates for fast proximity queries.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.04] font-mono text-[10px] text-[#64748B] flex items-center justify-between">
                <span>DATA STRUCTURES · ALGORITHMS</span>
                <span className="text-[#00F0FF]">STABLE</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
