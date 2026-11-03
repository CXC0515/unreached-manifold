// Optional press response for an otherwise stationary action button.
// Use an untransformed wrapper as host; business clicks remain native.
export function mountPressMotion(host, options={}) {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const previous=host.style.transform;let animation=null,down=false,dx=0,dy=0;
  function pose(transform,duration){
    const current=getComputedStyle(host).transform;
    animation?.cancel();host.style.transform=transform;
    if(!reduce.matches)animation=host.animate([{transform:current==='none'?'translate(0,0) scale(1,1)':current},{transform}],{duration,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  function press(e){
    if(e.type==='pointerdown'&&e.button!==0)return;
    down=true;const r=host.getBoundingClientRect();
    dx=e.clientX===undefined?0:Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1))*(options.travelPx??3);
    dy=e.clientY===undefined?0:Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))*(options.travelPx??3);
    pose(`translate(${dx}px,${dy+1}px) scale(1.035,.97)`,100);
  }
  function release(){
    if(!down)return;down=false;
    const current=getComputedStyle(host).transform;animation?.cancel();host.style.transform=previous;
    if(!reduce.matches)animation=host.animate([
      {transform:current==='none'?'scale(1)':current,offset:0,easing:'ease-out'},
      {transform:`translate(${-dx*.3}px,-1px) scale(.985,1.015)`,offset:.42,easing:'ease-out'},
      {transform:'translate(0,1px) scale(1.005,.995)',offset:.72,easing:'ease-out'},
      {transform:previous||'translate(0,0) scale(1,1)',offset:1}
    ],{duration:260});
  }
  const keydown=e=>{if(!e.repeat&&[' ','Enter'].includes(e.key))press({});};
  const keyup=e=>{if([' ','Enter'].includes(e.key))release();};
  const cancel=()=>{down=false;animation?.cancel();host.style.transform=previous;};
  const changed=()=>{if(reduce.matches)cancel();};
  host.addEventListener('pointerdown',press);window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
  host.addEventListener('keydown',keydown);host.addEventListener('keyup',keyup);host.addEventListener('focusout',release);window.addEventListener('blur',cancel);reduce.addEventListener('change',changed);
  return {destroy(){cancel();host.removeEventListener('pointerdown',press);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);host.removeEventListener('keydown',keydown);host.removeEventListener('keyup',keyup);host.removeEventListener('focusout',release);window.removeEventListener('blur',cancel);reduce.removeEventListener('change',changed);}};
}
