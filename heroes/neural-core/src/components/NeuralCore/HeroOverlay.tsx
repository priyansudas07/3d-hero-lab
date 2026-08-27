'use client';

import React, { useState } from 'react';
import { Mouse, Activity, ArrowRight, FileText } from 'lucide-react';

export interface PortfolioSection {
  id: string;
  label: string;
  number: string;
}

const DEFAULT_SECTIONS: PortfolioSection[] = [
  { id: 'core', number: '01', label: 'CORE' },
  { id: 'profile', number: '02', label: 'PROFILE' },
  { id: 'projects', number: '03', label: 'PROJECTS' },
  { id: 'skills', number: '04', label: 'SKILLS' },
  { id: 'contact', number: '05', label: 'CONTACT' },
];

interface HeroOverlayProps {
  sections?: PortfolioSection[];
  activeSectionId?: string;
  onSectionSelect?: (id: string) => void;
  nodeCount?: number;
  onExploreClick?: () => void;
  onResumeClick?: () => void;
}

export function HeroOverlay({
  sections = DEFAULT_SECTIONS,
  activeSectionId = 'core',
  onSectionSelect,
  nodeCount = 3500,
  onExploreClick,
  onResumeClick,
}: HeroOverlayProps) {
  const [active, setActive] = useState(activeSectionId);

  const handleSectionClick = (id: string) => {
    setActive(id);
    if (onSectionSelect) onSectionSelect(id);
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none p-6 md:p-10 flex flex-col justify-between font-mono text-xs tracking-wider text-slate-300 overflow-hidden">
      {/* Subtle Background Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* Subtle Animated Scanning Line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent animate-[scan_8s_ease-in-out_infinite] opacity-40 pointer-events-none" />

      {/* 1. TOP BAR: System Status & Telemetry */}
      <div className="relative z-20 flex justify-between items-start">
        {/* Top Left: System Status */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-slate-950/40 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-[11px] font-semibold text-slate-200 tracking-widest uppercase">
            NEURAL SYSTEM <span className="text-cyan-400">// ONLINE</span>
          </span>
        </div>

        {/* Top Right: Technical Telemetry (Desktop Only) */}
        <div className="hidden md:flex items-center gap-6 text-[10px] text-slate-400 bg-slate-950/40 backdrop-blur-md px-4 py-1.5 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NODES: <strong className="text-slate-200">{nodeCount.toLocaleString()}</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <span>LATENCY: <strong className="text-slate-200">12ms</strong></span>
          <span className="text-slate-700">|</span>
          <span>SIGNAL: <strong className="text-cyan-400">OPTIMAL</strong></span>
        </div>
      </div>

      {/* 2. MAIN HERO CONTENT AREA */}
      <div className="relative z-20 my-auto flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Left Navigation Indicator */}
        <div className="hidden lg:flex flex-col gap-3 pointer-events-auto">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 pl-1">NAVIGATION</p>
          {sections.map((sec) => {
            const isActive = sec.id === active;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectionClick(sec.id)}
                className={`group flex items-center gap-3 text-left transition-all duration-300 ${
                  isActive ? 'text-cyan-400 font-bold translate-x-1' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]' : 'bg-slate-700 group-hover:bg-slate-500'
                }`} />
                <span className="text-[11px] tracking-widest">
                  {sec.number} / {sec.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER PERSONAL HERO BLOCK */}
        <div className="w-full max-w-2xl mx-auto text-center lg:text-left space-y-6 lg:pl-12">
          {/* Positioning Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            CSE • AI/ML • SOFTWARE ENGINEERING
          </div>

          {/* Primary Name */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.3)]">
            PRIYANSU DAS
          </h1>

          {/* Short Statement */}
          <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
            Architecting intelligent software, high-performance WebGL systems, and end-to-end AI-driven applications.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 pointer-events-auto">
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-black font-bold tracking-wide hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>EXPLORE PROJECTS</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={onResumeClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700/80 bg-slate-950/60 text-slate-300 font-semibold tracking-wide hover:border-cyan-400/50 hover:text-white transition-all duration-300"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>VIEW RESUME</span>
            </button>
          </div>
        </div>

        {/* Right Corner Coordinates (Desktop Only) */}
        <div className="hidden lg:flex flex-col text-right text-[9px] text-slate-500 space-y-1">
          <p>AUTHOR: PRIYANSU DAS</p>
          <p>ROLE: FULL-STACK / AI</p>
          <p>ENGINE: WEBGL2 / R3F</p>
        </div>
      </div>

      {/* 3. BOTTOM BAR: Guidance & Mobile Section Indicator */}
      <div className="relative z-20 flex justify-between items-end">
        {/* Bottom Left Mouse Interaction Indicator */}
        <div className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md pointer-events-auto">
          <Mouse className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <div>
            <p className="font-bold text-white text-[10px] md:text-[11px] uppercase tracking-wide">INTERACT</p>
            <p className="text-[9px] md:text-[10px] text-slate-400">Orbit 3D neural environment</p>
          </div>
        </div>

        {/* Bottom Right Mobile Section Indicator */}
        <div className="lg:hidden text-right text-[10px] font-bold text-cyan-400 px-3 py-1 rounded-md border border-cyan-500/20 bg-slate-950/60">
          01 / CORE
        </div>
      </div>
    </div>
  );
}
