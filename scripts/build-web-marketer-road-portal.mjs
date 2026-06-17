#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const publicDir = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const mirrorDir = "/Users/tanakayuichi/Projects/theleadpromotion/21_プロジェクト一覧/田中祐一/PLCプロモ素材/WEBマーケターへの道/90_制作パッケージサンプル";
const sourceRoot = "/Users/tanakayuichi/Projects/theleadpromotion/21_プロジェクト一覧/田中祐一/PLCプロモ素材/WEBマーケターへの道";

const dirs = [publicDir, mirrorDir];

const navGroups = [
  {
    label: "レポート",
    items: [
      ["index.html", "P", "制作ポータル", "入口"],
      ["visual-report.html", "R", "全体構成", "ファネル全体"],
      ["text-report.html", "T", "制作テキスト", "読み物版"],
      ["roadmap.html", "M", "工程表", "9工程"],
      ["kpi.html", "K", "KPI設計", "規模感"],
    ],
  },
  {
    label: "設計シート",
    items: [
      ["sheets.html", "S", "各種設計シート", "一覧"],
      ["concept.html", "C", "コンセプト", "根幹"],
      ["profile.html", "P", "プロフィール", "信頼"],
      ["config.html", "G", "コンフィグ", "判断軸"],
      ["research.html", "R", "リサーチ", "市場/競合"],
      ["offer.html", "O", "オファー", "商品/条件"],
    ],
  },
  {
    label: "制作物",
    items: [
      ["assets.html", "A", "制作物一覧", "カテゴリ"],
      ["lp.html", "L", "LP一覧", "入口/販売"],
      ["head.html", "H", "ヘッド指示", "FV"],
      ["stepmail.html", "M", "ステップメール", "時系列"],
      ["line.html", "N", "LINE配信", "運用"],
      ["script-opening.html", "V", "挨拶動画", "台本"],
      ["live-scripts.html", "D", "ライブ台本", "Day1-5"],
      ["sales-page.html", "S", "セールスページ", "販売"],
      ["files.html", "F", "原本・MD", "保存"],
    ],
  },
];

const urls = {
  optin: "https://sub.the-lead10.com/p/house_lp01",
  thanks: "https://sub.the-lead10.com/p/webmarketer_thanks",
  openchat: "https://line.me/ti/g2/PZPs8BovqdqcMVu3OB14ewhtHHKgp2VJ2GU30Q?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
  sales: "https://sub.the-lead10.com/p/webmarke",
  salesThanks: "https://sub.the-lead10.com/p/webmarke_thanks",
  taskLine: "https://sub.the-lead10.com/line/open/iUvRbLnUJh6y",
};

const liveRows = [
  {
    day: "Day1",
    title: "マインドセットとD.E.C.O.D.E.全体像",
    purpose: "地味で平凡な会社員でも、社長の右腕として売上に関われるという新世界を提示する。",
    core: "裏方Webマーケター、全員で勝つ、全てはテスト、D.E.C.O.D.E.の全体地図。",
    task: "このライブが参加したいと思わせるために使っていた仕掛けを3つ以上書き出す。",
    count: "91件",
    video: "https://youtu.be/oeNkXpu4f8E",
    script: "04_価値提供/01_ライブシナリオ/01_Day1ライブシナリオ.md",
    videoDoc: "04_価値提供/02_ライブ動画/01_Day1ライブ動画.md",
  },
  {
    day: "Day2",
    title: "左脳設計: ファネルと集客",
    purpose: "売上を感覚ではなく構造で見るために、ファネルと集客導線を分解する。",
    core: "Design、Engagement、導線、リスト、数字、分解思考。",
    task: "売れる仕組みの構造を自分の言葉で整理する。",
    count: "52件",
    video: "https://youtu.be/uOeKd74L164",
    script: "04_価値提供/01_ライブシナリオ/02_Day2ライブシナリオ.md",
    videoDoc: "04_価値提供/02_ライブ動画/02_Day2ライブ動画.md",
  },
  {
    day: "Day3",
    title: "右脳設計: 感情・コンセプト・オファー",
    purpose: "3Cリサーチから、誰に何をどう言えば動くかを組み立てる。",
    core: "Concept、Offer、Delivery、ターゲット感情、オファーの見せ方。",
    task: "コンセプトとオファーの骨子を作る。",
    count: "45件",
    video: "https://youtu.be/xGaZDcEKu9o",
    script: "04_価値提供/01_ライブシナリオ/03_Day3ライブシナリオ.md",
    videoDoc: "04_価値提供/02_ライブ動画/03_Day3ライブ動画.md",
  },
  {
    day: "Day4",
    title: "実践: クライアント獲得とチーム化",
    purpose: "学習者から、現場で動くWebマーケターへ進むための実践導線を見せる。",
    core: "クライアント獲得、チーム化、実績作り、進化の8段階。",
    task: "45日間の実践環境に必要なサポートを言語化する。",
    count: "40件",
    video: "https://youtu.be/bj1ctIfUSJc",
    script: "04_価値提供/01_ライブシナリオ/04_Day4ライブシナリオ.md",
    videoDoc: "04_価値提供/02_ライブ動画/04_Day4ライブ動画.md",
  },
  {
    day: "Day5",
    title: "継続マインドセットと実践プログラム案内",
    purpose: "5日間の学びを実践環境へ接続し、45日間ブートキャンプの価値を伝える。",
    core: "全てが揃うことはない、出せるカードを切る、実践環境、ブートキャンプ案内。",
    task: "最終アウトプットとコンプリート特典への導線。",
    count: "37件",
    video: "https://youtu.be/3F5T-slajMQ",
    script: "04_価値提供/01_ライブシナリオ/05_Day5ライブシナリオ.md",
    videoDoc: "04_価値提供/02_ライブ動画/05_Day5ライブ動画.md",
  },
];

const roadmapRows = [
  ["1. 全体設計", "商品、販売方式、ファネル、KPI、制作範囲を仮決めする。", ["全体設計メモ", "KPI仮シミュレーション", "制作範囲"], "完了"],
  ["2. コンセプト構築", "ターゲット、競合、自社強み、旧世界/新世界、真の原因、コアシナリオをまとめる。", ["コンセプトシート", "リサーチシート", "プロフィール", "コンフィグ"], "作成中"],
  ["3. オファー設計", "本命商品の約束、提供内容、特典、価格、限定性、購入障壁を整理する。", ["オファーシート", "購入障壁整理", "保証/特典メモ"], "要確認"],
  ["4. 集客ページ制作", "登録させるための訴求、ヘッド、登録経路別URLを整える。", ["オプトインLP", "サンキュー", "ヘッド指示"], "原本あり"],
  ["5. 配信導線制作", "登録直後からライブ開始までのメール、オープンチャット案内、公式LINE導線を整える。", ["登録後メール", "固定ノート", "課題受け取りLINE"], "原本あり"],
  ["6. 価値提供制作", "Day1からDay5までのライブ台本、課題、特典、アーカイブ導線をまとめる。", ["ライブ台本", "課題フォーム", "特典", "アーカイブ"], "原本あり"],
  ["7. 販売素材制作", "セールスページ、販売期メルマガ、公式LINE、購入完了ページを整える。", ["セールスページ", "販売期メール", "公式LINE", "購入完了ページ"], "原本あり"],
  ["8. 公開・運用", "URL、締切、アーカイブ期限、質問回答、配信スケジュールを運用できる状態にする。", ["URL台帳", "配信対応表", "質問回答運用"], "要確認"],
  ["9. レビュー・差し替え", "原本を差し替えたときにHTMLとMDを更新し、制作物の最新版を残す。", ["原本MD", "レビュー確認事項", "更新履歴"], "順次"],
];

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sourcePath(relative) {
  return path.join(sourceRoot, relative);
}

function read(relative) {
  const file = sourcePath(relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function list(relative) {
  const dir = sourcePath(relative);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const item = path.join(relative, entry.name);
      if (entry.isDirectory()) return list(item);
      if (!entry.name.endsWith(".md")) return [];
      return item;
    })
    .sort((a, b) => a.localeCompare(b, "ja"));
}

function titleOf(relative) {
  const text = read(relative);
  const heading = text.match(/^#\s+(.+)$/m)?.[1];
  return heading || path.basename(relative, ".md");
}

function meta(text, key) {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() || "";
}

function bodyExcerpt(relative, limit = 360) {
  const text = read(relative)
    .replace(/^#\s+.+$/m, "")
    .replace(/^> 原稿URL:.+$/gm, "")
    .replace(/^Produced by[\s\S]*$/m, "")
    .replace(/^---$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const compact = text.replace(/\s+\n/g, "\n").trim();
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
}

function bodyFull(relative, limit = 36000) {
  const text = read(relative)
    .replace(/^Produced by[\s\S]*$/m, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit).trim()}\n\n（以下、原本MDに続きます）` : text;
}

function inlineMarkdown(value = "") {
  return esc(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let paragraph = [];
  let listOpen = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${paragraph.map(inlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listOpen) return;
    out.push("</ul>");
    listOpen = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(heading[1].length + 1, 4);
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  return out.join("\n");
}

function articleFrom(relative, limit = 36000) {
  const markdown = bodyFull(relative, limit);
  if (!markdown) return `<p class="muted">原本MDが見つかりません。</p>${source(relative)}`;
  return `<div class="article">${markdownToHtml(markdown)}</div>${source(relative)}`;
}

function sourceDetails(label, relative, limit = 36000, open = false) {
  return `<details ${open ? "open" : ""}><summary>${esc(label)}</summary><div class="details-body">${articleFrom(relative, limit)}</div></details>`;
}

function parseMail(relative) {
  const text = read(relative);
  const title = titleOf(relative);
  const isLine = relative.includes("/公式LINE/");
  const phase = relative.includes("フェーズ1") ? "登録後" : isLine ? "公式LINE" : "販売期";
  const day = meta(text, "配信日") || meta(text, "配信実績日") || meta(text, "配信タイミング") || "";
  const time = meta(text, "配信時間") || meta(text, "配信実績時刻") || "";
  const category = meta(text, "カテゴリ") || phase;
  const body = text.split("---").slice(1).join("---") || text;
  const urls = [...body.matchAll(/https?:\/\/[^\s)]+/g)].map((match) => match[0]).filter((url) => !url.includes("docs.google.com"));
  return {
    relative,
    title,
    phase,
    day,
    time,
    category,
    cta: urls[0] || "",
    excerpt: bodyExcerpt(relative, isLine ? 260 : 330),
  };
}

function parseSpot(relative) {
  const name = path.basename(relative, ".md");
  const title = titleOf(relative);
  const phase = relative.includes("フェーズ1") ? "ライブ前" : relative.includes("フェーズ2") ? "価値提供中" : relative.includes("フェーズ3") ? "販売期" : "実ログ";
  const match = name.match(/_(Day[^_]+|販売[^_]+|9月[^_]+)_([0-9]+時(?:[0-9]+分)?|[0-9]+分)?_/);
  return {
    relative,
    phase,
    title,
    timing: match?.[1] || "",
    time: match?.[2] || "",
    excerpt: bodyExcerpt(relative, 220),
  };
}

function nav(active) {
  return `<aside class="side">
    <div class="brand"><div class="brand-mark">祐</div><div><p class="brand-title">田中祐一AI</p><span class="brand-sub">WEBマーケターへの道</span></div></div>
    ${navGroups.map((group) => `<div class="nav-section">${group.label}</div>${group.items.map(([href, code, label, sub]) => `<a class="nav-link ${href === active ? "active" : ""}" href="${href}"><span class="nav-num">${code}</span><span>${label}<small>${sub}</small></span></a>`).join("")}`).join("")}
  </aside>`;
}

function page({ file, title, eyebrow, lead, body }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | WEBマーケターへの道 制作ポータル</title>
  <link rel="stylesheet" href="portal.css?v=20260618-full-package">
</head>
<body>
<div class="layout">
${nav(file)}
<main class="main"><div class="wrap">
  <header class="hero"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></header>
  ${body}
</div></main>
</div>
</body>
</html>`;
}

function pills(items) {
  return `<div class="pills">${items.map((item) => `<span class="pill">${esc(item)}</span>`).join("")}</div>`;
}

function status(label) {
  const cls = label.includes("要") ? "need" : label.includes("順次") ? "todo" : "";
  return `<span class="status ${cls}">${esc(label)}</span>`;
}

function source(relative) {
  return `<span class="source-path">${esc(relative)}</span>`;
}

function card(title, metaLabel, text, href = "") {
  const link = href ? `<a class="card-link" href="${href}">開く</a>` : "";
  return `<div class="card white"><span class="meta">${esc(metaLabel)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${link}</div>`;
}

const registrationMails = list("12_メルマガ/フェーズ1_ライブ前/メルマガ").map(parseMail);
const salesMails = list("12_メルマガ/フェーズ3_セールスプッシュ/メルマガ").map(parseMail);
const officialLines = list("12_メルマガ/フェーズ3_セールスプッシュ/公式LINE").filter((file) => !file.includes("00_")).map(parseMail);
const fixedNotes = list("11_オープンチャットメッセージ/固定ノート").map((relative) => ({ relative, title: titleOf(relative), excerpt: bodyExcerpt(relative, 280) }));
const spots = list("11_オープンチャットメッセージ/スポット配信").map(parseSpot);
const plannedSpots = spots.filter((item) => item.phase !== "実ログ");
const logOnlySpots = spots.filter((item) => item.phase === "実ログ");

const phaseCounts = spots.reduce((acc, item) => {
  acc[item.phase] = (acc[item.phase] || 0) + 1;
  return acc;
}, {});

function mailTable(rows) {
  return `<div class="timeline">${rows.map((row, index) => `<article class="timeline-item">
    <div class="timeline-index">${String(index + 1).padStart(2, "0")}</div>
    <div>
      <div class="timeline-head"><strong>${esc(row.title)}</strong>${status(row.phase)}</div>
      <p class="muted">${esc([row.day, row.time, row.category].filter(Boolean).join(" / "))}</p>
      <p>${esc(row.excerpt)}</p>
      ${row.cta ? `<p class="cta-line">CTA: <a href="${esc(row.cta)}">${esc(row.cta)}</a></p>` : ""}${source(row.relative)}
    </div>
  </article>`).join("")}</div>`;
}

function sourceInventory() {
  const categories = [
    ["主要ページ", list("02_オプトインLP").length + list("03_サンキューページ").length + list("06_セールス").length],
    ["ライブ台本/動画", list("04_価値提供/01_ライブシナリオ").length + list("04_価値提供/02_ライブ動画").length],
    ["課題/特典", list("04_価値提供/03_課題").length + list("21_特典").length],
    ["オープンチャット", fixedNotes.length + spots.length],
    ["メール/公式LINE", registrationMails.length + salesMails.length + officialLines.length],
  ];
  return categories;
}

const css = `:root {
  --main: #2CB596;
  --sub: #189B7D;
  --bg: #F0FAF8;
  --ink: #132033;
  --muted: #5d726b;
  --line: #D4EDE6;
  --paper: #fff;
  --soft: #EAF8F4;
  --pale: #F7FCFB;
  --warn: #9d6517;
  --warn-bg: #FFF8E8;
  --danger: #B84B3A;
  --danger-bg: #FFF1EE;
  --shadow: 0 16px 42px rgba(24, 155, 125, .08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
html, body { overflow-x: hidden; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Yu Gothic", sans-serif;
  line-height: 1.76;
  letter-spacing: 0;
}
a { color: var(--sub); text-decoration: none; font-weight: 760; }
a:hover { text-decoration: underline; }
.layout { display: grid; grid-template-columns: 292px minmax(0, 1fr); min-height: 100vh; max-width: 100vw; }
.side { position: sticky; top: 0; height: 100vh; overflow: auto; padding: 24px 18px; background: var(--paper); border-right: 1px solid var(--line); }
.brand { display: grid; grid-template-columns: 46px 1fr; gap: 12px; align-items: center; margin-bottom: 24px; }
.brand-mark { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 8px; background: var(--main); color: #fff; font-weight: 850; }
.brand-title { margin: 0; font-size: 18px; line-height: 1.35; font-weight: 850; }
.brand-sub { display: block; margin-top: 2px; color: var(--muted); font-size: 12px; font-weight: 650; }
.nav-section { margin: 20px 0 7px; color: var(--muted); font-size: 11px; font-weight: 900; }
.nav-link { display: grid; grid-template-columns: 26px 1fr; gap: 8px; align-items: center; min-height: 39px; padding: 8px 9px; border-radius: 8px; color: #223449; font-size: 13px; font-weight: 760; }
.nav-link small { display: block; color: var(--muted); font-size: 10px; font-weight: 650; line-height: 1.35; }
.nav-link:hover, .nav-link.active { background: var(--soft); color: var(--sub); text-decoration: none; }
.nav-num { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 11px; font-weight: 850; }
.main { min-width: 0; padding: 40px min(5vw, 64px) 80px; }
.wrap { max-width: 1180px; margin: 0 auto; }
.hero { margin-bottom: 28px; }
.eyebrow { margin: 0 0 10px; color: var(--sub); font-size: 13px; font-weight: 900; }
h1 { margin: 0 0 14px; font-size: clamp(34px, 4vw, 54px); line-height: 1.18; font-weight: 850; letter-spacing: 0; }
h2 { margin: 0 0 14px; font-size: 25px; line-height: 1.35; font-weight: 800; }
h3 { margin: 0 0 8px; font-size: 19px; line-height: 1.4; font-weight: 780; }
p { margin: 0; }
ul, ol { margin: 10px 0 0; padding-left: 1.2em; }
li { margin: 4px 0; }
.lead { max-width: 900px; color: #526760; font-size: 17px; font-weight: 450; }
.muted { color: var(--muted); font-size: 13px; }
.panel { margin: 22px 0; padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); box-shadow: var(--shadow); }
.panel.flush { padding: 0; overflow: hidden; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.card { position: relative; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: var(--pale); }
.card.white { background: #fff; }
.card .meta { display: block; margin-bottom: 8px; color: var(--sub); font-size: 12px; font-weight: 900; }
.card p { color: var(--muted); font-size: 14px; }
.card-link { display: inline-flex; margin-top: 12px; }
.kpi { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.kpi span { display: block; color: var(--muted); font-size: 12px; font-weight: 800; }
.kpi strong { display: block; margin-top: 6px; font-size: 24px; line-height: 1.2; }
.flow { display: grid; gap: 0; }
.flow-row { display: grid; grid-template-columns: 180px minmax(0, 1fr) minmax(220px, .7fr) 92px; gap: 12px; align-items: center; padding: 15px 18px; border-top: 1px solid var(--line); }
.flow-row:first-child { border-top: 0; }
.flow-row strong { font-size: 15px; }
.flow-row p { color: var(--muted); font-size: 13px; }
.status { justify-self: start; padding: 4px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; white-space: nowrap; }
.status.todo { background: var(--warn-bg); color: var(--warn); }
.status.need { background: var(--danger-bg); color: var(--danger); }
.pills { display: flex; flex-wrap: wrap; gap: 7px; }
.pill { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 800; }
.asset-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.asset-table th, .asset-table td { padding: 13px 12px; border-top: 1px solid var(--line); text-align: left; vertical-align: top; }
.asset-table th { color: var(--muted); font-size: 12px; font-weight: 900; }
.asset-table td p { color: var(--muted); font-size: 13px; }
.source-path { display: inline-block; margin-top: 6px; color: #607970; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; font-weight: 650; word-break: break-all; }
.copy-box { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: #26384c; white-space: pre-wrap; font-size: 14px; line-height: 1.82; }
.note { padding: 14px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); color: #426158; font-weight: 650; }
.quote { margin-top: 12px; padding: 16px 18px; border-left: 4px solid var(--main); background: var(--pale); color: #304840; font-weight: 650; }
.section-title { margin-top: 28px; }
.source-grid { display: grid; gap: 12px; }
.source-card { display: grid; grid-template-columns: 150px minmax(0, 1fr) 110px; gap: 12px; align-items: start; padding: 14px 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.source-card p { color: var(--muted); font-size: 13px; }
.checklist { display: grid; gap: 10px; }
.checkitem { padding: 13px 15px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.checkitem strong { display: block; }
.checkitem span { color: var(--muted); font-size: 13px; }
.timeline { display: grid; gap: 12px; }
.timeline-item { display: grid; grid-template-columns: 54px 1fr; gap: 14px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.timeline-index { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: var(--soft); color: var(--sub); font-weight: 900; }
.timeline-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 5px; }
.cta-line { margin-top: 8px; color: var(--muted); font-size: 13px; word-break: break-all; }
.script-block { padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.script-block + .script-block { margin-top: 12px; }
.script-block .time { display: inline-flex; margin-bottom: 7px; padding: 3px 8px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; }
.funnel { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.funnel-step { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; text-align: center; font-weight: 850; }
details { border: 1px solid var(--line); border-radius: 8px; background: #fff; overflow: hidden; }
details + details { margin-top: 10px; }
summary { cursor: pointer; padding: 14px 16px; color: var(--ink); font-weight: 850; }
details .details-body { padding: 0 16px 16px; }
.article { max-width: 880px; color: #243648; font-size: 14px; line-height: 1.9; }
.article h2 { margin: 24px 0 10px; padding-top: 6px; color: var(--ink); font-size: 22px; border-top: 1px solid var(--line); }
.article h3 { margin: 20px 0 8px; color: var(--sub); font-size: 18px; }
.article h4 { margin: 16px 0 6px; font-size: 15px; color: var(--ink); }
.article p { margin: 10px 0 0; color: #324b44; }
.article ul { margin-top: 8px; }
.article li { color: #324b44; }
.article strong { color: var(--ink); }
.article code { padding: 1px 5px; border-radius: 5px; background: var(--soft); color: var(--sub); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .92em; }
.full-source-list { display: grid; gap: 12px; }
.two-col-list { columns: 2; column-gap: 36px; }
.badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
@media (max-width: 1080px) {
  .flow-row, .source-card, .timeline-item { grid-template-columns: 1fr; }
  .funnel { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .layout { display: block; }
  .side {
    position: sticky;
    top: 0;
    z-index: 20;
    height: auto;
    padding: 12px 14px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    box-shadow: 0 8px 22px rgba(24, 155, 125, .08);
  }
  .side::-webkit-scrollbar { height: 4px; }
  .brand {
    display: inline-grid;
    grid-template-columns: 38px 150px;
    gap: 9px;
    width: 205px;
    margin: 0 8px 0 0;
    vertical-align: middle;
  }
  .brand-mark { width: 38px; height: 38px; }
  .brand-title { font-size: 15px; }
  .brand-sub { font-size: 10px; }
  .nav-section { display: none; }
  .nav-link {
    display: inline-grid;
    grid-template-columns: 22px auto;
    width: auto;
    min-height: 38px;
    margin-right: 5px;
    vertical-align: middle;
    white-space: normal;
  }
  .nav-link small { display: none; }
  .main { padding: 28px 18px 60px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .two-col-list { columns: 1; }
}`;

const pages = new Map();

pages.set("index.html", page({
  file: "index.html",
  title: "田中祐一様の制作パッケージ",
  eyebrow: "田中祐一AI / 制作ポータル",
  lead: "WEBマーケターへの道を、工程表、設計シート、制作物、原本MDまで一つの制作ポータルとして確認します。",
  body: `
<section class="panel"><h2>案件の全体像</h2><div class="grid-3">
${card("会社員はWEBマーケターを目指しなさい", "企画", "地味で平凡な会社員に、裏方Webマーケターという別ルートを提示する5日間チャレンジ。", "concept.html")}
${card("45日間WEBマーケター超実践ブートキャンプ", "本命商品", "知識を増やすだけではなく、売上に関わる最初の実践経験を作る直販型オファー。", "offer.html")}
${card("HTMLとMDを同時に残す", "管理方針", "見せるページはHTML、AI参照と原本差し替え用はMDとして保存し、更新時に再生成します。", "files.html")}
</div></section>
<section class="panel"><h2>完成パッケージの現在地</h2><div class="grid-4">
<div class="kpi"><span>制作工程</span><strong>9工程</strong></div>
<div class="kpi"><span>設計シート</span><strong>5種</strong></div>
<div class="kpi"><span>配信原稿</span><strong>${registrationMails.length + salesMails.length + officialLines.length + spots.length + fixedNotes.length}件</strong></div>
<div class="kpi"><span>課題提出</span><strong>Day1 91件</strong></div>
</div></section>
<section class="panel"><h2>ポータルから確認できるもの</h2><div class="grid-3">
${card("工程表", "レポート", "細かな操作手順ではなく、各フェーズで何を作り、どんな成果物が揃うかを確認します。", "roadmap.html")}
${card("各種設計シート", "設計", "コンセプト、プロフィール、コンフィグ、リサーチ、オファーを制作物の前提として管理します。", "sheets.html")}
${card("制作物一覧", "制作", "LP、ヘッド、メール、LINE、挨拶動画、ライブ台本、セールスページを制作物として確認します。", "assets.html")}
</div></section>
<section class="panel"><h2>ファネル全体</h2><div class="funnel"><div class="funnel-step">オプトインLP</div><div class="funnel-step">LINEオープンチャット</div><div class="funnel-step">5日間ライブ/課題</div><div class="funnel-step">セールスページ</div><div class="funnel-step">決済</div></div></section>
`}));

pages.set("visual-report.html", page({
  file: "visual-report.html",
  title: "全体構成レポート",
  eyebrow: "レポート",
  lead: "WEBマーケターへの道のファネル、教育設計、制作物パッケージを一枚で把握します。",
  body: `
<section class="panel"><h2>ファネルの流れ</h2><div class="funnel"><div class="funnel-step">登録経路別LP</div><div class="funnel-step">OC参加</div><div class="funnel-step">Day1-5教育</div><div class="funnel-step">直販LP</div><div class="funnel-step">45日間実践</div></div><p class="quote">個別説明会を挟まず、5日間の価値提供と課題提出で熱量を上げ、セールスページで直接販売するモデルです。</p></section>
<section class="panel"><h2>教育設計</h2><div class="grid-2">${liveRows.map((row) => `<div class="card white"><span class="meta">${row.day}</span><h3>${esc(row.title)}</h3><p>${esc(row.purpose)}</p>${pills([row.core, `課題提出 ${row.count}`])}</div>`).join("")}</div></section>
<section class="panel"><h2>制作物パッケージ</h2><table class="asset-table"><thead><tr><th>区分</th><th>成果物</th><th>確認ページ</th></tr></thead><tbody>
<tr><td>設計</td><td>コンセプト、リサーチ、プロフィール、コンフィグ、オファー</td><td><a href="sheets.html">各種設計シート</a></td></tr>
<tr><td>集客</td><td>オプトインLP、登録後メール、オープンチャット固定ノート</td><td><a href="lp.html">LP一覧</a> / <a href="stepmail.html">ステップメール</a></td></tr>
<tr><td>価値提供</td><td>Day1〜Day5ライブ台本、課題、特典、アーカイブ導線</td><td><a href="live-scripts.html">ライブ台本</a></td></tr>
<tr><td>販売</td><td>セールスページ、販売期メルマガ、公式LINE、購入完了ページ</td><td><a href="sales-page.html">セールスページ</a></td></tr>
</tbody></table></section>
`}));

pages.set("text-report.html", page({
  file: "text-report.html",
  title: "制作テキストレポート",
  eyebrow: "レポート",
  lead: "見た目のポータルとは別に、制作判断の前提を文章で読み返すためのページです。",
  body: `
<section class="panel"><h2>このパッケージの読み方</h2><p>最初に全体構成と工程表で現在地を確認し、次に設計シートでコンセプトとオファーの根拠を見ます。その後、制作物一覧からLP、配信、動画台本、セールスページへ入る流れです。</p></section>
<section class="panel"><h2>田中祐一AIとして守る判断軸</h2><div class="checklist">
<div class="checkitem"><strong>商品から逆算する</strong><span>コンセプト、配信、台本は、45日間実践環境への納得感を作るために配置する。</span></div>
<div class="checkitem"><strong>ターゲットの自己認識を変える</strong><span>「地味で平凡」「顔出しが苦手」は弱みではなく、裏方Webマーケターの適性として言語化する。</span></div>
<div class="checkitem"><strong>制作物は原本とセットで残す</strong><span>HTMLは見せるため、MDはAI参照と差し替えのために保持する。</span></div>
</div></section>
<section class="panel"><h2>次に厚くするべき箇所</h2><ul><li>実際の競合名と比較対象を追加し、リサーチシートを強化する。</li><li>正式価格、分割、保証、サポート範囲を確認し、オファーシートを完成させる。</li><li>ヘッド画像とLPデザインの生成指示を、実際の制作ツール向けにさらに細かくする。</li></ul></section>
`}));

pages.set("roadmap.html", page({
  file: "roadmap.html",
  title: "制作工程表",
  eyebrow: "工程表",
  lead: "細かな操作手順ではなく、各フェーズで何を作り、どんな成果物が揃うかを確認する工程表です。",
  body: `<section class="panel flush"><div class="flow">${roadmapRows.map(([name, desc, outputs, label]) => `<div class="flow-row"><strong>${esc(name)}</strong><p>${esc(desc)}</p>${pills(outputs)}${status(label)}</div>`).join("")}</div></section>`}));

pages.set("kpi.html", page({
  file: "kpi.html",
  title: "KPI設計",
  eyebrow: "レポート",
  lead: "直販型チャレンジローンチの規模感を、リスト数、アクセス数、課題提出、販売数で確認します。",
  body: `
<section class="panel"><h2>仮シミュレーション</h2><div class="grid-4">
<div class="kpi"><span>仮単価</span><strong>60,000円</strong></div>
<div class="kpi"><span>販売実績メモ</span><strong>30名</strong></div>
<div class="kpi"><span>仮売上</span><strong>180万円</strong></div>
<div class="kpi"><span>販売方式</span><strong>直販</strong></div>
</div><p class="quote">価格と実売上は正式確認が必要です。現状はオファーシート上の仮値として扱います。</p></section>
<section class="panel"><h2>参加行動の実績</h2><table class="asset-table"><thead><tr><th>課題</th><th>提出数</th><th>意味</th></tr></thead><tbody>${liveRows.map((row) => `<tr><td>${row.day}</td><td>${row.count}</td><td>${esc(row.task)}</td></tr>`).join("")}</tbody></table></section>
<section class="panel"><h2>見るべき数字</h2><div class="grid-3">${card("登録率", "入口", "オプトインLPごとの登録率と登録経路別の反応を見る。")}${card("ライブ参加/課題提出", "価値提供", "Dayごとの離脱と提出数を見る。Day1からDay5までの落ち方が重要。")}${card("販売ページ購入率", "販売", "セールスページ閲覧から購入までの直販CVを確認する。")}</div></section>
`}));

pages.set("sheets.html", page({
  file: "sheets.html",
  title: "各種設計シート",
  eyebrow: "設計シート",
  lead: "制作物の前提になるレポートとシートをまとめます。ここでの判断がLPや動画台本へ反映されます。",
  body: `<section class="panel"><div class="grid-2">
${card("コンセプトシート", "Concept", "ターゲット、旧世界/新世界、真の原因、解決策、ミッション、採用コンセプト。", "concept.html")}
${card("リサーチシート", "Research", "市場カテゴリ、比較対象、空きポジション、ターゲット感情、訴求アイデア。", "research.html")}
${card("プロフィール", "Profile", "田中祐一の信頼材料と、LP/動画/販売ページに使う人物紹介。", "profile.html")}
${card("コンフィグ", "Config", "田中祐一AIが制作判断するときの視点、禁止表現、優先順位。", "config.html")}
${card("オファーシート", "Offer", "商品コンセプト、提供内容、購入障壁、特典、限定性。", "offer.html")}
${card("ヘッドデザイン指示書", "Design", "LPのファーストビューと画像生成・HTML制作への指示。", "head.html")}
</div></section>`}));

pages.set("concept.html", page({
  file: "concept.html",
  title: "コンセプトシート",
  eyebrow: "設計シート",
  lead: "このプロモーションの根幹になる、ターゲット、世界観、真の原因、解決策、採用コンセプトを確認します。",
  body: `
<section class="panel"><h2>採用コンセプト</h2><p class="quote">会社員はWEBマーケターを目指しなさい</p><div class="grid-2">${card("ターゲット", "Customer", "顔出しや派手な発信が苦手で、自分の商品や強い実績をまだ持っていない地味で平凡な会社員。")}${card("入口の約束", "Promise", "才能、経験、顔出し、自分の商品がなくても、社長の右腕として売上に関われる。")}</div></section>
<section class="panel"><h2>旧世界と新世界</h2><table class="asset-table"><thead><tr><th>観点</th><th>旧世界</th><th>新世界</th></tr></thead><tbody>
<tr><td>起業観</td><td>自分がスターになり、SNSで目立つ必要がある。</td><td>社長の右腕として、裏方で売上を支える道がある。</td></tr>
<tr><td>実績作り</td><td>自分の商品やフォロワーがないと始められない。</td><td>他者のプロモーションに関わることで実績を作れる。</td></tr>
<tr><td>スキル観</td><td>単体スキルを積み上げれば稼げる。</td><td>ファネル全体を理解し、売上構造を設計する。</td></tr>
</tbody></table></section>
<section class="panel"><h2>コアシナリオ素材</h2><div class="grid-2">
${card("真の原因", "Cause", "努力不足やセンス不足ではなく、最初の実績を安全に作れる実践環境と、売上までの全体構造を見通す型がないこと。")}
${card("解決策", "Solution", "D.E.C.O.D.E.で集客、教育、販売、オファー、LTVを構造として理解し、45日間の実践環境で経験を作る。")}
${card("ミッション", "Mission", "スターになれない人を置き去りにせず、売上を支える実務と戦略で価値を出せる人を増やす。")}
${card("ストーリー", "Story", "自分には何もない人ほど、表に立つより、全体を組み立て数字を見て導線を整える裏方の仕事で力を発揮する。")}
</div>${source("90_制作パッケージサンプル/01_コンセプトシート.md")}</section>
`}));

pages.set("profile.html", page({
  file: "profile.html",
  title: "プロフィール",
  eyebrow: "設計シート",
  lead: "LP、ライブ冒頭、セールスページで信頼形成に使う田中祐一プロフィールです。",
  body: `<section class="panel"><h2>プロフィール素材</h2><div class="grid-2">
${card("田中祐一", "人物", "株式会社ザ・リード創業者。KATSUO MARKETING FZCO CEO。お金をかけないプロダクトローンチの専門家。")}
${card("ストーリー", "信頼", "NTTデータ出身。起業初期に800万円の損失を経験し、プロダクトローンチの実践から初プロデュース4000万円を達成。")}
${card("実績", "Proof", "累計受講生1000人超、受講生が生み出した累計売上100億円超という文脈で再現性を提示する。")}
${card("今回の接続", "Use", "自分が前に出て苦しんだ過去から、裏方で売上を支えるWebマーケターの道へつなげる。")}
</div>${source("90_制作パッケージサンプル/09_プロフィール.md")}</section>`}));

pages.set("config.html", page({
  file: "config.html",
  title: "コンフィグ",
  eyebrow: "設計シート",
  lead: "田中祐一AIが制作判断するときの視点、トーン、禁止表現をまとめます。",
  body: `<section class="panel"><h2>制作判断の基本</h2><div class="checklist">
<div class="checkitem"><strong>職種型コンセプトとして扱う</strong><span>お悩み解決だけでなく、新しい職種への憧れと希少性を作る。</span></div>
<div class="checkitem"><strong>地味さを強みに変換する</strong><span>目立てない弱さではなく、客観視、支援力、全体を見る力として言語化する。</span></div>
<div class="checkitem"><strong>実践環境を売る</strong><span>ノウハウの多さではなく、最初の実績を作るための安全な場を強調する。</span></div>
<div class="checkitem"><strong>煽りすぎない</strong><span>札束、楽して稼ぐ、誰でも簡単という印象を避ける。</span></div>
</div>${source("90_制作パッケージサンプル/10_コンフィグ.md")}</section>`}));

pages.set("research.html", page({
  file: "research.html",
  title: "リサーチシート",
  eyebrow: "設計シート",
  lead: "市場、ライバル、見込み客の感情、空きポジションを整理し、コンセプトの根拠を確認します。",
  body: `<section class="panel"><h2>空きポジション</h2><p class="quote">スター型起業でも単体スキル習得でもなく、起業家のプロモーションを裏方から支え、売上に関わる実績を作るWebマーケター。</p></section>
<section class="panel"><h2>比較対象と取りこぼし</h2><table class="asset-table"><thead><tr><th>比較対象</th><th>魅力</th><th>取りこぼし</th></tr></thead><tbody>
<tr><td>SNS起業/インフルエンサー型</td><td>自分の名前で売れる、華やか。</td><td>顔出しや発信が苦手な人には重い。</td></tr>
<tr><td>Web制作スクール</td><td>スキルが明確で始めやすい。</td><td>時給型、作業者型に留まりやすい。</td></tr>
<tr><td>広告運用スクール</td><td>数字に近く収益化しやすい。</td><td>コンセプトやオファー全体には踏み込みにくい。</td></tr>
<tr><td>AI副業系</td><td>新しさと話題性がある。</td><td>実践環境や実績作りが曖昧になりやすい。</td></tr>
</tbody></table></section>
<section class="panel"><h2>訴求アイデア</h2><ol><li>顔出し不要で、売上に近い裏方の仕事を目指せる。</li><li>自分の商品がなくても、起業家のプロモーション支援で実績を作れる。</li><li>単体スキルではなく、売れる仕組み全体を理解する。</li><li>45日間の実践環境で、最初の成果に近づく。</li><li>地味で平凡な会社員の真面目さを、社長の右腕として活かす。</li></ol>${source("90_制作パッケージサンプル/02_リサーチシート.md")}</section>`}));

pages.set("offer.html", page({
  file: "offer.html",
  title: "オファーシート",
  eyebrow: "設計シート",
  lead: "本命商品の約束、提供内容、購入障壁、特典、限定性を確認します。",
  body: `<section class="panel"><h2>商品概要</h2><div class="grid-3">
${card("45日間WEBマーケター超実践ブートキャンプ", "商品名", "地味で平凡な会社員が、社長の右腕としてプロモーションを支えるWebマーケターになる実践環境。")}
${card("45日間", "期間", "短期集中で理解だけで終わらせず、実践へ進むための環境として売る。")}
${card("WEB直接販売", "販売方式", "個別説明会を挟まず、チャレンジ後にセールスページで直接販売する。")}
</div></section>
<section class="panel"><h2>購入障壁と解消策</h2><table class="asset-table"><thead><tr><th>障壁</th><th>解消策</th></tr></thead><tbody>
<tr><td>実績がない</td><td>最初の実績を作るための実践環境として打ち出す。</td></tr>
<tr><td>顔出しが苦手</td><td>裏方Webマーケターという立ち位置を提示する。</td></tr>
<tr><td>スキルが足りない</td><td>単体スキルより全体設計を学ぶと伝える。</td></tr>
<tr><td>価格への不安</td><td>将来の成果報酬、上流支援、右腕ポジションの価値で納得感を作る。</td></tr>
</tbody></table></section>
<section class="panel"><h2>正式確認が必要な項目</h2><ul><li>正式価格</li><li>分割払いの有無</li><li>サポート体制の詳細</li><li>返金保証の有無</li><li>PLC差額参加の正式条件</li></ul>${source("90_制作パッケージサンプル/03_オファーシート.md")}</section>`}));

pages.set("assets.html", page({
  file: "assets.html",
  title: "制作物一覧",
  eyebrow: "制作物",
  lead: "LP、配信、動画、課題、特典、販売素材を、制作物として確認します。",
  body: `<section class="panel"><h2>制作物カテゴリ</h2><div class="grid-3">
${sourceInventory().map(([label, count]) => card(label, `${count}件`, "原本MDとHTML確認ページをセットで管理します。")).join("")}
</div></section>
<section class="panel"><h2>制作物の入口</h2><table class="asset-table"><thead><tr><th>制作物</th><th>中身</th><th>確認</th></tr></thead><tbody>
<tr><td>LP/ページ</td><td>オプトインLP、サンキュー、セールスページ、購入完了ページ。</td><td><a href="lp.html">LP一覧</a></td></tr>
<tr><td>ヘッドデザイン</td><td>オプトインLPとセールスページのファーストビュー指示。</td><td><a href="head.html">ヘッド指示</a></td></tr>
<tr><td>メール/LINE</td><td>登録後メール、販売期メルマガ、公式LINE、オープンチャット。</td><td><a href="stepmail.html">メール</a> / <a href="line.html">LINE</a></td></tr>
<tr><td>動画/ライブ</td><td>挨拶動画、Day1〜Day5ライブ、課題、特典。</td><td><a href="script-opening.html">挨拶動画</a> / <a href="live-scripts.html">ライブ台本</a></td></tr>
<tr><td>販売</td><td>セールスページ原稿、販売期配信、購入完了ページ。</td><td><a href="sales-page.html">セールスページ</a></td></tr>
</tbody></table></section>`}));

pages.set("lp.html", page({
  file: "lp.html",
  title: "LP一覧",
  eyebrow: "制作物",
  lead: "登録ページ、サンキューページ、販売ページ、購入完了ページのURLと役割を確認します。",
  body: `<section class="panel"><h2>ページ台帳</h2><table class="asset-table"><thead><tr><th>ページ</th><th>役割</th><th>URL</th><th>原本</th></tr></thead><tbody>
<tr><td>オプトインLP</td><td>地味で平凡な会社員を5日間ライブへ登録させる入口。</td><td><a href="${urls.optin}">${urls.optin}</a></td><td>${source("02_オプトインLP/01_オプトページ_登録経路なし.md")}</td></tr>
<tr><td>動画視聴後LP</td><td>視聴後に登録意欲が高まった人向けの入口。</td><td><a href="${urls.optin}?ftid=b35oNFTBJXps">${urls.optin}?ftid=b35oNFTBJXps</a></td><td>${source("02_オプトインLP/02_オプトページ_動画視聴後LP.md")}</td></tr>
<tr><td>登録後サンキュー</td><td>オープンチャット参加を正式登録として促すページ。</td><td><a href="${urls.thanks}">${urls.thanks}</a></td><td>${source("03_サンキューページ/01_オプトイン後サンキューページ.md")}</td></tr>
<tr><td>セールスページ</td><td>45日間WEBマーケター超実践ブートキャンプを直接販売するページ。</td><td><a href="${urls.sales}">${urls.sales}</a></td><td>${source("06_セールス/01_セールスページ.md")}</td></tr>
<tr><td>購入完了ページ</td><td>決済後の案内と次アクションを伝えるページ。</td><td><a href="${urls.salesThanks}">${urls.salesThanks}</a></td><td>${source("06_セールス/02_購入完了サンキューページ.md")}</td></tr>
</tbody></table></section>
<section class="panel"><h2>オプトインLPのヘッド</h2><p class="quote">地味で平凡な会社員向け。才能・経験・顔出し不要の裏方起業のロードマップを公開。</p><p>登録導線はLINEオープンチャット参加までがセットです。メール登録だけで終わらせず、サンキューページと登録後メールで正式参加へ進めます。</p></section>
<section class="panel"><h2>オプトインLP書き起こし</h2><div class="full-source-list">
${sourceDetails("登録経路なしLP 本文", "02_オプトインLP/01_オプトページ_登録経路なし.md", 52000, true)}
${sourceDetails("動画視聴後LP 本文", "02_オプトインLP/02_オプトページ_動画視聴後LP.md", 36000)}
${sourceDetails("登録後サンキューページ 本文", "03_サンキューページ/01_オプトイン後サンキューページ.md", 26000)}
</div></section>`}));

pages.set("head.html", page({
  file: "head.html",
  title: "ヘッドデザイン指示書",
  eyebrow: "制作物",
  lead: "LPのファーストビューで何を見せるか、画像生成とHTML制作の指示をまとめます。",
  body: `<section class="panel"><h2>オプトインLPヘッド</h2><div class="grid-2">
${card("採用メッセージ", "Copy", "地味で平凡な会社員向け。才能・経験・顔出し不要の裏方起業のロードマップを公開。")}
${card("視覚方向", "Visual", "静かな作戦室、ノートPC、ファネル図、売上グラフ、チャット、設計資料。派手な自由人表現は避ける。")}
</div><div class="copy-box">地味で平凡な会社員が、表に立つ起業家ではなく、社長の右腕としてプロモーション戦略を支える世界観。ノートPC、ファネル図、売上グラフ、チャット画面、設計資料が並ぶ静かな作戦室。落ち着いた白とチャコール、信頼感のあるグリーン、アクセントに淡いゴールド。人物は背中や横顔程度で、顔出し不要の裏方感を出す。スマホでも文字が読みやすい余白を確保。</div></section>
<section class="panel"><h2>セールスページヘッド</h2><div class="grid-2">
${card("採用メッセージ", "Copy", "「実績がない」「顔出しは苦手」その真面目さが、あなたの可能性を止めているとしたら？")}
${card("HTML制作方針", "Layout", "商品名、対象者、変化の約束、CTA、締切をファーストビュー内に置く。スマホではCTAを1画面目下部に見せる。")}
</div>${source("90_制作パッケージサンプル/06_ヘッドデザイン指示書.md")}</section>`}));

pages.set("stepmail.html", page({
  file: "stepmail.html",
  title: "ステップメール",
  eyebrow: "制作物",
  lead: "登録直後メールと販売期メルマガを、タイミング、役割、CTA、原本抜粋まで確認します。",
  body: `<section class="panel"><h2>登録後ステップメール</h2><p class="note">目的は、メール登録で止まった人をLINEオープンチャットへ移動させ、正式参加を完了させることです。</p>${mailTable(registrationMails)}</section>
<section class="panel"><h2>販売期メルマガ</h2><p class="note">目的は、5日間ライブの熱量を切らさず、視聴期限、購入不安、実践環境の価値、締切を順番に伝えることです。</p>${mailTable(salesMails)}</section>
<section class="panel"><h2>制作上の読み方</h2><div class="grid-3">${card("登録直後", "入口", "正式参加がまだ完了していないと伝え、オープンチャット参加を最優先CTAにする。")}${card("不安解消", "販売", "高額投資に失敗した人へ、ノウハウではなく実践環境に価値があると伝える。")}${card("締切", "販売", "残り16時間、残り3時間など、具体的な時間で決断を促す。")}</div></section>`}));

pages.set("line.html", page({
  file: "line.html",
  title: "LINE/オープンチャット配信管理",
  eyebrow: "制作物",
  lead: "事務連絡、定期配信、Q&A、販売プッシュを分け、5日間チャレンジの運用を時系列で確認します。",
  body: `<section class="panel"><h2>チャネル構成</h2><div class="grid-4">
<div class="kpi"><span>固定ノート</span><strong>${fixedNotes.length}件</strong></div>
<div class="kpi"><span>計画配信</span><strong>${plannedSpots.length}件</strong></div>
<div class="kpi"><span>実ログ</span><strong>${logOnlySpots.length}件</strong></div>
<div class="kpi"><span>公式LINE</span><strong>${officialLines.length}通</strong></div>
</div></section>
<section class="panel"><h2>固定ノート</h2><div class="grid-3">${fixedNotes.map((note) => card(note.title, "固定ノート", note.excerpt)).join("")}</div></section>
<section class="panel"><h2>オープンチャット配信フェーズ</h2><table class="asset-table"><thead><tr><th>フェーズ</th><th>件数</th><th>役割</th></tr></thead><tbody>
<tr><td>ライブ前</td><td>${phaseCounts["ライブ前"] || 0}件</td><td>参加前の期待値形成、概要説明、ライブ参加リマインド。</td></tr>
<tr><td>価値提供中</td><td>${phaseCounts["価値提供中"] || 0}件</td><td>ライブリンク、課題、アーカイブ、質問回答、特典案内。</td></tr>
<tr><td>販売期</td><td>${phaseCounts["販売期"] || 0}件</td><td>販売開始、質問回答、実績共有、締切、終了案内。</td></tr>
<tr><td>実ログ</td><td>${phaseCounts["実ログ"] || 0}件</td><td>実際の補足投稿やリアルタイム運用の記録。</td></tr>
</tbody></table></section>
<section class="panel"><h2>スポット配信タイムライン</h2><details open><summary>計画配信の主要投稿を確認する</summary><div class="details-body">${mailTable(plannedSpots.filter((_, index) => index < 18))}</div></details><details><summary>全スポット配信タイトルを表示する</summary><div class="details-body"><table class="asset-table"><thead><tr><th>No</th><th>フェーズ</th><th>タイミング</th><th>タイトル</th><th>原本</th></tr></thead><tbody>${spots.map((spot, index) => `<tr><td>${index + 1}</td><td>${esc(spot.phase)}</td><td>${esc([spot.timing, spot.time].filter(Boolean).join(" / "))}</td><td>${esc(spot.title)}</td><td>${source(spot.relative)}</td></tr>`).join("")}</tbody></table></div></details></section>
<section class="panel"><h2>公式LINE販売期</h2>${mailTable(officialLines)}</section>
<section class="panel"><h2>運用の切り分け</h2><div class="grid-3">${card("事務連絡", "Notice", "開始時間、アーカイブURL、課題締切、リンク案内。ミスなく短く伝える。")}${card("配信コンテンツ", "Content", "教育、リマインド、販売プッシュ。コンセプトとオファーに沿って作り込む。")}${card("Q&A", "Feedback", "参加者の個別質問。次回改善やナレッジ抽出に使う。")}</div></section>`}));

pages.set("script-opening.html", page({
  file: "script-opening.html",
  title: "挨拶動画 台本",
  eyebrow: "制作物",
  lead: "オプトイン直後やサンキューページで使える、5日間チャレンジ参加前の導入動画台本です。",
  body: `<section class="panel"><h2>台本ドラフト</h2>
<div class="script-block"><span class="time">0:00-0:20</span><h3>冒頭フック</h3><p>「才能も、顔出しも、自分の商品もない。そんな地味で平凡な会社員こそ、WEBマーケターを目指してほしい。」</p></div>
<div class="script-block"><span class="time">0:20-1:10</span><h3>共感</h3><p>副業や起業に挑戦したい。でも、自分が前に出るのは苦手。SNSでキラキラ発信する自分も想像できない。そう感じているなら、この5日間はあなたのための内容です。</p></div>
<div class="script-block"><span class="time">1:10-2:10</span><h3>パラダイムシフト</h3><p>起業は、自分がスターになる道だけではありません。売上を支える人、導線を設計する人、社長の右腕としてプロモーションを動かす人にも、大きな価値があります。</p></div>
<div class="script-block"><span class="time">2:10-3:10</span><h3>5日間の約束</h3><p>この5日間で、売れる仕組みをD.E.C.O.D.E.として分解し、あなたが裏方Webマーケターとしてどこから始めればいいかを具体的に見せていきます。</p></div>
<div class="script-block"><span class="time">3:10-3:40</span><h3>CTA</h3><p>ライブリンク、課題、特典、質問回答はLINEオープンチャットで案内します。まだ参加していない方は、必ずこのページから参加してください。</p></div>
</section>
<section class="panel"><h2>本編VSL 書き起こし</h2><p class="note">LP原本内に取得済みの本編VSLを書き起こしとして展開します。挨拶動画やサンキューページ動画を作るときの素材として参照します。</p>
${sourceDetails("オプトインLP内 VSL/動画本文", "02_オプトインLP/01_オプトページ_登録経路なし.md", 52000, true)}
</section>
<section class="panel"><h2>制作意図</h2><div class="grid-3">${card("自己認識の変換", "Concept", "地味で平凡を弱みではなく、裏方の適性として再定義する。")}${card("正式参加への誘導", "CTA", "メール登録だけで終わらせず、オープンチャット参加へ進ませる。")}${card("Day1への橋渡し", "Flow", "Day1の世界観とD.E.C.O.D.E.全体像へ自然につなぐ。")}</div></section>`}));

pages.set("live-scripts.html", page({
  file: "live-scripts.html",
  title: "Day1〜Day5 ライブ台本",
  eyebrow: "制作物",
  lead: "5日間チャレンジの各ライブ台本を、目的、コア論点、課題、動画URL、原本パスで確認します。",
  body: `<section class="panel"><h2>5日間の教育設計</h2><div class="flow">${liveRows.map((row) => `<div class="flow-row"><strong>${esc(row.day)}</strong><p>${esc(row.title)}</p>${pills([row.core, row.task, `課題提出 ${row.count}`])}${status("原本あり")}</div>`).join("")}</div></section>
<section class="panel"><h2>各Dayの台本</h2><div class="timeline">${liveRows.map((row) => `<article class="timeline-item"><div class="timeline-index">${row.day.replace("Day", "D")}</div><div><div class="timeline-head"><strong>${esc(row.title)}</strong>${status(row.count)}</div><p>${esc(row.purpose)}</p><p class="muted">課題: ${esc(row.task)}</p><p class="cta-line">動画: <a href="${row.video}">${row.video}</a></p>${sourceDetails(`${row.day} ライブ台本全文`, row.script, 52000, row.day === "Day1")}${sourceDetails(`${row.day} 実録/動画書き起こし`, row.videoDoc, 36000)}</div></article>`).join("")}</div></section>
<section class="panel"><h2>共通のライブ構成</h2><ol><li>オープニング、前日課題へのフィードバック、安心安全な場づくり。</li><li>本編教育。ストーリー、図解、事例を使ってコア概念を伝える。</li><li>まとめ。当日の学びの核心を言語化する。</li><li>当日課題の提示。アウトプットと特典導線をつなぐ。</li><li>次回予告。Day5はブートキャンプ案内へ接続する。</li><li>Q&A。参加者の不安や具体質問を拾い、次の配信にも反映する。</li></ol></section>`}));

pages.set("sales-page.html", page({
  file: "sales-page.html",
  title: "セールスページ原稿",
  eyebrow: "制作物",
  lead: "45日間WEBマーケター超実践ブートキャンプの販売ページ構成を、実LPの書き起こしと制作指示として確認します。",
  body: `<section class="panel"><h2>公開ページ</h2><p>セールスページ: <a href="${urls.sales}">${urls.sales}</a></p><p>購入完了ページ: <a href="${urls.salesThanks}">${urls.salesThanks}</a></p>${source("06_セールス/01_セールスページ.md")}</section>
<section class="panel"><h2>逆生成したページ骨子</h2><table class="asset-table"><thead><tr><th>ブロック</th><th>役割</th><th>主要メッセージ</th></tr></thead><tbody>
<tr><td>ファーストビュー</td><td>対象者と緊急性</td><td>実績がない、顔出しが苦手。その真面目さが可能性を止めている。</td></tr>
<tr><td>問題提起</td><td>旧世界の破壊</td><td>ノウハウや努力ではなく、最初の実績を安全に作る場所がない。</td></tr>
<tr><td>解決策</td><td>新世界の提示</td><td>社長の右腕として、裏方から売上に関わる実践環境に入る。</td></tr>
<tr><td>商品説明</td><td>オファー</td><td>45日間WEBマーケター超実践ブートキャンプ。</td></tr>
<tr><td>締切</td><td>決断</td><td>期限を明示し、参加意思を前に進めるCTAを置く。</td></tr>
</tbody></table></section>
<section class="panel"><h2>ヘッド制作指示</h2><div class="copy-box">「実績がない」「顔出しは苦手」その真面目さが、あなたの可能性を止めているとしたら？\n\n45日間WEBマーケター超実践ブートキャンプ\n知識を増やすだけではなく、社長の右腕として売上に関わる最初の実践経験を作る45日間。</div></section>
<section class="panel"><h2>セールスレター全文</h2><p class="note">取得済みのセールスページ原本を、抜粋ではなくHTML上で読める本文として展開します。</p>
${sourceDetails("セールスページ原稿 本文", "06_セールス/01_セールスページ.md", 62000, true)}
</section>
<section class="panel"><h2>購入完了ページ</h2>
${sourceDetails("購入完了サンキューページ 本文", "06_セールス/02_購入完了サンキューページ.md", 30000, true)}
</section>`}));

pages.set("files.html", page({
  file: "files.html",
  title: "原本・MD管理",
  eyebrow: "制作物",
  lead: "HTMLで見せる制作物と、AIが参照する原本MDの保存場所を対応させます。",
  body: `<section class="panel"><h2>保存方針</h2><div class="grid-3">${card("HTML", "閲覧用", "ユーザーと田中祐一がブラウザで確認する見やすい制作ポータル。")}${card("MD", "原本/AI参照", "差し替えや追加学習のために、本文・URL・要約をMarkdownとして保存する。")}${card("公開URL", "共有用", "必要に応じてGitHub Pagesへ出し、制作物の完成イメージを共有する。")}</div></section>
<section class="panel"><h2>原本カテゴリ</h2><table class="asset-table"><thead><tr><th>カテゴリ</th><th>件数</th><th>主な保存場所</th></tr></thead><tbody>
${sourceInventory().map(([label, count]) => `<tr><td>${esc(label)}</td><td>${count}件</td><td>${source(label === "主要ページ" ? "02_オプトインLP/ / 03_サンキューページ/ / 06_セールス/" : label === "ライブ台本/動画" ? "04_価値提供/01_ライブシナリオ/ / 04_価値提供/02_ライブ動画/" : label === "課題/特典" ? "04_価値提供/03_課題/ / 21_特典/" : label === "オープンチャット" ? "11_オープンチャットメッセージ/" : "12_メルマガ/")}</td></tr>`).join("")}
</tbody></table></section>
<section class="panel"><h2>差し替え運用</h2><ol><li>原本MDまたは公開URLを差し替える。</li><li>田中祐一AIが差分を読み、対象ページを再生成する。</li><li>HTMLで表示確認し、公開URLで反映を確認する。</li><li>古い表示が消えたこと、リンク切れがないことを確認する。</li></ol></section>`}));

const allPages = [
  ...pages,
  ["portal.css", css],
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, content] of allPages) {
    const output = content.endsWith("\n") ? content : `${content}\n`;
    fs.writeFileSync(path.join(dir, file), output);
  }
}

console.log(`Generated ${pages.size} HTML pages and portal.css`);
console.log(`Public: ${publicDir}`);
console.log(`Mirror: ${mirrorDir}`);
