import { useState } from 'react';
import { ArrowUpRight, Camera, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import './spatial.css';

const chapters = [
  {
    index: '01', period: '2021.09 — 2025.06', school: '南京信息工程大学',
    degree: '遥感科学与技术 · 本科', theme: '学会观察',
    summary: '从影像中寻找信息，也开始用镜头记录身边的人与事。',
    detail: '本科阶段学习遥感与空间信息相关知识；在班级和学院新闻中心参与内容策划、摄影摄像与活动记录。',
    note: '班级宣传委员 · 学院团学新闻中心活动组副部长', icon: Camera,
  },
  {
    index: '02', period: '2025.09 — 在读', school: '香港理工大学',
    degree: '城市信息学及智慧城市 · 硕士', theme: '走近使用者',
    summary: '从空间数据出发，思考城市里的服务怎样抵达具体的人。',
    detail: '在“银龄医通”课程小组项目中，整合医疗设施、步行路网与老龄人口数据，探索社区医疗资源的匹配问题。',
    note: '课程小组项目 · 产品经理、团队负责人', icon: MapPin,
  },
] as const;

export default function PhaseSpatial() {
  const [selected, setSelected] = useState(0);
  const [visited, setVisited] = useState([true, false]);
  const chapter = chapters[selected];
  const Icon = chapter.icon;

  function openChapter(index: number) {
    setSelected(index);
    setVisited((current) => current.map((value, position) => position === index ? true : value));
  }

  return <section className="phase-spatial" aria-labelledby="spatial-title">
    <header className="spatial-intro"><div>
      <p className="eyebrow">02 / EDUCATION JOURNEY</p>
      <h2 id="spatial-title">在不同的地方，<br /><span>学着看见同一个世界。</span></h2>
      <p className="spatial-lede">两段求学经历，一条慢慢清晰的线索：先学会观察，再思考信息怎样为人所用。</p>
    </div><span className="spatial-intro-index">01 — 02 <i /> A PERSONAL ROUTE</span></header>

    <div className="education-board crystal-card">
      <div className="education-board-top"><span>LEARNING ROUTE / 我的求学路径</span><span>{visited.filter(Boolean).length.toString().padStart(2, '0')} / 02 已翻开</span></div>
      <div className="education-route" role="group" aria-label="选择求学经历">
        <div className="education-route-line" aria-hidden="true" />
        {chapters.map((item, index) => <button className={`education-stop ${selected === index ? 'is-selected' : ''}`} key={item.school} type="button" onClick={() => openChapter(index)} aria-pressed={selected === index} aria-controls="education-detail">
          <span className="education-stop-sticker" aria-hidden="true"><item.icon size={27} strokeWidth={1.5} /></span>
          <span className="education-stop-index">STOP {item.index} {visited[index] ? '· 已翻开' : ''}</span>
          <strong>{item.school}</strong><small>{item.period}</small>
        </button>)}
      </div>
      <p className="education-route-hint">点开两枚地点贴纸，看看这段路上留下了什么。</p>
    </div>

    <article className="education-detail crystal-card" id="education-detail" aria-live="polite">
      <div className="education-detail-art" aria-hidden="true">
        <span className="education-art-kicker">UNREACHED · FIELD NOTE {chapter.index}</span>
        <div className="education-art-frame"><Icon size={76} strokeWidth={0.8} /></div>
        <span className="education-art-caption">{chapter.theme} <span>↗</span></span>
      </div>
      <div className="education-detail-copy"><div className="education-detail-kicker"><GraduationCap size={15} /> {chapter.degree}</div>
        <h3>{chapter.school}<span>{chapter.theme}</span></h3>
        <p className="education-detail-lead">{chapter.summary}</p><p>{chapter.detail}</p>
        <div className="education-detail-footer"><Sparkles size={15} /><span>{chapter.note}</span></div>
      </div>
    </article>

    <div className="education-outro"><span className="eyebrow">THE THREAD THAT CONTINUES</span>
      <p>从观察信息，到思考人怎样使用信息。<br /><strong>这条路，仍在继续。</strong></p>
      <span className="education-outro-mark" aria-hidden="true"><ArrowUpRight size={27} /></span>
    </div>
  </section>;
}
