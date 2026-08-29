import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 // Specimen Not Found',
  description: 'The requested technical specimen or page does not exist in the archive.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030308] text-[#E2E8F0] select-none font-sans flex flex-col justify-between p-6 md:p-12 lg:p-16">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-white/[0.06]">
        <div className="font-mono text-xs font-semibold tracking-wider text-white">
          SYNAPSE LAB
        </div>
        <div className="font-mono text-[10px] text-[#00F0FF] uppercase tracking-widest">
          STATUS // 404
        </div>
      </header>

      <section className="w-full max-w-5xl mx-auto my-auto py-16 flex flex-col items-start gap-6">
        <div className="font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
          ERROR // ROUTE NOT RESOLVED
        </div>

        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white leading-tight">
          Specimen coordinates not found.
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] font-normal leading-relaxed max-w-lg">
          The requested path does not exist in the active systems catalog. You can return to the primary work archive or explore active specimens.
        </p>

        <div className="pt-4 flex items-center gap-4">
          <Link
            href="/#projects"
            className="px-5 py-2.5 border border-[#00F0FF]/50 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#030308] font-mono text-xs tracking-wider uppercase transition-all duration-200"
          >
            ← Back to Work Archive
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border border-white/15 hover:border-white/40 text-[#94A3B8] hover:text-white font-mono text-xs tracking-wider uppercase transition-all duration-200"
          >
            Return Home
          </Link>
        </div>
      </section>

      <footer className="w-full max-w-5xl mx-auto pt-6 border-t border-white/[0.04] font-mono text-[10px] text-[#64748B] flex items-center justify-between">
        <div>SYNAPSE LAB // 2026</div>
        <div>ERROR HANDLING // SAFE RETURN</div>
      </footer>
    </main>
  );
}
