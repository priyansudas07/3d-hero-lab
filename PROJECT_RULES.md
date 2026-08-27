# Project Rules & Guidelines: 3D Hero Lab

## Critical Directive: Approval Rule
> [!IMPORTANT]
> **Before making any architectural changes, explain the change and wait for user approval.**
> Never modify system architecture, add/remove major dependencies, change state/config APIs, or alter component hierarchy without first presenting the rationale and receiving explicit approval from the user.

---

## Technical & Coding Guidelines

1. **Three.js & WebGL Memory Management**:
   - Always implement recursive GPU resource cleanup (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`) on unmount.
   - Use `InstancedMesh` for rendering multi-node particle fields to limit draw calls ($\le 20$).
   - Clamp device pixel ratio to `Math.min(window.devicePixelRatio, 2)`.

2. **Animation & GSAP Cleanup**:
   - Use `@gsap/react` `useGSAP()` hook for automatic cleanup of ScrollTriggers and timelines upon component unmount.
   - Always use GSAP transform aliases (`x`, `y`, `scale`, `rotation`) instead of CSS transform strings.

3. **Progressive Disclosure & Reusability**:
   - Keep core WebGL engine utilities isolated in `src/core/3d` so future 3D hero products can reuse camera, lighting, and performance hooks.
