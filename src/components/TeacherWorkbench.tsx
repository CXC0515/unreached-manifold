import { useState } from 'react';
import { ArrowUpRight, BookOpen, Check, GitBranch, Play, RotateCcw, Sparkles, Workflow } from 'lucide-react';
const steps = [
 { name: '教学目标', label: '定义学习任务与约束', detail: '从课时、学情与学习目标开始，将宽泛需求转为可检查的任务。', icon: BookOpen },
 { name: '知识检索', label: '让每个结论有出处', detail: '检索课程资料并保留引用；资料不足时明确缺口，不以生成补充事实。', icon: GitBranch },
 { name: '教案生成', label: '组织可编辑的初稿', detail: '将证据、目标与教学活动组合为初稿，保留教师的修改入口。', icon: Sparkles },
 { name: '教师确认', label: '把决定权交还给人', detail: '教师核验内容与来源后确认，反馈进入下一轮改进。', icon: Check },
];
export default function TeacherWorkbench(){
 const [selected,setSelected] = useState(1); const [executed,setExecuted] = useState(false); const [tokens,setTokens] = useState(12000);
 const Icon=steps[selected].icon;
 return <>
 <div className="section-heading"><div><span className="eyebrow">01 / SELECTED EXPLORATION</span><h2>让复杂系统，回到人的尺度。</h2></div><span className="section-note">产品思考 × 工程实践</span></div>
 <section className="workbench crystal-card">
  <div className="demo-window">
   <div className="window-bar"><span className="window-dots"><i/><i/><i/></span><span>Teacher AI · 工作流实验室</span><span className="tiny-tag">交互原型</span></div>
   <div className="workflow-title"><span><Workflow size={15}/> 备课协同工作流</span><span className="eyebrow">HUMAN IN THE LOOP</span></div>
   <div className="workflow-nodes">{steps.map((step,i)=><div className="node-wrap" key={step.name}><button className={`workflow-node ${selected===i?'selected':''} ${executed?'executed':''}`} onClick={()=>setSelected(i)} aria-pressed={selected===i}><step.icon size={20}/><strong>{step.name}</strong><span>{executed ? (i===3?'等待人工确认':'示例步骤就绪') : `STEP 0${i+1}`}</span></button>{i<3&&<span className="node-connector">···</span>}</div>)}</div>
   <div className="node-detail" aria-live="polite"><div className="node-icon"><Icon size={19}/></div><div><strong>{steps[selected].label}</strong><p>{steps[selected].detail}</p></div></div>
   <div className="demo-bottom"><span className="muted"><span className="status-dot"/>{executed?'示例已展开 · 未调用模型':'可探索的产品逻辑'}</span><button className="small-button" onClick={()=>{setExecuted(!executed);setSelected(executed?1:3);}}>{executed?<RotateCcw size={13}/>:<Play size={13}/>} {executed?'重置演示':'运行示例'}</button></div>
  </div>
  <div className="project-story"><div className="eyebrow">FEATURED PROJECT / 001</div><h3>教师 AI 工作台<span>从一次回答，到完整工作流。</span></h3><p>以教学任务为起点，把资料、生成与人工确认串联起来。关注的不只是模型能做什么，更是教师能否真正用起来。</p><div className="project-tags"><span>任务编排</span><span>检索增强</span><span>人机协同</span></div><button className="text-button" onClick={()=>{setSelected((selected+1)%4);setExecuted(false);}}>探索工作流节点 <ArrowUpRight size={16}/></button><div className="honesty-note">交互为流程示意，项目成效以实际验证为准。</div></div>
 </section>
 <div className="bottom-grid">
  <article className="crystal-card philosophy-card"><div className="eyebrow">MY APPROACH</div><h3>从问题出发，<br/>在反馈中迭代。</h3><div className="approach-steps"><span>洞察需求</span><i>↗</i><span>构建系统</span><i>↗</i><span>验证价值</span></div><span className="card-corner"><Workflow size={34} strokeWidth={1}/></span></article>
  <article className="crystal-card profile-card"><div className="eyebrow">CROSS-DISCIPLINARY LENS</div><h3>空间，连接认知。</h3><p>遥感科学与技术 <span>×</span> 城市信息学</p><div className="school-line"><span>NUIST</span><i>↗</i><span>THE HONG KONG<br/>POLYTECHNIC UNIVERSITY</span></div></article>
  <article className="crystal-card calculator-card"><div className="eyebrow">MICRO LAB / 估算实验</div><div className="calculator-title"><h3>Token 成本沙盘</h3><span>¥{(tokens/1000000*2).toFixed(3)}</span></div><label htmlFor="tokens">输入用量 <output>{tokens.toLocaleString()} tokens</output></label><input id="tokens" type="range" min="1000" max="100000" step="1000" value={tokens} onChange={e=>setTokens(Number(e.target.value))}/><p>假设输入单价 ¥2 / 百万 tokens，仅用于演示计算。</p></article>
 </div>
 </>;
}
