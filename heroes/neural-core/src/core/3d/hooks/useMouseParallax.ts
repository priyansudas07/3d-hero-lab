import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useMouseParallax(enabled: boolean = true) {
  const mouse = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.current.set(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  return mouse;
}
