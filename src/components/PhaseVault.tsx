import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clipboard,
  Command,
  Database,
  FlaskConical,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import './vault.css';

type VaultFilter = '全部' | '效率工作流' | '空间计算' | '产品方法论';

type VaultEntry = {
  id: string;
  category: Exclude<VaultFilter, '全部'>;
  eyebrow: string;
  title: string;
  summary: string;
  body: string[];
  accent: 'mint' | 'azure' | 'peach' | 'lilac';
  icon: typeof BookOpen;
  code?: string;
};

const entries: VaultEntry[] = [
  {
    id: 'zotero-local-boundary',
    category: '效率工作流',
    eyebrow: 'WORKFLOW / 01',
    title: 'Zotero：把知识库放在可恢复的边界内',
    summary: '数据库、附件与备份分别处理，避免同步工具把索引状态变成隐性单点。',
    body: [
      'Zotero 的 SQLite 数据库应留在本机稳定路径；OneDrive、iCloud 等同步目录只承载导出的附件或明确选择的文件。数据库和附件不是同一种同步对象。',
      '建议保留一个本地自动备份区，再将加密压缩备份复制到同步区。恢复前先停写、校验备份时间与完整性；出现冲突时优先保留较新的可验证副本，不要让同步服务自动合并数据库。',
      '边界原则：数据库负责元数据一致性，附件负责文件可达性，备份负责可恢复性。三者都存在，才算一次完整同步。',
    ],
    accent: 'mint',
    icon: Database,
    code: '本地数据库 → 本地备份 →（人工校验后）同步区\n附件文件 → 同步区\n恢复：停写 → 校验 → 复制 → 再启动',
  },
  {
    id: 'remote-sensing-cleaning',
    category: '空间计算',
    eyebrow: 'SPATIAL / 02',
    title: '遥感波段清洗：先保留物理语义',
    summary: '在归一化前记录无效值、太阳天顶角与质量掩膜，避免把异常值洗成“正常”。',
    body: [
      '清洗多光谱或高光谱数据时，第一步不是填补缺失值，而是冻结原始波段、质量掩膜和观测条件。NoData、云影和饱和像元要用独立掩膜表达。',
      '对每个派生指标保留计算版本与输入波段清单。归一化只作用于有效像元，并把裁切范围、尺度因子与投影写进元数据，后续才能解释异常。',
      '一条实用检查线：抽样查看原始 DN、反射率和掩膜叠加图；若统计分布变好但空间纹理消失，清洗很可能已经越过物理边界。',
    ],
    accent: 'azure',
    icon: FlaskConical,
  },
  {
    id: 'rag-evidence',
    category: '产品方法论',
    eyebrow: 'PRODUCT / 03',
    title: 'RAG 证据链：答案之外要能回到原文',
    summary: '把检索、引用和拒答设计成同一条产品路径，而不是回答完成后的装饰。',
    body: [
      'RAG 质量不能只看最终答案。至少记录 query、召回片段、排序分数、引用范围和生成版本，才能区分“没检索到”和“检索到了但没用上”。',
      '界面上把证据作为可展开的原文片段，显示来源标题、更新时间和页码；证据不足时让系统明确说出缺口，并提供重新检索或缩小问题的入口。',
      '验证时抽取一组可复核问题：答案正确性、引用支持度、拒答边界分别打分。用户信任来自可追溯，而不是更长的回答。',
    ],
    accent: 'lilac',
    icon: ShieldCheck,
    code: 'retrieve → rerank → cite → answer\n证据不足 → 明确拒答 + 给出下一步',
  },
  {
    id: 'product-validation',
    category: '产品方法论',
    eyebrow: 'PRODUCT / 04',
    title: '产品验证：用最小闭环替代漂亮演示',
    summary: '把“能不能用”拆成触发、完成、复核三个可观察状态。',
    body: [
      '一个功能是否成立，不由演示路径决定，而由真实用户能否在自己的输入下完成目标决定。先定义触发条件、成功结果和失败后的恢复动作。',
      '验证记录应包含输入样本、用户操作、系统状态和最终产物。对于 AI 功能，还要记录模型版本、耗时与人工复核点，避免把偶然成功当作稳定能力。',
      '先用少量真实案例跑通闭环，再扩大覆盖面。每轮只改变一个关键变量，结果才有归因空间。',
    ],
    accent: 'peach',
    icon: Sparkles,
  },
  {
    id: 'workbench-rhythm',
    category: '效率工作流',
    eyebrow: 'WORKFLOW / 05',
    title: '工作台节奏：把上下文切换变成显式状态',
    summary: '为研究、制作与复核设定轻量入口，让中断后可以快速回到现场。',
    body: [
      '高频工作流的损耗常来自找回上下文。每个任务只保留一个“当前状态”入口：正在看什么、下一步是什么、什么证据能结束它。',
      '收尾时写三行交接：已确认、待验证、暂不做。下次打开时先恢复状态，再继续产出，避免重复扫描整个项目。',
    ],
    accent: 'mint',
    icon: Layers3,
  },
];

const filters: VaultFilter[] = ['全部', '效率工作流', '空间计算', '产品方法论'];

export default function PhaseVault() {
  const [filter, setFilter] = useState<VaultFilter>('全部');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<VaultEntry | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  const copyCode = async (entry: VaultEntry) => {
    if (!entry.code) return;
    try {
      await navigator.clipboard.writeText(entry.code);
      setCopied(entry.id);
      window.setTimeout(() => setCopied((current) => (current === entry.id ? null : current)), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="vault-phase" aria-labelledby="vault-title">
      <div className="vault-orbit vault-orbit--one" aria-hidden="true" />
      <div className="vault-orbit vault-orbit--two" aria-hidden="true" />
      <header className="vault-hero">
        <div className="vault-hero__copy">
          <p className="eyebrow">03 / TEMPORAL VAULT</p>
          <h1 id="vault-title">把想法，封存在下一次跃迁之前。</h1>
          <p className="vault-hero__lead">一组关于空间智能、认知工程与可复核工作流的短札。每张晶体手记都从一个具体问题出发。</p>
        </div>
        <div className="vault-hero__mark" aria-label="Temporal Vault">
          <span className="vault-hero__mark-ring"><BookOpen size={24} strokeWidth={1.4} /></span>
          <span>TV / 05</span>
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
          {selected.code && <div className="vault-code"><div className="vault-code__head"><span>可复用结构</span><button type="button" onClick={() => copyCode(selected)}><Clipboard size={14} />{copied === selected.id ? <><Check size={14} /> 已复制</> : '复制'}</button></div><pre><code>{selected.code}</code></pre></div>}
          <div className="vault-drawer__foot"><Sparkles size={15} /><span>手记是短暂的，证据和边界让它可再次使用。</span></div>
        </div>}
      </dialog>
    </section>
  );
}
