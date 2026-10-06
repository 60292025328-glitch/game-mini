// ZatsuNote - AI Note App Logic

const { useState, useEffect, useRef } = React;

/* ── utils ── */
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmtDate = s => {
  const d = new Date(s), df = Math.floor((Date.now() - d) / 864e5);
  return df === 0 ? '今日' : df === 1 ? '昨日' : df < 7 ? `${df}日前`
    : d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};
const fmtDT = s => new Date(s).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtTime = s => new Date(s).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

/* ── storage ── */
const SKEY = 'zn3', CKEY = 'zc3';
const DEMO = [
  {
    id: uid(), title: 'プロジェクトのアイデア整理',
    content: '# プロジェクトのアイデア整理\n\n## やりたいこと\n- AIを使ったノートアプリを作る\n- Markdownエディタ + AIアシスタント\n- タグの自動生成機能\n\n## 技術スタック\n- **フロントエンド**: Next.js + Tailwind\n- **AI**: OpenAI GPT-4o\n\n## 次のアクション\n- [ ] 競合調査（Notion AI）\n- [ ] プロトタイプを1週間で作る',
    summary: 'AIノートアプリのアイデアと技術スタックを整理。次のアクションが明確化されている。',
    tags: ['プロジェクト', 'AI', '開発'],
    ca: new Date(Date.now() - 864e5 * 2).toISOString(), ua: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: uid(), title: '今週の振り返り',
    content: '# 今週の振り返り\n\n**よかったこと**\n- 毎朝30分の読書を続けられた\n- コードレビューで好評価をもらった\n\n**改善したいこと**\n- 夜遅くスマホを見てしまう\n- 運動できていない\n\n来週のテーマ: **「一つに絞る」**',
    summary: '今週の良かった点と改善点。来週は「一つに絞る」がテーマ。',
    tags: ['振り返り', '習慣', '生産性'],
    ca: new Date(Date.now() - 864e5).toISOString(), ua: new Date(Date.now() - 864e5).toISOString()
  },
  {
    id: uid(), title: '読書メモ: ゼロ・トゥ・ワン',
    content: '# ゼロ・トゥ・ワン\n\n## 核心メッセージ\n「0→1」を目指す。競争を避け独占を目指すことから真のイノベーションが生まれる。\n\n## 印象的なフレーズ\n> 「競争はあなたから利益を奪い、誰とも区別できない存在にする」\n\n## 学んだこと\n1. 独占こそが持続的ビジネスの鍵\n2. 小さな市場で圧倒的No.1になってから拡張する',
    summary: '競争を避けて独占を目指す核心メッセージをまとめた読書メモ。',
    tags: ['読書', 'ビジネス', '戦略'],
    ca: new Date(Date.now() - 36e5 * 3).toISOString(), ua: new Date(Date.now() - 36e5 * 3).toISOString()
  },
];
const loadN = () => { try { const r = localStorage.getItem(SKEY); return r ? JSON.parse(r) : DEMO; } catch { return DEMO; } };
const saveN = d => localStorage.setItem(SKEY, JSON.stringify(d));
const loadC = () => { try { const r = localStorage.getItem(CKEY); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const saveC = d => localStorage.setItem(CKEY, JSON.stringify(d));

/* ── AI mock ── */
const SUMS = ['複数のアイデアと課題を整理したメモ。次のアクションが明確。', '日常の観察から得たインサイトを記録。後で深掘りする価値がある。', '学習内容の要点をまとめたノート。', 'ブレスト結果。有望なアイデアがいくつか含まれている。'];
const TAGPOOL = [['アイデア', '思考', '創造性'], ['タスク', 'TODO', '生産性'], ['学習', 'メモ', '知識'], ['プロジェクト', '計画', '進捗'], ['振り返り', '習慣', '成長'], ['技術', '開発', 'コード']];

async function aiOrg(content) {
  await sleep(1000 + Math.random() * 700);
  const fl = content.split('\n')[0].replace(/^#+\s*/, '').trim();
  const title = fl ? fl.slice(0, 40) + (fl.length > 40 ? '…' : '') : pick(['アイデアメモ', '思考の整理', '雑多メモ']);
  const tp = pick(TAGPOOL);
  return { title, summary: pick(SUMS), tags: tp.slice(0, 3 + Math.floor(Math.random() * 2)) };
}

async function aiChat(content, msg) {
  await sleep(600 + Math.random() * 900);
  const m = msg.toLowerCase();
  if (m.includes('要点') || m.includes('ポイント'))
    return '**要点3点：**\n\n1. **核心テーマ** — メモ全体を通じた中心的な概念があります。\n2. **アクション** — 実行可能なステップが含まれています。\n3. **未解決事項** — 追加調査が必要な点が残っています。\n\n※ OpenAI APIを接続すると実際の内容で分析します。';
  if (m.includes('アクション') || m.includes('タスク') || m.includes('todo'))
    return '**アクションアイテム：**\n\n- [ ] 主要なアイデアをさらに調査する\n- [ ] 関係者と共有して意見を収集する\n- [ ] 優先度を整理して実行計画を立てる\n- [ ] 期限を設けて進捗を管理する';
  if (m.includes('要約') || m.includes('1行') || m.includes('概要'))
    return '**概要：**\n\nこのノートは複数のアイデアや観察事項を記録したものです。情報整理フェーズの内容が中心で、具体的な実行計画への移行が次のステップです。';
  if (m.includes('改善'))
    return '**改善提案：**\n\n1. **構造化** — 見出しと箇条書きで階層を明確にする\n2. **具体化** — 抽象表現を例や数値で補足する\n3. **結論明示** — 各セクションの末尾に次のステップを記載する';
  return `「${msg}」についてですが、このノートの文脈から複数の視点で検討できます。\n\nテーマをさらに細分化すると答えが見つかりやすくなるかもしれません。\n\n（OpenAI APIを接続すると実際の内容に基づく回答になります）`;
}

/* ── Icon ── */
const PATHS = {
  plus: 'M12 5v14M5 12h14', search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  cd: 'M6 9l6 6 6-6', cr: 'M9 18l6-6-6-6', cl: 'M15 18l-6-6 6-6',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  cols: 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7M12 3v18',
  spark: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  load: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  check: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  bot: 'M12 8V4H8M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM9 13h.01M15 13h.01M10 17c.667.333 1.333.5 2 .5s1.333-.167 2-.5',
  send: 'M22 2 11 13M22 2 15 22 11 13 2 9z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  x: 'M18 6 6 18M6 6l12 12',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  al: 'M17 10H3M21 6H3M21 14H3M17 18H3',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

function I({ n, s = 16, c = '', st }) {
  return React.createElement('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: c, style: st },
    React.createElement('path', { d: PATHS[n] })
  );
}

/* ── NoteItem ── */
function NItem({ note, sel, onSel, onDel }) {
  const [hov, setHov] = useState(false);
  const bg = sel ? 'rgba(124,106,247,.15)' : hov ? '#222' : 'transparent';
  const bd = sel ? '1px solid rgba(124,106,247,.3)' : '1px solid transparent';
  return (
    <div onClick={onSel} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: bg, border: bd }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <I n="file" s={12} st={{ color: sel ? '#7c6af7' : '#555', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: sel ? '#e8e8e8' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || '無題'}</span>
        </div>
        {hov && <button onClick={e => { e.stopPropagation(); onDel(); }}
          style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          <I n="trash" s={11} />
        </button>}
      </div>
      {note.summary && <p style={{ fontSize: 11, color: '#555', paddingLeft: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.summary}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {note.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: '#1e1e1e', color: '#555', border: '1px solid #2a2a2a' }}>{t}</span>)}
          {note.tags.length > 2 && <span style={{ fontSize: 10, color: '#555' }}>+{note.tags.length - 2}</span>}
        </div>
        <span style={{ fontSize: 10, color: '#555' }}>{fmtDate(note.ua)}</span>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({ notes, sid, q, stag, onAdd, onSel, onDel, onQ, onTag }) {
  const [to, setTo] = useState(true);
  const tags = [...new Set(notes.flatMap(n => n.tags))].sort();
  const list = notes.filter(n => {
    const mq = !q || [n.title, n.content, ...n.tags].some(s => s.toLowerCase().includes(q.toLowerCase()));
    return mq && (!stag || n.tags.includes(stag));
  });
  const S = (k, v) => ({ [k]: v });
  return (
    <div style={{ width: 256, minWidth: 256, background: '#181818', borderRight: '1px solid #262626', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #262626' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <I n="file" s={15} st={{ color: '#7c6af7' }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: '#e8e8e8' }}>ZatsuNote</span>
        </div>
        <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#7c6af7', color: '#fff', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#9585f8'}
          onMouseLeave={e => e.currentTarget.style.background = '#7c6af7'}>
          <I n="plus" s={12} /> 新規
        </button>
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #262626', position: 'relative' }}>
        <I n="search" s={13} st={{ color: '#555', position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={q} onChange={e => onQ(e.target.value)} placeholder="検索..."
          style={{ width: '100%', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, color: '#e8e8e8', fontSize: 13, padding: '5px 28px 5px 30px', outline: 'none' }} />
        {q && <button onClick={() => onQ('')} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}><I n="x" s={12} /></button>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tags.length > 0 && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #262626' }}>
            <button onClick={() => setTo(!to)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 6 }}>
              <I n={to ? 'cd' : 'cr'} s={11} /><I n="tag" s={11} /> タグ
            </button>
            {to && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 12 }}>
              {stag && <button onClick={() => onTag(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(124,106,247,.2)', color: '#7c6af7', border: '1px solid rgba(124,106,247,.4)', cursor: 'pointer' }}><I n="x" s={9} /> 全て</button>}
              {tags.map(t => <button key={t} onClick={() => onTag(stag === t ? null : t)}
                style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, cursor: 'pointer', background: stag === t ? 'rgba(124,106,247,.2)' : '#222', color: stag === t ? '#7c6af7' : '#555', border: stag === t ? '1px solid rgba(124,106,247,.4)' : '1px solid #2a2a2a' }}>{t}</button>)}
            </div>}
          </div>
        )}
        <div style={{ padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#555' }}>ノート</span>
            <span style={{ fontSize: 11, color: '#555' }}>{list.length}件</span>
          </div>
          {list.length === 0
            ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px 0', color: '#444' }}>
              <I n="file" s={24} /><p style={{ fontSize: 12 }}>ノートがありません</p>
            </div>
            : list.map(n => <NItem key={n.id} note={n} sel={n.id === sid} onSel={() => onSel(n.id)} onDel={() => onDel(n.id)} />)}
        </div>
      </div>
      <div style={{ padding: '6px 16px', borderTop: '1px solid #262626', textAlign: 'center', fontSize: 11, color: '#444' }}>
        {notes.length} ノート · {tags.length} タグ
      </div>
    </div>
  );
}

/* ── Editor ── */
function Editor({ note, onUpd, onDel, allTags }) {
  const [mode, setMode] = useState('edit');
  const [lc, setLc] = useState(note?.content ?? '');
  const [al, setAl] = useState(false);
  const [aok, setAok] = useState(false);
  const tmr = useRef(null);

  useEffect(() => { setLc(note?.content ?? ''); setAok(false); }, [note?.id]);
  useEffect(() => {
    if (!note) return;
    clearTimeout(tmr.current);
    const id = note.id;
    tmr.current = setTimeout(() => onUpd(id, { content: lc }), 300);
    return () => clearTimeout(tmr.current);
  }, [lc]);

  const doAi = async () => {
    if (!note || !lc.trim() || al) return;
    setAl(true);
    try { const r = await aiOrg(lc); onUpd(note.id, r); setAok(true); setTimeout(() => setAok(false), 3000); }
    finally { setAl(false); }
  };

  if (!note) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#111', color: '#555' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#181818', border: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <I n="edit" s={28} />
      </div>
      <p style={{ fontSize: 14, color: '#888' }}>ノートを選択してください</p>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#111' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#181818', borderBottom: '1px solid #262626', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
          {[{ id: 'edit', n: 'edit', l: '編集' }, { id: 'split', n: 'cols', l: '分割' }, { id: 'preview', n: 'eye', l: 'プレビュー' }].map(({ id, n, l }) => (
            <button key={id} onClick={() => setMode(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: mode === id ? '#181818' : 'transparent', color: mode === id ? '#e8e8e8' : '#666', border: 'none', cursor: 'pointer' }}>
              <I n={n} s={11} />{l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#555' }}><I n="clock" s={11} />{fmtDT(note.ua)}</span>
          <button onClick={doAi} disabled={al || !lc.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: al ? 'wait' : 'pointer', background: aok ? 'rgba(34,197,94,.2)' : 'rgba(124,106,247,.15)', color: aok ? '#4ade80' : '#7c6af7' }}>
            <I n={al ? 'load' : aok ? 'check' : 'spark'} s={12} c={al ? 'spin' : ''} />
            {al ? '整理中...' : aok ? '完了!' : 'AIで整理'}
          </button>
          <button onClick={() => { if (confirm('削除しますか？')) onDel(note.id); }}
            style={{ padding: 6, borderRadius: 6, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'none'; }}>
            <I n="trash" s={14} />
          </button>
        </div>
      </div>
      <div style={{ padding: '16px 24px 12px', background: '#181818', borderBottom: '1px solid #262626', flexShrink: 0 }}>
        <input value={note.title} onChange={e => onUpd(note.id, { title: e.target.value })} placeholder="タイトルを入力..."
          style={{ width: '100%', fontSize: 20, fontWeight: 700, color: '#e8e8e8', background: 'none', border: 'none', outline: 'none', marginBottom: 8 }} />
        {note.summary && <p style={{ fontSize: 13, color: '#aaa', marginBottom: 8, lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid rgba(124,106,247,.4)' }}>{note.summary}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <I n="tag" s={12} st={{ color: '#555', flexShrink: 0 }} />
          {note.tags.map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'rgba(124,106,247,.15)', color: '#7c6af7', border: '1px solid rgba(124,106,247,.25)' }}>
              {t}
              <button onClick={() => onUpd(note.id, { tags: note.tags.filter(x => x !== t) })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c6af7', fontSize: 13, lineHeight: 1, padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = '#7c6af7'}>×</button>
            </span>
          ))}
          <input placeholder="タグ追加 (Enter)" list="tl"
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              const v = e.target.value.trim();
              if (v && note && !note.tags.includes(v)) onUpd(note.id, { tags: [...note.tags, v] });
              e.target.value = '';
            }}
            style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', outline: 'none', width: 110 }} />
          <datalist id="tl">{allTags.map(t => <option key={t} value={t} />)}</datalist>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {(mode === 'edit' || mode === 'split') && (
          <div style={{ flex: mode === 'split' ? '0 0 50%' : 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: mode === 'split' ? '1px solid #262626' : 'none' }}>
            <textarea value={lc} onChange={e => setLc(e.target.value)}
              placeholder={'# タイトル\n\nここに自由に書き殴ってください...\n\nMarkdown記法が使えます。'}
              style={{ flex: 1, width: '100%', padding: '16px 24px', background: '#111', color: '#e8e8e8', fontSize: 14, lineHeight: 1.8, resize: 'none', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono',monospace" }}
              spellCheck={false} />
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className="md-body" style={{ flex: mode === 'split' ? '0 0 50%' : 1, overflowY: 'auto', padding: '16px 24px', background: '#111' }}
            dangerouslySetInnerHTML={{ __html: lc.trim() ? marked.parse(lc) : '<p style="color:#555;font-size:14px">プレビューするコンテンツがありません</p>' }} />
        )}
      </div>
    </div>
  );
}

/* ── AiSidebar ── */
function AiSidebar({ note, chats, setChats, open, onToggle }) {
  const msgs = note ? (chats[note.id] ?? []) : [];
  const [inp, setInp] = useState('');
  const [load, setLoad] = useState(false);
  const btm = useRef(null);
  const QUICK = [
    { n: 'zap', l: '要点を3つ', p: 'このメモの要点を3つ教えてください。' },
    { n: 'al', l: 'アクション抽出', p: 'このメモからアクションアイテムを抽出してください。' },
    { n: 'msg', l: '1行で要約', p: 'このメモを1行で要約してください。' },
    { n: 'spark', l: '改善提案', p: 'このメモをより良くするための改善提案をしてください。' },
  ];

  useEffect(() => { btm.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length, load]);

  const send = async (text) => {
    const t = (text ?? inp).trim();
    if (!t || !note || load) return;
    setInp('');
    const um = { id: uid(), role: 'user', content: t, ts: new Date().toISOString() };
    setChats(c => { const n = { ...c, [note.id]: [...(c[note.id] ?? []), um] }; saveC(n); return n; });
    setLoad(true);
    try {
      const r = await aiChat(note.content, t);
      const am = { id: uid(), role: 'ai', content: r, ts: new Date().toISOString() };
      setChats(c => { const n = { ...c, [note.id]: [...(c[note.id] ?? []), am] }; saveC(n); return n; });
    } finally { setLoad(false); }
  };

  if (!open) return (
    <div style={{ width: 40, minWidth: 40, background: '#181818', borderLeft: '1px solid #262626', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
      <button onClick={onToggle} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        onMouseEnter={e => e.currentTarget.style.color = '#7c6af7'}
        onMouseLeave={e => e.currentTarget.style.color = '#555'}>
        <I n="cl" s={15} /><I n="bot" s={15} />
      </button>
    </div>
  );

  return (
    <div style={{ width: 300, minWidth: 300, background: '#181818', borderLeft: '1px solid #262626', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #262626', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,106,247,.2)', border: '1px solid rgba(124,106,247,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I n="bot" s={13} st={{ color: '#7c6af7' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>AIアシスタント</p>
            <p style={{ fontSize: 10, color: '#555' }}>ノートについて質問できます</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {msgs.length > 0 && note && <button onClick={() => setChats(c => { const n = { ...c, [note.id]: [] }; saveC(n); return n; })}
            style={{ padding: 6, borderRadius: 6, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'none'; }}>
            <I n="trash" s={13} />
          </button>}
          <button onClick={onToggle} style={{ padding: 6, borderRadius: 6, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#222'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <I n="cr" s={14} />
          </button>
        </div>
      </div>

      {!note ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1e1e1e', border: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I n="bot" s={20} st={{ color: '#444' }} /></div>
          <p style={{ fontSize: 13, color: '#888' }}>ノートを選択してください</p>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,106,247,.2)', border: '1px solid rgba(124,106,247,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <I n="bot" s={12} st={{ color: '#7c6af7' }} />
                  </div>
                  <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '0 12px 12px 12px', padding: '8px 12px', fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>
                    「{note.title}」についてお気軽に質問してください。
                  </div>
                </div>
                <div style={{ paddingLeft: 32 }}>
                  <p style={{ fontSize: 10, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>クイック質問</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {QUICK.map(({ n, l, p }) => (
                      <button key={l} onClick={() => send(p)} disabled={load}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', fontSize: 12, color: '#aaa', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'; e.currentTarget.style.color = '#e8e8e8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#aaa'; }}>
                        <I n={n} s={11} st={{ color: '#7c6af7', flexShrink: 0 }} />{l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {msgs.map(m => (
                  <div key={m.id} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.role === 'user' ? '#1e1e1e' : 'rgba(124,106,247,.2)', border: m.role === 'user' ? '1px solid #2a2a2a' : '1px solid rgba(124,106,247,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <I n={m.role === 'user' ? 'user' : 'bot'} s={11} st={{ color: m.role === 'user' ? '#555' : '#7c6af7' }} />
                    </div>
                    <div style={{ maxWidth: '82%', padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px', fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap', background: m.role === 'user' ? 'rgba(124,106,247,.18)' : '#1e1e1e', color: m.role === 'user' ? '#e8e8e8' : '#aaa', border: m.role === 'user' ? '1px solid rgba(124,106,247,.25)' : '1px solid #2a2a2a' }}>
                      {m.content}
                      <div style={{ fontSize: 10, color: '#555', marginTop: 4, textAlign: m.role === 'user' ? 'right' : 'left' }}>{fmtTime(m.ts)}</div>
                    </div>
                  </div>
                ))}
                {load && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,106,247,.2)', border: '1px solid rgba(124,106,247,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <I n="bot" s={11} st={{ color: '#7c6af7' }} />
                    </div>
                    <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '0 12px 12px 12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <I n="load" s={12} c="spin" st={{ color: '#7c6af7' }} />
                      <span style={{ fontSize: 12, color: '#555' }}>考え中...</span>
                    </div>
                  </div>
                )}
                <div ref={btm} />
              </>
            )}
          </div>
          {msgs.length > 0 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #262626', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {QUICK.map(({ n, l, p }) => (
                <button key={l} onClick={() => send(p)} disabled={load}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#1e1e1e', border: '1px solid #2a2a2a', fontSize: 11, color: '#666', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,106,247,.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                  <I n={n} s={10} st={{ color: '#7c6af7' }} />{l}
                </button>
              ))}
            </div>
          )}
          <div style={{ padding: 12, borderTop: '1px solid #262626', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12, padding: '8px 12px' }}>
              <textarea value={inp} onChange={e => setInp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="質問を入力... (Enter で送信)" rows={1} disabled={load}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e8e8e8', fontSize: 12, resize: 'none', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }} />
              <button onClick={() => send()} disabled={!inp.trim() || load}
                style={{ padding: 6, borderRadius: 8, background: inp.trim() && !load ? '#7c6af7' : '#2a2a2a', color: '#fff', border: 'none', cursor: inp.trim() && !load ? 'pointer' : 'default', flexShrink: 0 }}>
                <I n="send" s={13} />
              </button>
            </div>
            <p style={{ fontSize: 10, color: '#555', textAlign: 'center', marginTop: 6 }}>Shift+Enter で改行</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── App ── */
function App() {
  const [notes, setNotes] = useState(loadN);
  const [sid, setSid] = useState(() => { const n = loadN(); return n[0]?.id ?? null; });
  const [q, setQ] = useState('');
  const [stag, setStag] = useState(null);
  const [chats, setChats] = useState(loadC);
  const [aiOpen, setAiOpen] = useState(true);

  useEffect(() => saveN(notes), [notes]);

  const note = notes.find(n => n.id === sid) ?? null;
  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort();

  const addNote = () => {
    const n = { id: uid(), title: '新規ノート', content: '', summary: '', tags: [], ca: new Date().toISOString(), ua: new Date().toISOString() };
    setNotes(ns => [n, ...ns]);
    setSid(n.id);
  };

  const updNote = (id, patch) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, ...patch, ua: new Date().toISOString() } : n));
  };

  const delNote = (id) => {
    setNotes(ns => {
      const rest = ns.filter(n => n.id !== id);
      if (sid === id) setSid(rest[0]?.id ?? null);
      return rest;
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar notes={notes} sid={sid} q={q} stag={stag}
        onAdd={addNote} onSel={setSid} onDel={delNote}
        onQ={setQ} onTag={setStag} />
      <Editor note={note} onUpd={updNote} onDel={delNote} allTags={allTags} />
      <AiSidebar note={note} chats={chats} setChats={setChats} open={aiOpen} onToggle={() => setAiOpen(o => !o)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
