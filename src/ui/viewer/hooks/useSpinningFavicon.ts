import { useEffect, useRef } from 'react';

/**
 * Hook that makes the browser tab favicon spin when isProcessing is true.
 * Uses canvas to draw and rotate a simple icon.
 */
export function useSpinningFavicon(isProcessing: boolean) {
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const originalFaviconRef = useRef<string | null>(null);

  useEffect(() => {
    // Create canvas once
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 32;
      canvasRef.current.height = 32;
    }

    // Store original favicon
    if (!originalFaviconRef.current) {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) {
        originalFaviconRef.current = link.href;
      }
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const updateFavicon = (dataUrl: string) => {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = dataUrl;
    };

    const drawIcon = (rotation: number) => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(rotation);
      
      // Draw a simple lightning bolt icon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-4, -12);
      ctx.lineTo(4, -12);
      ctx.lineTo(0, -2);
      ctx.lineTo(6, -2);
      ctx.lineTo(-2, 12);
      ctx.lineTo(0, 2);
      ctx.lineTo(-6, 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const animate = () => {
      // Rotate by ~4 degrees per frame (matches 1.5s for full rotation at 60fps)
      rotationRef.current += (2 * Math.PI) / 90;
      drawIcon(rotationRef.current);
      updateFavicon(canvas.toDataURL('image/png'));
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isProcessing) {
      rotationRef.current = 0;
      animate();
    } else {
      // Stop animation and show static icon
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawIcon(0);
      updateFavicon(canvas.toDataURL('image/png'));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isProcessing]);
}
