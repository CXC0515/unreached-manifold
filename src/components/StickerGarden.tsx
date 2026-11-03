import { useEffect, useRef, useState } from 'react';
import './sticker-garden.css';

type GardenMessage =
  | { type: 'sticker-garden:resize'; height: number }
  | { type: 'sticker-garden:open-case' }
  | { type: 'sticker-garden:reveal-open' }
  | { type: 'sticker-garden:reveal-close' };

const gardenUrl = window.location.pathname.includes('/sticker-study/original/')
  ? '../home.html?embed=1'
  : './sticker-study/home.html?embed=1';

export default function StickerGarden({ onOpenCase }: { onOpenCase: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(780);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    function receive(event: MessageEvent<GardenMessage>) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'sticker-garden:resize' && Number.isFinite(event.data.height)) {
        setHeight(Math.max(420, Math.min(event.data.height, 2400)));
      }
      if (event.data?.type === 'sticker-garden:reveal-open') setRevealing(true);
      if (event.data?.type === 'sticker-garden:reveal-close') setRevealing(false);
      if (event.data?.type === 'sticker-garden:open-case') {
        setRevealing(false);
        onOpenCase();
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onOpenCase]);

  useEffect(() => {
    if (!revealing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [revealing]);

  return <section className={`original-garden${revealing ? ' is-revealing' : ''}`} aria-label="互动贴纸花园" style={{ minHeight: height }}>
    <iframe ref={frame} src={gardenUrl} title="拼贴造景花园：放置贴纸、完成后拍摄" style={{ height }} />
  </section>;
}
