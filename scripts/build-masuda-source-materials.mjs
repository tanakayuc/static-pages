import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceRoot =
  "/Users/tanakayuichi/Projects/theleadpromotion/21_プロジェクト一覧/増田/ファネル/20260601_現状チャレンジファネル/ファネル";

const targets = [
  "masuda-5chere-funnel-analysis/visual",
  "masuda-5chere-funnel-analysis-versions/20260609-yesterday/visual",
  "masuda-5chere-funnel-analysis-versions/20260610-today/visual",
  "masuda-5chere-funnel-analysis-versions/20260609-source-materials/visual",
];

const primaryMaterials = [
  {
    title: "ファネル全体像",
    kind: "全体設計",
    actualUrl: "",
    sourceFile: "ファネル全体像.md",
    note: "公式動線、URL、原本ファイル対応表。",
  },
  {
    title: "オプトLP",
    kind: "LP",
    actualUrl: "https://sub.businessmiler.net/p/lUWzw7hAyY8T",
    sourceFile: "オプトLP_画面テキスト全文.md",
    note: "保存済みのLP画面テキスト全文。",
  },
  {
    title: "サンクス",
    kind: "LP",
    actualUrl: "https://sub.businessmiler.net/p/SQ6JP95koRrY",
    sourceFile: "サンクス_画面テキスト全文.md",
    note: "保存済みのサンキューページ画面テキスト全文。",
  },
  {
    title: "LINEオープンチャット",
    kind: "チャットログ",
    actualUrl:
      "https://drive.google.com/file/d/1aOwAKEZfNmBuCPZz3ed3HxVvMcp4lsur/view",
    sourceFile: "オプチャログ_全文.md",
    note: "オープンチャットログ全文。",
  },
  {
    title: "ライブ Day1",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1135741623/1eb542f667",
    sourceFile: "Day1_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "ライブ Day2",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1136076038/6cdf2c7562",
    sourceFile: "Day2_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "ライブ Day3",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1136076236/f272eefb18",
    sourceFile: "Day3_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "ライブ Day4",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1138289982/53c52b3d83",
    sourceFile: "Day4_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "ライブ Day5",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1138522531/eafcd09f6a",
    sourceFile: "Day5_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "追加セミナー1",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1146114715/f450fdf231",
    sourceFile: "追加セミナー1_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "追加セミナー2",
    kind: "動画書き起こし",
    actualUrl: "https://vimeo.com/1146270106/f629fd920b",
    sourceFile: "追加セミナー2_書き起こし.md",
    note: "Vimeo URLと書き起こし。",
  },
  {
    title: "ステップ配信一覧",
    kind: "メール/LINE",
    actualUrl:
      "https://docs.google.com/spreadsheets/d/1_AtOHYA93pDsIxBKnX-vNNep5k2vdEslIQqKVKOYyVs/edit",
    sourceFile: "ステップ配信/ステップメール・LINE_一覧.md",
    note: "媒体別の格納状況、本文あり/なしの確認表。",
  },
  {
    title: "ステップ配信MDフォルダ",
    kind: "メール/LINE",
    actualUrl:
      "https://drive.google.com/drive/folders/1GttWruYlE7-J9qwoh4Qfu4U9FWp5fuce",
    sourceFile: "ステップ配信/メール/00_配信設計と一覧.md",
    note: "メール配信の一覧。LINE配信は別カードから参照。",
  },
  {
    title: "LINE配信一覧",
    kind: "メール/LINE",
    actualUrl:
      "https://drive.google.com/drive/folders/1GttWruYlE7-J9qwoh4Qfu4U9FWp5fuce",
    sourceFile: "ステップ配信/LINE/00_配信設計と一覧.md",
    note: "LINE配信の一覧。",
  },
  {
    title: "個別誘導LP",
    kind: "LP",
    actualUrl: "https://sub.businessmiler.net/p/89fPLWiFZ9nk",
    sourceFile: "個別誘導LP_画面テキスト全文.md",
    note: "保存済みの個別説明会誘導LP画面テキスト全文。",
  },
  {
    title: "体験セミナー誘導LP",
    kind: "LP",
    actualUrl: "https://sub.businessmiler.net/p/Ch64fDop3YXo",
    sourceFile: "体験セミナー誘導LP_画面テキスト全文.md",
    note: "保存済みの体験セミナー誘導LP画面テキスト全文。",
  },
];

function listMarkdownFiles(dir, base = dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(fullPath, base);
      if (!entry.isFile() || !entry.name.endsWith(".md")) return [];
      return [path.relative(base, fullPath).split(path.sep).join("/")];
    })
    .sort((a, b) => a.localeCompare(b, "ja"));
}

function hrefFor(relativePath) {
  return `source/${relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

function categoryFor(relativePath) {
  if (relativePath.startsWith("ステップ配信/メール/")) return "ステップメール";
  if (relativePath.startsWith("ステップ配信/LINE/")) return "LINE配信";
  if (relativePath.includes("書き起こし")) return "動画書き起こし";
  if (relativePath.includes("LP") || relativePath.includes("サンクス")) return "LP/ページ本文";
  if (relativePath.includes("オプチャ")) return "チャットログ";
  return "主要素材";
}

function titleFromPath(relativePath) {
  return relativePath.replace(/\.md$/, "").split("/").pop();
}

function renderHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>原本素材集｜増田 W3EV 5日チャレ</title>
<style>
:root {
  --main: #2cb596;
  --sub: #189b7d;
  --bg: #f0faf8;
  --ink: #132033;
  --muted: #617870;
  --line: #cfe9e3;
  --soft: #e8f6f2;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", sans-serif;
  line-height: 1.78;
}
a { color: var(--sub); font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
a:hover { text-decoration: underline; }
.layout {
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  min-height: 100vh;
}
.side {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  padding: 24px 18px;
  background: #fff;
  border-right: 1px solid var(--line);
}
.brand {
  margin: 0 0 8px;
  font-size: 19px;
  line-height: 1.35;
}
.side p {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}
.navlink {
  display: block;
  padding: 9px 10px;
  margin: 2px 0;
  border-radius: 8px;
  color: #24364a;
  font-size: 13px;
  font-weight: 700;
}
.navlink:hover,
.navlink.active {
  background: var(--soft);
  color: var(--sub);
  text-decoration: none;
}
.main {
  min-width: 0;
  padding: 42px min(5vw, 64px) 80px;
}
.wrap { max-width: 1280px; margin: 0 auto; }
.eyebrow {
  margin: 0 0 10px;
  color: var(--sub);
  font-size: 13px;
  font-weight: 900;
}
h1 {
  margin: 0 0 14px;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.22;
  letter-spacing: 0;
}
.lead {
  max-width: 900px;
  margin: 0;
  color: #526760;
  font-size: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--sub);
  font-size: 14px;
  font-weight: 800;
}
.btn.primary {
  border-color: var(--main);
  background: var(--main);
  color: #fff;
}
.section {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.section h2 {
  margin: 0 0 14px;
  font-size: 24px;
  line-height: 1.35;
}
.url-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.url-table th,
.url-table td {
  padding: 10px 9px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.url-table th {
  color: var(--muted);
  font-size: 12px;
}
.pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--sub);
  font-size: 12px;
  font-weight: 800;
}
.material-grid {
  display: grid;
  grid-template-columns: minmax(220px, 340px) minmax(0, 1fr);
  gap: 18px;
}
.material-list {
  max-height: 72vh;
  overflow: auto;
  padding-right: 4px;
}
.material-button {
  width: 100%;
  margin: 0 0 8px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.material-button strong {
  display: block;
  font-size: 13px;
  line-height: 1.5;
}
.material-button span {
  display: block;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}
.material-button:hover,
.material-button.active {
  border-color: var(--main);
  background: var(--soft);
}
.viewer {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfffe;
}
.viewer-head {
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.viewer-head h3 {
  margin: 0 0 6px;
  font-size: 20px;
}
.viewer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
pre {
  margin: 0;
  padding: 18px;
  max-height: 72vh;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.75;
}
.all-files {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 10px;
}
.file-card {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfffe;
}
.file-card strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}
.file-card span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 900px) {
  .layout { display: block; }
  .side {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .material-grid { grid-template-columns: 1fr; }
  .main { padding: 28px 16px 56px; }
  .url-table { display: block; overflow-x: auto; }
}
</style>
</head>
<body>
<div class="layout">
  <aside class="side">
    <h2 class="brand">増田 W3EV<br>5日チャレ 原本素材集</h2>
    <p>LP・動画・メール・LINEの正本MDをそのまま確認できます。</p>
    <a class="navlink" href="#urls">URL対応表</a>
    <a class="navlink" href="#viewer">原本プレビュー</a>
    <a class="navlink" href="#files">保存済みMD一覧</a>
    <a class="navlink" href="../visual-report.html">ビジュアルレポートへ戻る</a>
    <a class="navlink" href="../20260608-6226ce734a1e.html">テキストレポートを開く</a>
  </aside>
  <main class="main">
    <div class="wrap">
      <p class="eyebrow">Source Materials / 2026-06-01 Funnel Snapshot</p>
      <h1>増田 W3EV 5日チャレ 原本素材集</h1>
      <p class="lead">このページは、分析レポートではなく素材台帳です。実際の公開URL、保存済み原本ファイル、LP本文・動画書き起こし・ステップメール/LINE本文を分けて確認できます。</p>
      <div class="toolbar">
        <a class="btn primary" href="../visual-report.html">ビジュアルレポートへ戻る</a>
        <a class="btn" href="../20260608-6226ce734a1e.html">テキストレポート</a>
        <a class="btn" href="#viewer">原本を読む</a>
      </div>

      <section id="urls" class="section">
        <h2>URL・保存済み原本対応表</h2>
        <table class="url-table">
          <thead>
            <tr>
              <th>素材</th>
              <th>種別</th>
              <th>実際URL</th>
              <th>保存済み原本</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody id="urlRows"></tbody>
        </table>
      </section>

      <section id="viewer" class="section">
        <h2>原本プレビュー</h2>
        <div class="material-grid">
          <div id="materialList" class="material-list" aria-label="素材一覧"></div>
          <article class="viewer">
            <div class="viewer-head">
              <h3 id="viewerTitle">読み込み中</h3>
              <div id="viewerMeta" class="viewer-meta"></div>
            </div>
            <pre id="viewerBody">素材を読み込んでいます...</pre>
          </article>
        </div>
      </section>

      <section id="files" class="section">
        <h2>保存済みMD一覧</h2>
        <div id="allFiles" class="all-files"></div>
      </section>
    </div>
  </main>
</div>
<script src="source-materials.js"></script>
<script>
const state = window.MASUDA_SOURCE_MATERIALS;
const urlRows = document.getElementById("urlRows");
const materialList = document.getElementById("materialList");
const allFiles = document.getElementById("allFiles");
const viewerTitle = document.getElementById("viewerTitle");
const viewerMeta = document.getElementById("viewerMeta");
const viewerBody = document.getElementById("viewerBody");
const primaryByFile = new Map(state.primary.map((item) => [item.sourceFile, item]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linkOrDash(url, label) {
  if (!url) return "保存ファイル参照";
  return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' + escapeHtml(label) + "</a>";
}

urlRows.innerHTML = state.primary.map((item) => {
  return '<tr>' +
    '<td><strong>' + escapeHtml(item.title) + '</strong></td>' +
    '<td><span class="pill">' + escapeHtml(item.kind) + '</span></td>' +
    '<td>' + linkOrDash(item.actualUrl, item.actualUrl || "保存ファイル") + '</td>' +
    '<td><a href="' + escapeHtml(item.href) + '" target="_blank" rel="noopener">' + escapeHtml(item.sourceFile) + '</a></td>' +
    '<td>' + escapeHtml(item.note) + '</td>' +
  '</tr>';
}).join("");

function renderMaterialButtons() {
  materialList.innerHTML = state.files.map((file, index) => {
    const primary = primaryByFile.get(file.path);
    const title = primary ? primary.title : file.title;
    return '<button class="material-button" type="button" data-index="' + index + '">' +
      '<strong>' + escapeHtml(title) + '</strong>' +
      '<span>' + escapeHtml(file.category) + ' / ' + escapeHtml(file.path) + '</span>' +
    '</button>';
  }).join("");

  materialList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => loadFile(Number(button.dataset.index)));
  });
}

function renderAllFiles() {
  allFiles.innerHTML = state.files.map((file, index) => {
    return '<article class="file-card">' +
      '<strong>' + escapeHtml(file.title) + '</strong>' +
      '<span>' + escapeHtml(file.category) + '</span><br>' +
      '<a href="' + escapeHtml(file.href) + '" target="_blank" rel="noopener">原本MDを開く</a> / ' +
      '<a href="#viewer" data-index="' + index + '">このページで読む</a>' +
    '</article>';
  }).join("");
  allFiles.querySelectorAll("[data-index]").forEach((link) => {
    link.addEventListener("click", (event) => {
      loadFile(Number(event.currentTarget.dataset.index));
    });
  });
}

async function loadFile(index) {
  const file = state.files[index];
  const primary = primaryByFile.get(file.path);
  viewerTitle.textContent = primary ? primary.title : file.title;
  viewerMeta.innerHTML = [
    '<span class="pill">' + escapeHtml(file.category) + '</span>',
    '<span>' + escapeHtml(file.path) + '</span>',
    primary && primary.actualUrl
      ? '<a href="' + escapeHtml(primary.actualUrl) + '" target="_blank" rel="noopener">実際URL</a>'
      : "",
    '<a href="' + escapeHtml(file.href) + '" target="_blank" rel="noopener">原本MD</a>',
  ].filter(Boolean).join("");

  materialList.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.index) === index);
  });

  viewerBody.textContent = "読み込んでいます...";
  try {
    const response = await fetch(file.href);
    if (!response.ok) throw new Error("HTTP " + response.status);
    viewerBody.textContent = await response.text();
  } catch (error) {
    viewerBody.textContent = "原本ファイルを読み込めませんでした: " + error.message;
  }
}

renderMaterialButtons();
renderAllFiles();
loadFile(0);
</script>
</body>
</html>`;
}

function buildManifest(allFiles) {
  const files = allFiles.map((relativePath) => ({
    path: relativePath,
    title: titleFromPath(relativePath),
    category: categoryFor(relativePath),
    href: hrefFor(relativePath),
  }));

  const primary = primaryMaterials.map((item) => ({
    ...item,
    href: hrefFor(item.sourceFile),
  }));

  return `window.MASUDA_SOURCE_MATERIALS = ${JSON.stringify(
    { primary, files },
    null,
    2,
  )};\n`;
}

function copySourceTo(targetDir) {
  const sourceTarget = path.join(targetDir, "source");
  fs.rmSync(sourceTarget, { recursive: true, force: true });
  for (const relativePath of allFiles) {
    const from = path.join(sourceRoot, relativePath);
    const to = path.join(sourceTarget, relativePath);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function ensureVersionIndex(versionRoot) {
  const indexPath = path.join(versionRoot, "index.html");
  if (fs.existsSync(indexPath)) return;
  fs.writeFileSync(
    indexPath,
    `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>増田 W3EV 5日チャレ 原本素材集</title>
<meta http-equiv="refresh" content="0; url=visual/materials.html">
</head>
<body>
<p><a href="visual/materials.html">原本素材集を開く</a></p>
</body>
</html>
`,
  );
}

const allFiles = listMarkdownFiles(sourceRoot);
const manifest = buildManifest(allFiles);
const html = renderHtml();

for (const target of targets) {
  const targetDir = path.join(repoRoot, target);
  fs.mkdirSync(targetDir, { recursive: true });
  copySourceTo(targetDir);
  fs.writeFileSync(path.join(targetDir, "source-materials.js"), manifest);
  fs.writeFileSync(path.join(targetDir, "materials.html"), html);

  if (target.includes("20260609-source-materials")) {
    ensureVersionIndex(path.dirname(targetDir));
  }
}

console.log(`Built Masuda source materials for ${targets.length} targets.`);
console.log(`Copied ${allFiles.length} markdown files per target.`);
