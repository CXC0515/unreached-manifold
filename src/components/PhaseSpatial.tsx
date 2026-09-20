import { useMemo, useState } from 'react';
import { Activity, GitBranch, Layers3, MapPin, MoveHorizontal, Satellite, Waypoints } from 'lucide-react';
import './spatial.css';

type ViewMode = 'original' | 'segmentation' | 'vector';

const MODE_LABELS: Record<ViewMode, string> = {
  original: '原始示意',
  segmentation: '分割示意',
  vector: '矢量骨架',
};

const roads = [
  'M28 238 C100 214 115 147 182 135 S278 186 350 157 S430 105 512 124',
  'M58 55 C118 89 150 112 182 135 S238 205 256 260',
  'M350 157 C365 205 387 240 438 267',
  'M256 260 C326 258 370 252 438 267',
  'M182 135 C205 97 229 67 275 38',
  'M350 157 C390 138 437 141 506 178',
];

const blocks = [
  [32, 72, 100, 67], [113, 39, 92, 63], [222, 52, 103, 71], [331, 35, 91, 77],
  [48, 161, 80, 61], [138, 166, 77, 70], [281, 166, 93, 68], [401, 196, 86, 54],
  [53, 268, 108, 38], [182, 280, 119, 31], [325, 280, 94, 32],
];

function NetworkSvg({ mode, split }: { mode: ViewMode; split: number }) {
  const vectorVisible = mode === 'vector' || mode === 'segmentation';
  const showTexture = mode !== 'vector';
  return (
    <svg className="spatial-network" viewBox="0 0 540 330" role="img" aria-label="示意城市区块和道路网络">
      <defs>
        <linearGradient id="spatial-satellite" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dce9e7" />
          <stop offset="0.52" stopColor="#b8d3ce" />
          <stop offset="1" stopColor="#e6d9d0" />
        </linearGradient>
        <pattern id="spatial-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#fff" strokeOpacity=".27" strokeWidth=".7" />
        </pattern>
        <clipPath id="spatial-split"><rect x="0" y="0" width={540 * (split / 100)} height="330" /></clipPath>
      </defs>
      <rect width="540" height="330" rx="18" fill={showTexture ? 'url(#spatial-satellite)' : '#f3f8f7'} />
      {showTexture && <rect width="540" height="330" fill="url(#spatial-grid)" />}
      <g opacity={mode === 'original' ? .47 : .2}>
        {blocks.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill={i % 3 === 0 ? '#8fbdb0' : '#f5f0e9'} stroke="#fff" strokeOpacity=".8" />)}
      </g>
      <g fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity={mode === 'original' ? .7 : .28}>{roads.map((d, i) => <path key={i} d={d} />)}</g>
      <g fill="none" stroke="#668f88" strokeWidth={mode === 'segmentation' ? 8 : 5} strokeLinecap="round" opacity={mode === 'segmentation' ? .86 : .32}>{roads.map((d, i) => <path key={i} d={d} />)}</g>
      <g clipPath="url(#spatial-split)" fill="none" stroke="#1f6258" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={vectorVisible ? 1 : .18}>{roads.map((d, i) => <path key={i} d={d} />)}</g>
      <g clipPath="url(#spatial-split)" fill="#fdfdfd" stroke="#1f6258" strokeWidth="2">{[[182,135],[350,157],[256,260],[438,267]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" />)}</g>
      <line x1={540 * (split / 100)} x2={540 * (split / 100)} y1="0" y2="330" stroke="#fff" strokeWidth="2" strokeDasharray="5 5" opacity=".9" />
    </svg>
  );
}

export default function PhaseSpatial() {
  const [split, setSplit] = useState(52);
  const [mode, setMode] = useState<ViewMode>('vector');
  const [showParams, setShowParams] = useState(true);
  const modeHint = useMemo(() => mode === 'original' ? '光谱合成底图，保留地表纹理' : mode === 'segmentation' ? '分割层突出道路候选区域' : '平滑几何骨架，便于拓扑分析', [mode]);

  return (
    <section className="phase-spatial" aria-labelledby="spatial-title">
      <header className="spatial-intro">
        <div><p className="eyebrow">02 / 地表拓扑 · GEOSPATIAL HORIZON</p><h2 id="spatial-title">From satellite orbit to urban spatiotemporal dynamics.</h2><p className="spatial-lede">把遥感观测、道路拓扑与城市计算放在同一张可解释的空间底图上。</p></div>
        <div className="spatial-affiliations"><span><Satellite size={16} />遥感科学与技术</span><span><MapPin size={16} />城市信息学与智慧城市</span></div>
      </header>

      <article className="crystal-card spatial-sandbox">
        <div className="spatial-card-head"><div><p className="eyebrow">ROAD NETWORK EXTRACTION SANDBOX</p><h3>道路网络拓扑提取对比器</h3></div><span className="spatial-live"><Activity size={14} /> INTERACTIVE</span></div>
        <div className="spatial-map-wrap">
          <NetworkSvg mode={mode} split={split} />
          <label className="spatial-slider-label" htmlFor="spatial-split">对比位置 <strong>{split}%</strong></label>
          <input id="spatial-split" className="spatial-slider" type="range" min="8" max="92" value={split} onChange={(event) => setSplit(Number(event.target.value))} aria-label="调整原始示意与矢量骨架的对比位置" />
          <span className="spatial-map-note">示意数据 · 非真实卫星影像</span>
        </div>
        <div className="spatial-controls"><div className="spatial-modes" role="group" aria-label="地图显示模式">{(Object.keys(MODE_LABELS) as ViewMode[]).map((item) => <button key={item} type="button" className={mode === item ? 'is-active' : ''} onClick={() => setMode(item)}><Layers3 size={15} />{MODE_LABELS[item]}</button>)}</div><p className="spatial-mode-hint"><GitBranch size={15} />{modeHint}</p></div>
        <div className="spatial-params"><button type="button" className="spatial-params-toggle" onClick={() => setShowParams((value) => !value)} aria-expanded={showParams}><Waypoints size={16} />交叉点参数说明 <MoveHorizontal size={15} /></button>{showParams && <div className="spatial-param-grid"><div><strong>连通度</strong><span>相邻道路的连接数量</span></div><div><strong>权重</strong><span>用于路径成本的示意值</span></div><div><strong>NDVI</strong><span>植被指数占位字段</span></div></div>}</div>
      </article>

      <div className="spatial-projects"><article className="crystal-card spatial-project"><span className="spatial-project-index">A / 方向</span><h3>地表物理量反演</h3><p>围绕高光谱大气校正、地表反照率与温度反演，建立从观测到解释的研究路径。</p><div className="spatial-tags"><span>高光谱</span><span>大气校正</span><span>反演</span></div></article><article className="crystal-card spatial-project"><span className="spatial-project-index">B / 方向</span><h3>城市时空大数据计算</h3><p>关注城市热岛演变与路网可达性，用时空数据描绘城市系统的变化关系。</p><div className="spatial-tags"><span>时空数据</span><span>路网</span><span>城市计算</span></div></article></div>
    </section>
  );
}
