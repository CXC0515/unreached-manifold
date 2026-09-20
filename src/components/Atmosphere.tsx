import { useEffect, useRef } from 'react';

export default function Atmosphere() {
 const ref = useRef<HTMLCanvasElement>(null);
 useEffect(() => {
  const canvas = ref.current!; const ctx = canvas.getContext('2d'); if (!ctx) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, last = 0;
  const draw = (time: number) => {
   ctx.clearRect(0, 0, width, height);
   const t = media.matches ? 0 : time / 14000 * Math.PI * 2;
   for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < 30; i++) {
     const offset = i * 3.8, wave = Math.sin(t + layer) * 24;
     const gradient = ctx.createLinearGradient(0, 0, width, height);
     gradient.addColorStop(0, 'rgba(143,189,173,0)');
     gradient.addColorStop(.35, `rgba(143,189,173,${.018 + i / 2400})`);
     gradient.addColorStop(.65, 'rgba(128,179,204,.045)');
     gradient.addColorStop(.85, 'rgba(200,182,226,.035)');
     gradient.addColorStop(1, 'rgba(228,192,182,0)');
     ctx.beginPath();ctx.moveTo(-100, height * .38 + offset + layer * 110);
     ctx.bezierCurveTo(width * .25, height * .9 + wave + offset, width * .49, -70 + offset, width + 100, height * .42 + layer * 120 + offset);
     ctx.lineWidth = 2;ctx.strokeStyle = gradient;ctx.stroke();
    }
   }
  };
  const resize = () => { width = innerWidth; height = innerHeight; const dpr = Math.min(devicePixelRatio, 1.5); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(0); };
  const loop = (now: number) => { if (!document.hidden && !media.matches && now - last > 40) {draw(now); last = now;} frame = requestAnimationFrame(loop); };
  resize(); frame = requestAnimationFrame(loop); addEventListener('resize',resize);media.addEventListener('change',resize);
  return () => { cancelAnimationFrame(frame); removeEventListener('resize',resize); media.removeEventListener('change',resize); };
 }, []);
 return <canvas className="atmosphere" ref={ref} aria-hidden="true"/>;
}
