import { useEffect, useRef } from 'react';

type InkDrop = { x: number; y: number; born: number; hue: number; size: number };

/** Bounded 2D material study: ink enters water, gauze catches the wind. */
export default function Atmosphere() {
 const ref = useRef<HTMLCanvasElement>(null);
 useEffect(() => {
  const canvas = ref.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)'); let w=0,h=0,dpr=1,raf=0,last=0;
  const drops: InkDrop[] = [{x:.18,y:.68,born:0,hue:161,size:170},{x:.83,y:.26,born:-5200,hue:204,size:120}];
  const resize=()=>{w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  const addDrop=(x:number,y:number)=>drops.push({x,y,born:performance.now(),hue:Math.random()>.5?161:204,size:100+Math.random()*100});
  const pointer=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&e.buttons===0)return;if(Math.random()<.18)addDrop(e.clientX/w,e.clientY/h);};
  const drawGauze=(t:number)=>{const motion=reduce.matches?0:t/1000;ctx.save();ctx.globalCompositeOperation='screen';for(let band=0;band<4;band++){const y=h*(.22+band*.19),amp=35+band*11,drift=motion*(.035+band*.009)+band*1.8;const gradient=ctx.createLinearGradient(0,y,w,y+h*.12);gradient.addColorStop(0,'rgba(255,255,255,0)');gradient.addColorStop(.25,`rgba(143,189,173,${.06-band*.008})`);gradient.addColorStop(.52,'rgba(255,255,255,.13)');gradient.addColorStop(.72,'rgba(128,179,204,.055)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.beginPath();ctx.moveTo(-80,y);for(let x=-80;x<=w+80;x+=70)ctx.lineTo(x,y+Math.sin(x*.006+drift)*amp+Math.sin(x*.002-drift*.7)*18);for(let x=w+80;x>=-80;x-=70)ctx.lineTo(x,y+Math.sin(x*.006+drift+.7)*amp+Math.sin(x*.002-drift*.7+.5)*18+18+band*3);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();ctx.beginPath();ctx.moveTo(-50,y+8);for(let x=-50;x<=w+50;x+=60)ctx.lineTo(x,y+Math.sin(x*.006+drift)*amp);ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.stroke();}ctx.restore();};
  const drawInk=(t:number)=>{ctx.save();ctx.globalCompositeOperation='multiply';for(let i=drops.length-1;i>=0;i--){const drop=drops[i];const age=drop.born?t-drop.born:Math.max(0,t+drop.born);if(drop.born&&age>19000){drops.splice(i,1);continue;}const p=Math.max(0,Math.min(1,age/13000)),ease=1-Math.pow(1-p,2),x=drop.x*w,y=drop.y*h,r=drop.size*(.25+ease*1.1);for(let ring=0;ring<3;ring++){ctx.beginPath();ctx.ellipse(x,y,r*(1+ring*.16),r*(.34+ring*.04),-.22,0,Math.PI*2);ctx.strokeStyle=`hsla(${drop.hue},28%,42%,${.027*(1-p)*(3-ring)})`;ctx.lineWidth=10-ring*3;ctx.stroke();}const glow=ctx.createRadialGradient(x-r*.1,y-r*.1,0,x,y,r);glow.addColorStop(0,`hsla(${drop.hue},35%,44%,${.025*(1-p)})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(x-r*1.4,y-r*1.4,r*2.8,r*2.8);}ctx.restore();};
  const draw=(t:number)=>{ctx.clearRect(0,0,w,h);drawInk(t);drawGauze(t);};const loop=(t:number)=>{if(!document.hidden&&(t-last>42||reduce.matches)){draw(t);last=t;}raf=requestAnimationFrame(loop);};
  resize();draw(0);raf=requestAnimationFrame(loop);addEventListener('resize',resize);addEventListener('pointermove',pointer,{passive:true});reduce.addEventListener('change',resize);return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',pointer);reduce.removeEventListener('change',resize);};
 },[]);return <canvas className="atmosphere" ref={ref} aria-hidden="true"/>;
}
