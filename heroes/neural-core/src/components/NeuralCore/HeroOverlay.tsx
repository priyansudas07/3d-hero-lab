'use client';

import React from 'react';
import { Mouse } from 'lucide-react';

interface HeroOverlayProps {
  nodeCount?: number;
  connectionCount?: number;
}

export function HeroOverlay({
  nodeCount = 5000,
  connectionCount = 500,
}: HeroOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none p-8 flex flex-col justify-between font-mono text-xs tracking-wider text-slate-300">
      {/* Top Bar Header */}
      <div className="flex justify-between items-start">
        {/* Left Status Column */}
        <div className="space-y-4">
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase">NEURAL CORE</h1>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">SYSTEM STATUS</p>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              ACTIVE
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">NODES</p>
            <p className="text-lg font-bold text-white tracking-tight">{nodeCount.toLocaleString()}</p>
            <div className="w-20 h-0.5 bg-cyan-500/40 rounded-full" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">CONNECTIONS</p>
            <p className="text-lg font-bold text-cyan-400 tracking-tight">{connectionCount.toLocaleString()}</p>
            <div className="w-20 h-0.5 bg-cyan-500/40 rounded-full" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">PULSE FREQUENCY</p>
            <p className="text-base font-semibold text-white">1.25 <span className="text-xs font-normal text-slate-400">Hz</span></p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">CORE ENERGY</p>
            <p className="text-base font-semibold text-purple-400">87<span className="text-xs font-normal text-slate-400">%</span></p>
            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[87%] h-full bg-gradient-to-r from-cyan-400 to-purple-500" />
            </div>
          </div>
        </div>

        {/* Top Right Header Tag */}
        <div className="text-right space-y-1">
          <p className="text-purple-400 font-semibold tracking-widest">PHASE 2</p>
          <p className="text-[10px] text-slate-500 uppercase">NODES & CONNECTIONS</p>
        </div>
      </div>

      {/* Bottom Bar Info */}
      <div className="flex justify-between items-end">
        {/* Bottom Left Mouse Interaction Indicator */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
          <Mouse className="w-5 h-5 text-slate-400" />
          <div>
            <p className="font-bold text-white text-[11px] uppercase tracking-wide">MOVE MOUSE</p>
            <p className="text-[10px] text-slate-400">Interact with the neural field</p>
          </div>
        </div>

        {/* Bottom Right Telemetry */}
        <div className="text-right space-y-1 text-[10px] text-slate-400">
          <p className="font-semibold text-slate-300 tracking-wide">{nodeCount.toLocaleString()} NODES · {connectionCount.toLocaleString()} CONNECTIONS</p>
          <p className="text-purple-400 font-bold tracking-widest">GPU DRAW CALLS: 2 <span className="font-normal text-slate-400">(INSTANCED)</span></p>
        </div>
      </div>
    </div>
  );
}
