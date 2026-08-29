import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROJECT_SPECIMENS } from '@/data/projects';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PROJECT_SPECIMENS.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = PROJECT_SPECIMENS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  // Find next project in circular order
  const currentIndex = PROJECT_SPECIMENS.findIndex((p) => p.slug === slug);
  const nextProject =
    PROJECT_SPECIMENS[(currentIndex + 1) % PROJECT_SPECIMENS.length];

  return (
    <main className="min-h-screen bg-[#030308] text-[#E2E8F0] select-none font-sans p-6 md:p-12 lg:p-16">
      {/* =========================================================
          TOP NAVIGATION (QUIET BACK LINK & SPECIMEN INDEX)
          ========================================================= */}
      <header className="max-w-5xl mx-auto flex items-center justify-between pb-8 mb-12 border-b border-white/[0.06]">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 font-mono text-xs text-[#94A3B8] hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 px-1 py-0.5"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span>BACK TO WORK</span>
        </Link>

        <div className="font-mono text-xs text-[#64748B] tracking-widest uppercase">
          SPECIMEN // {project.number}
        </div>
      </header>

      {/* =========================================================
          PROJECT HERO HEADER (EDITORIAL HIERARCHY)
          ========================================================= */}
      <section className="max-w-5xl mx-auto mb-16">
        <div className="font-mono text-xs text-[#00F0FF] uppercase tracking-[0.25em] mb-4">
          {project.category}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.08] mb-6">
          {project.title}
        </h1>

        <p className="text-sm sm:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-3xl mb-10">
          {project.summary}
        </p>

        {/* Technical Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/[0.04] font-mono text-xs">
          <div>
            <div className="text-[#64748B] uppercase tracking-wider text-[10px] mb-1">
              YEAR
            </div>
            <div className="text-white">{project.year}</div>
          </div>

          <div>
            <div className="text-[#64748B] uppercase tracking-wider text-[10px] mb-1">
              STATUS
            </div>
            <div className="text-[#00F0FF]">{project.status}</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-[#64748B] uppercase tracking-wider text-[10px] mb-1">
              STACK
            </div>
            <div className="text-neutral-300">
              {project.stack.join(' · ')}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIMARY SPECIMEN VISUAL / SCHEMATIC
          ========================================================= */}
      <section className="max-w-5xl mx-auto mb-20">
        <div className="w-full bg-[#06060E] border border-white/[0.08] p-8 sm:p-14 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Subtle Grid Backing */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 text-center flex flex-col items-center max-w-md my-8">
            <div className="w-20 h-20 rounded-full border border-[#00F0FF]/40 flex items-center justify-center mb-6 relative">
              <div className="w-8 h-8 border border-[#A040FF]/60 rotate-45" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            </div>

            <div className="font-mono text-sm text-white tracking-widest uppercase mb-2">
              {project.title} // SYSTEM SCHEMATIC
            </div>
            <p className="font-mono text-xs text-[#64748B] leading-relaxed">
              {project.tagline}
            </p>
          </div>

          {/* Metric Badges */}
          <div className="relative z-10 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/[0.06] font-mono">
            {project.metrics.map((m, idx) => (
              <div key={idx} className="text-center sm:text-left">
                <div className="text-[10px] text-[#64748B] tracking-wider uppercase mb-0.5">
                  {m.label}
                </div>
                <div className="text-xs sm:text-sm text-white font-medium">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          TWO-COLUMN TECHNICAL SPECIFICATION SECTIONS
          ========================================================= */}
      <div className="max-w-5xl mx-auto flex flex-col gap-16 mb-24">
        {/* Section 01: Context & Objectives */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 border-t border-white/[0.06]">
          <div className="md:col-span-4 font-mono text-xs text-[#00F0FF] tracking-wider uppercase">
            01 // CONTEXT & OBJECTIVES
          </div>
          <div className="md:col-span-8 flex flex-col gap-6 max-w-2xl">
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal">
              {project.overview.context}
            </p>
            <ul className="flex flex-col gap-3 font-mono text-xs text-neutral-300">
              {project.overview.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00F0FF] mt-0.5">▪</span>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 02: Architecture & Decisions */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 border-t border-white/[0.06]">
          <div className="md:col-span-4 font-mono text-xs text-[#00F0FF] tracking-wider uppercase">
            02 // SYSTEM ARCHITECTURE
          </div>
          <div className="md:col-span-8 flex flex-col gap-8 max-w-2xl">
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal">
              {project.architecture.approach}
            </p>

            {/* Architecture Decisions */}
            <div className="flex flex-col gap-6">
              {project.architecture.decisions.map((dec, i) => (
                <div
                  key={i}
                  className="p-5 border border-white/[0.06] bg-white/[0.01]"
                >
                  <h3 className="font-mono text-xs text-white font-medium uppercase tracking-wider mb-2">
                    {dec.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {dec.rationale}
                  </p>
                </div>
              ))}
            </div>

            {/* Code Excerpt (If Available) */}
            {project.architecture.codeSnippet && (
              <div className="border border-white/[0.08] bg-[#020206] overflow-hidden">
                <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] font-mono text-[10px] text-[#64748B] flex items-center justify-between">
                  <span>{project.architecture.codeSnippet.filename}</span>
                  <span className="uppercase text-[#00F0FF]/80">
                    {project.architecture.codeSnippet.language}
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-xs text-neutral-300 leading-relaxed">
                  <code>{project.architecture.codeSnippet.code}</code>
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Section 03: Results & Engineering Insights */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 border-t border-white/[0.06]">
          <div className="md:col-span-4 font-mono text-xs text-[#00F0FF] tracking-wider uppercase">
            03 // RESULTS & INSIGHTS
          </div>
          <div className="md:col-span-8 flex flex-col gap-6 max-w-2xl">
            <div className="flex flex-col gap-2 font-mono text-xs text-neutral-300">
              {project.results.outcomes.map((out, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#00F0FF] mt-0.5">✓</span>
                  <span className="leading-relaxed">{out}</span>
                </div>
              ))}
            </div>

            <div className="p-5 border-l-2 border-[#00F0FF] bg-white/[0.01]">
              <div className="font-mono text-[10px] text-[#00F0FF] uppercase tracking-wider mb-1">
                ENGINEERING TAKEAWAY
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed italic">
                "{project.results.learnings}"
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          PROJECT FOOTER / LINKS & CONTINUOUS EXPLORATION
          ========================================================= */}
      <footer className="max-w-5xl mx-auto pt-10 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
        <div className="flex items-center gap-4">
          {project.links.source && (
            <a
              href={project.links.source}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-white/15 hover:border-white/40 text-white transition-colors duration-200"
            >
              SOURCE REPOSITORY ↗
            </a>
          )}
          {project.links.demo && (
            <Link
              href={project.links.demo}
              className="px-4 py-2 border border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#030308] transition-colors duration-200"
            >
              LAUNCH LIVE INTERFACE →
            </Link>
          )}
        </div>

        {/* Next Project Link */}
        <Link
          href={`/projects/${nextProject.slug}`}
          className="group inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors duration-200"
        >
          <span>NEXT SPECIMEN ({nextProject.number})</span>
          <span className="text-[#00F0FF] inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </footer>
    </main>
  );
}
