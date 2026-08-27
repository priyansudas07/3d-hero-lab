'use client';

import React from 'react';
import { Mouse } from 'lucide-react';

export function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none p-8 flex flex-col justify-end font-mono text-xs tracking-wider text-slate-300">
      {/* Bottom Bar Info */}
      <div className="flex justify-between items-end w-full">
        {/* Bottom Left Mouse Interaction Indicator */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
          <Mouse className="w-5 h-5 text-slate-400" />
          <div>
            <p className="font-bold text-white text-[11px] uppercase tracking-wide">MOVE MOUSE</p>
            <p className="text-[10px] text-slate-400">Interact with the neural field</p>
          </div>
        </div>
      </div>
    </div>
  );
}
