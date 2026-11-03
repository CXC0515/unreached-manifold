import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Command, Compass, Layers3, Sparkles } from 'lucide-react';
import { mountGlass } from '../lib/liquid-glass/liquid-glass.js';
import { mountPressMotion } from '../lib/liquid-glass/press-motion.js';
import { mountSegmented } from '../lib/liquid-glass/segmented.js';
import '../lib/liquid-glass/liquid-glass.css';
import './liquid-controls.css';

const material = { theme: 'light', lightAngle: 225, reflection: .8, nativeRefraction: true };

export function LiquidGlass({ children, className = '', compact = false }: {children: ReactNode; className?: string; compact?: boolean}) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!host.current) return;
    const glass = mountGlass(host.current, { ...material, preset: 'button', radius: 999, edgeWidth: compact ? 6 : 10, displacement: compact ? 3 : 5, blur: 1.25 });
    const press = mountPressMotion(host.current, { travelPx: compact ? 1.4 : 2 });
    return () => { press.destroy(); glass.destroy(); };
  }, [compact]);
  return <div ref={host} className={`liquid-control ${compact ? 'liquid-control--compact' : ''} ${className}`}><div className="lg-content">{children}</div></div>;
}

const sections = [{name:'神经工作台', icon:Sparkles}, {name:'时空经纬', icon:Compass}, {name:'灵感晶体', icon:Layers3}];
export function LiquidNavigation({ phase, onNavigate, onCommand }: {phase:number; onNavigate(index:number):void; onCommand():void}) {
  const host = useRef<HTMLDivElement>(null);
  const segments = useRef<ReturnType<typeof mountSegmented> | null>(null);
  useLayoutEffect(() => {
    if (!host.current) return;
    const instance = mountSegmented(host.current, { value:'0', trackRim:true, liftPx:2, glass:material, onChange(value) { onNavigate(Number(value)); } });
    segments.current = instance;
    return () => { instance.destroy(); segments.current = null; };
  }, [onNavigate]);
  useLayoutEffect(() => { segments.current?.select(String(phase), {notify:false}); }, [phase, onNavigate]);
  return <nav className="dock liquid-dock" aria-label="视界切换">
    <div className="dock-segments" ref={host} role="group" aria-label="选择视界">
      {sections.map((item,index) => <button key={item.name} data-value={String(index)} className="dock-item" aria-current={phase===index ? 'page' : undefined}><span className="dock-item-content"><item.icon size={17} strokeWidth={1.5}/><span className="dock-number">0{index+1}</span><span>{item.name}</span></span></button>)}
    </div>
    <div className="dock-separator"/>
    <LiquidGlass compact><button className="dock-command" onClick={onCommand} aria-label="打开全局终端"><Command size={16}/><span>K</span></button></LiquidGlass>
  </nav>;
}
