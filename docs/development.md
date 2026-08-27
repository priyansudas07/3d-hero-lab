# Development Guide: 3D Hero Lab

## 1. Monorepo Overview
This repository contains a suite of commercial, production-ready 3D interactive web hero components built with React, Three.js, React Three Fiber, and GSAP.

### Structure
- `heroes/neural-core/`: Active product concept — Futuristic interactive AI core.
- `heroes/orbital-command/`: Planned hero component.
- `heroes/liquid-data/`: Planned hero component.
- `shared/`: Cross-hero utility components, animation helpers, and 3D primitives.
- `docs/`: Product specs and technical architecture documentation.

---

## 2. Active Target: `heroes/neural-core/`
We are currently focusing exclusively on completing `heroes/neural-core/`.

### Development Commands
```bash
# Navigate to active hero component
cd heroes/neural-core

# Install dependencies (Phase 1)
npm install three @react-three/fiber @react-three/drei gsap @gsap/react lucide-react clsx tailwindmerge
npm install -D typescript @types/three @types/react @types/node tailwindcss postcss autoprefixer
```
