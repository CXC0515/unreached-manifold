import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Command,
  Database,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import './vault.css';

type VaultFilter = '全部' | '批改协同' | '资料与证据' | '产品复盘';

type VaultEntry = {
  id: string;
  category: Exclude<VaultFilter, '全部'>;
  eyebrow: string;
  title: string;
  summary: string;
  body: string[];
  accent: 'mint' | 'azure' | 'peach' | 'lilac';
  icon: typeof BookOpen;
};

const entries: VaultEntry[] = [
  {
    id: 'trial-before-batch',
    category: '批改协同',
    eyebrow: 'PROJECT NOTE / 01',
    title: '为什么把试批放在批量前',
    summary: '教师先用少量答卷核对采分点和给分方式，再决定后续怎样批。',
    body: [
      '在教师 AI 平台里，参考答案和采分点不是上传后就固定的。系统先解析题目，教师检查、编辑评分依据，再选少量答卷试批。试批暴露的问题可以回到依据本身修改。',
      '教师亲自改过的试批结果保留为该题的校准锚点。评分依据修改后，是否重新试批由教师明确触发，避免系统悄悄覆盖教师已经确认的分数。',
      '这个顺序已经落实到项目工作流。它证明了人工校准入口存在，不等于证明模型在所有学科和题型上都有稳定效果。',
    ],
    accent: 'mint',
    icon: BookOpen,
  },
  {
    id: 'recognition-evidence',
    category: '资料与证据',
    eyebrow: 'PROJECT NOTE / 02',
    title: '识别有分歧时，保留原卷和来源',
    summary: '一段 OCR 文本不足以支持最终评分，教师需要看得见它对应的答卷位置。',
    body: [
      '学生手写答案可能出现漏字、涂改或跨题混入。项目把原页、题目截图、PaddleOCR 文本和视觉识别结果分开保留，允许教师在必要时框选范围、重新核对或选择采用的识别来源。',
      '识别来源有差异时，可以提示教师核验；异常队列只收更窄的情形：两路都没有答案，或评分依据不足以给分。识别差异本身不直接等同于无法评分。',
      '我把“看见结果”改为“能回到证据”。这里展示的是产品控制路径，不公开任何学生原卷。',
    ],
    accent: 'azure',
    icon: ShieldCheck,
  },
  {
    id: 'original-and-parsed',
    category: '产品复盘',
    eyebrow: 'PROJECT NOTE / 03',
    title: '保存原件，不等于理解了材料',
    summary: '材料池负责保存与整理；资料编辑负责解析、OCR 和可引用的内容。',
    body: [
      '教师常常先积累通知、证明、模板和 PDF，并不是每个文件上传后都要立刻交给 AI。项目把材料池中的原件与资料编辑中的解析记录分开：同一 PDF 选用时沿用原件，不要求再次上传。',
      '这样可以清楚区分“文件已经保存”和“内容已经解析”。删除解析结果也不应顺手删除原件；原件被其他资料使用时，界面需要阻止误删。',
      '服务端的数据与权限边界已做验证；真实教师账号完成上传、整理、选用 PDF 的整条生产操作仍需单独验收。',
    ],
    accent: 'lilac',
    icon: Database,
  },
];

const filters: VaultFilter[] = ['全部', '批改协同', '资料与证据', '产品复盘'];

export default function PhaseVault() {
  const [filter, setFilter] = useState<VaultFilter>('全部');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<VaultEntry | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesFilter = filter === '全部' || entry.category === filter;
      const searchable = `${entry.title} ${entry.summary} ${entry.category}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected && dialog && !dialog.open) dialog.showModal();
  }, [selected]);

  const openEntry = (entry: VaultEntry) => setSelected(entry);
  const closeEntry = () => dialogRef.current?.close();

  return (
    <section className="vault-phase" aria-labelledby="vault-title">
      <div className="vault-orbit vault-orbit--one" aria-hidden="true" />
      <div className="vault-orbit vault-orbit--two" aria-hidden="true" />
      <header className="vault-hero">
        <div className="vault-hero__copy">
          <p className="eyebrow">03 / TEMPORAL VAULT</p>
          <h2 id="vault-title">项目里的决定，留下可检查的记录。</h2>
          <p className="vault-hero__lead">从个人教师 AI 平台里挑出三个真实的设计问题：试批怎样校准、识别怎样回到证据、材料怎样保留原件。</p>
        </div>
        <div className="vault-hero__mark" aria-label="Temporal Vault">
          <span className="vault-hero__mark-ring"><BookOpen size={24} strokeWidth={1.4} /></span>
          <span>TV / 03</span>
        </div>
      </header>

      <div className="vault-toolbar" role="search">
        <label className="vault-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">搜索手记</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索手记、主题或关键词" />
          <kbd><Command size={12} /> K</kbd>
        </label>
        <div className="vault-filters" aria-label="按主题筛选">
          {filters.map((item) => (
            <button key={item} className={`vault-filter ${filter === item ? 'is-active' : ''}`} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
          ))}
        </div>
      </div>

      <div className="vault-grid" aria-live="polite">
        {visibleEntries.map((entry, index) => {
          const Icon = entry.icon;
          return (
            <article className={`crystal-card vault-card vault-card--${entry.accent} vault-card--${index % 3}`} key={entry.id}>
              <div className="vault-card__top"><span className="vault-icon"><Icon size={18} strokeWidth={1.7} /></span><span className="vault-card__index">0{index + 1}</span></div>
              <p className="eyebrow">{entry.eyebrow}</p>
              <h2>{entry.title}</h2>
              <p className="vault-card__summary">{entry.summary}</p>
              <button className="vault-card__open" type="button" onClick={() => openEntry(entry)}>打开手记 <ArrowUpRight size={15} /></button>
            </article>
          );
        })}
      </div>
      {visibleEntries.length === 0 && <p className="vault-empty">没有匹配的手记。换一个关键词，或回到全部主题。</p>}

      <dialog ref={dialogRef} className="vault-dialog" onClose={() => setSelected(null)} aria-labelledby="vault-drawer-title">
        {selected && <div className="vault-drawer">
          <div className="vault-drawer__head"><div><p className="eyebrow">{selected.eyebrow}</p><span className="vault-drawer__category">{selected.category}</span></div><button className="vault-close" type="button" onClick={closeEntry} aria-label="关闭手记"><X size={19} /></button></div>
          <h2 id="vault-drawer-title">{selected.title}</h2>
          <div className="vault-drawer__body">{selected.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="vault-drawer__foot"><ShieldCheck size={15} /><span>来自个人项目的设计记录；验证范围在正文中说明。</span></div>
        </div>}
      </dialog>
    </section>
  );
}
