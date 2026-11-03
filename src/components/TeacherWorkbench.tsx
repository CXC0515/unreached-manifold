import { ArrowDownRight, ArrowUpRight, BookOpenCheck, ClipboardCheck, FileSearch, ScanSearch, UserRoundCheck } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import './teacher-case.css';

const decisions = [
  {
    number: '01',
    title: '用 Harness 把 AI 能力组织成工作流',
    problem: '只靠一个大 Prompt 承担所有任务，规则、数据、工具和模型行为容易混在一起；结果出错时也难定位是哪一环出了问题。',
    response: '按职责拆分主 Agent、Skill、受控工具、上下文组装与个人记忆：分别负责任务编排、业务规则、数据操作、按需供给信息和保留偏好，让能力可检查、可调整。',
    icon: BookOpenCheck,
  },
  {
    number: '02',
    title: '从教师的一天出发设计产品',
    problem: '教师的工作不是“使用一个 AI”，而是课前找材料和备课、课上记录、课后批改，再回看学生与班级情况。',
    response: '围绕备课、上课、批改、回看组织工作台与助手入口，让记录和材料能接着用于下一步；电脑支持集中整理，手机支持随手查看和记录。',
    icon: ScanSearch,
  },
  {
    number: '03',
    title: '用证据约束 AI 回答',
    problem: '教学问题涉及具体班级、学生和材料；没有依据的流畅回答，可能把猜测包装成事实。',
    response: '助手从有权限的业务记录和教师选定材料中作答，返回来源与读取范围；区分无记录、读取失败和信息不完整，让教师能回到原始依据核对。',
    icon: UserRoundCheck,
  },
] as const;

export default function TeacherWorkbench() {
  return <section className="teacher-case" aria-labelledby="teacher-case-title">
    <div className="case-heading"><span className="eyebrow">01 / PERSONAL PROJECT</span><span>产品设计与实现 · 持续迭代</span></div>

    <article className="case-hero crystal-card">
      <div className="case-hero-copy">
        <p className="case-kicker"><ClipboardCheck size={15} /> 青松 · AI 教师工作台</p>
        <h2 id="teacher-case-title" tabIndex={-1}>让教学里的每一步，<br /><span>都能接着往下做。</span></h2>
        <p className="case-lede">从备课选材、课堂记录，到作业批改和学情回看，青松把教师日常要做的事放进同一个工作台。AI 助手帮助查记录、读材料和讨论教案；教师始终可以核对依据、修改并确认结果。</p>
        <div className="case-actions">
          <LiquidGlass className="liquid-control--accent"><a className="case-primary" href="https://td.unreached.top/" target="_blank" rel="noopener noreferrer">体验青松 <ArrowUpRight size={16}/></a></LiquidGlass>
          <a className="case-secondary" href="https://icnphsiltmy8.feishu.cn/wiki/FkPRw4jtgieHSdkkDQFcd0XFnW0?from=from_copylink" target="_blank" rel="noopener noreferrer">阅读系统介绍 <ArrowUpRight size={15}/></a>
        </div>
        <p className="case-demo-note">平台提供虚构样例的访客演示，可先了解界面与流程。</p>
        <a className="case-jump" href="#case-decisions">看三个关键设计决定 <ArrowDownRight size={16} /></a>
      </div>
      <div className="case-route" aria-label="青松教学工作流程">
        <div className="case-route-top"><span>PROJECT MAP / 001</span><FileSearch size={18} /></div>
        <ol>
          <li><span>01</span><strong>备课与选材</strong><small>围绕同一份教案讨论、编辑与保存</small></li>
          <li><span>02</span><strong>课堂记录</strong><small>从课表进入课次，记录任务与表现</small></li>
          <li><span>03</span><strong>作业批改</strong><small>确认依据、试批校准、批量与复核</small></li>
          <li><span>04</span><strong>回看学情</strong><small>结合批改与课堂记录，核对具体来源</small></li>
        </ol>
        <p>AI 助手贯穿其中：查记录、读材料，让下一步有据可依。</p>
      </div>
    </article>

    <section className="case-decisions" id="case-decisions" aria-labelledby="case-decisions-title">
      <div className="case-section-head"><div><span className="eyebrow">DESIGN DECISIONS</span><h3 id="case-decisions-title">我具体做了什么决定</h3></div><span>问题 → 处理方式</span></div>
      <div className="case-decision-grid">{decisions.map((decision) => <article className="case-decision crystal-card" key={decision.number}>
        <div className="case-decision-top"><span>{decision.number}</span><decision.icon size={21} strokeWidth={1.5} /></div>
        <h4>{decision.title}</h4>
        <div className="case-decision-text"><p><b>遇到的问题</b>{decision.problem}</p><p><b>我的处理</b>{decision.response}</p></div>
      </article>)}</div>
    </section>

    <aside className="case-boundary crystal-card" aria-label="项目验证范围">
      <div><span className="eyebrow">DESIGNED FOR TEACHERS</span><h3>资料、记录与判断，<br/>留在同一个工作台。</h3></div>
      <p>材料池保存和整理教学原件，选定材料可继续用于备课或助手问答；课堂与批改记录进入班级诊断和学生画像。教案可保留不同教学版本并导出 Word／PDF，个人规则和记忆也可查看、修改与删除。</p>
      <ArrowUpRight size={23} aria-hidden="true" />
    </aside>
  </section>;
}
