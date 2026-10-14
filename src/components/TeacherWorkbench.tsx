import { ArrowDownRight, ArrowUpRight, BookOpenCheck, ClipboardCheck, FileSearch, ScanSearch, UserRoundCheck } from 'lucide-react';
import './teacher-case.css';

const decisions = [
  {
    number: '01',
    title: '评分依据先由教师确认',
    problem: '仅给模型一份参考答案，难以让教师判断每一分从哪里来。',
    response: '先解析题目与采分点，再用少量答卷试批。教师可以修改依据和试批结果，然后选择是否进入批量处理。',
    icon: BookOpenCheck,
  },
  {
    number: '02',
    title: '识别结果能回到原卷',
    problem: '学生手写答案被识别错时，一段孤立的文字不足以做最终判断。',
    response: '保留答卷原图、题目截图与不同识别来源；教师能核对对应位置，必要时手动框选或调整采用的文本。',
    icon: ScanSearch,
  },
  {
    number: '03',
    title: '自动化程度由教师选择',
    problem: '不同任务适合的人工检查密度不同，不能用一种确认方式覆盖全部答卷。',
    response: '提供逐份确认、分批确认和自动继续。识别不到答案或依据不足无法给分的答卷进入异常复核。',
    icon: UserRoundCheck,
  },
] as const;

export default function TeacherWorkbench() {
  return <section className="teacher-case" aria-labelledby="teacher-case-title">
    <div className="case-heading"><span className="eyebrow">01 / PERSONAL PROJECT</span><span>产品设计与实现 · 持续迭代</span></div>

    <article className="case-hero crystal-card">
      <div className="case-hero-copy">
        <p className="case-kicker"><ClipboardCheck size={15} /> 教师 AI 平台</p>
        <h2 id="teacher-case-title">让每一份批改，<br /><span>都能回到依据。</span></h2>
        <p className="case-lede">我把作业批改拆成题目解析、评分依据、样本试批、教师校准、批量批改和异常复核。目标是让教师看得见系统用了什么证据，也能改变最终结果。</p>
        <a className="case-jump" href="#case-decisions">看三个关键设计决定 <ArrowDownRight size={16} /></a>
      </div>
      <div className="case-route" aria-label="作业批改流程">
        <div className="case-route-top"><span>PROJECT MAP / 001</span><FileSearch size={18} /></div>
        <ol>
          <li><span>01</span><strong>准备题目与依据</strong><small>教师核对采分点</small></li>
          <li><span>02</span><strong>抽样试批与校准</strong><small>先看少量真实答卷</small></li>
          <li><span>03</span><strong>批量处理</strong><small>逐份、分批或自动继续</small></li>
          <li><span>04</span><strong>异常复核</strong><small>教师确认最终结果</small></li>
        </ol>
        <p>这里展示已实现的产品流程，不模拟模型调用或学生数据。</p>
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
      <div><span className="eyebrow">WHAT IS REAL</span><h3>项目现在能被核对的部分</h3></div>
      <p>个人项目已有可运行的作业批改流程：采分点编辑、试批、识别证据核对、三种批量确认方式与异常复核都在项目中实现。页面只说明这些功能和设计取舍；不展示学生答卷，也不把流程图当成模型效果。</p>
      <ArrowUpRight size={23} aria-hidden="true" />
    </aside>
  </section>;
}
