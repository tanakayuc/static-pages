#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outDir = path.join(repoRoot, "web-marketer-road-creation-portal");

const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full;
  });
}

function rel(file) {
  return path.relative(repoRoot, file);
}

function addFailure(file, label, match) {
  failures.push(`${rel(file)}: ${label}: ${String(match).slice(0, 160)}`);
}

function extractSection(text, phaseNumber) {
  const marker = `id="phase-${phaseNumber}"`;
  const start = text.indexOf(marker);
  if (start < 0) return "";
  const next = text.indexOf(`id="phase-${phaseNumber + 1}"`, start + marker.length);
  return text.slice(start, next < 0 ? text.length : next);
}

function extractHeadings(text) {
  return Array.from(text.matchAll(/<h3>(.*?)<\/h3>/g)).map((match) => match[1]);
}

function assertSameList(file, label, actual, expected) {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    addFailure(file, label, `${actual.join(" / ")} expected ${expected.join(" / ")}`);
  }
}

if (!fs.existsSync(outDir)) {
  console.error(`[portal-check] missing output dir: ${outDir}`);
  process.exit(1);
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith(".html"));
const htmlSet = new Set(htmlFiles.map((file) => path.relative(outDir, file)));

const globalBans = [
  ["source/meta", /取得元|参照元|出典|関連:|該当LP|該当URL|実URL|ページURL|元データ|relation_elements|実ページスクリーンショット|実ページ|スクリーンショット PDF|OCR|元PDF|保存PDF|処理日|処理範囲|処理モード|完成URL|完成済みURL|元URL/g],
  ["completed-url", /https:\/\/sub\.the-lead10|https?:\/\/utage|https?:\/\/.*the-lead10/g],
  ["old-copy-flow", /全体設計メモ|コピーしてAIに貼る|プロンプトをコピー|Claude\/ChatGPT\/Geminiに貼る|現在のWebテスト版では/g],
  ["old-mode-switch", /添削モードへ切り替える|添削準備|添削観点/g],
  ["external-ai-handoff", /ChatGPTやCodeX|ChatGPTやCodex|CodeX等|Codex等|Claude\/HTML制作向け指示|Claude向け指示/g],
  ["wrong-value-mail", /価値提供中メール|価値提供メール/g],
];

const actualDatePattern =
  /20\d{2}-[0-9]{1,2}-[0-9]{1,2}|20\d{2}[/.][0-9]{1,2}[/.][0-9]{1,2}|[0-9０-９]{1,2}月[0-9０-９]{1,2}日|(?<!\d)[0-9０-９]{1,2}\/[0-9０-９]{1,2}(?:[（(][^)）]+[)）])?/g;
const approvedScheduleDates = new Set(["8月21日", "9月4日", "9月7日", "9月9日", "9月12日", "9月14日", "9月19日"]);

const roadmapBans = [
  ["roadmap-step-label", /Step [0-9]/g],
  ["roadmap-open-link", />開く</g],
  ["roadmap-here-label", />ここ</g],
  ["roadmap-other-model", /2ステップ|ツーステップ|説明会ページ|個別説明会|セミナー販売/g],
  ["roadmap-knowledge-leak", /ナレッジ|選択候補|パターン説明/g],
];

const expectedChapterOneTitles = [
  "販売したい商品を決める",
  "販売ファネルを決める",
  "販売モデルを決める",
  "目標KPIの設定",
];

const expectedChapterFourStartTitles = [
  "教育グループを決める",
  "チャレンジ日数・ライブ回数を決める",
];

const retiredChapterOneTitles = [
  "目的意識を明確にする",
  "ライブ回数を決める",
];

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const [label, pattern] of globalBans) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) addFailure(file, label, match[0]);
  }

  for (const match of text.matchAll(actualDatePattern)) {
    const value = match[0];
    const start = Math.max(0, match.index - 20);
    const end = Math.min(text.length, match.index + value.length + 20);
    const context = text.slice(start, end);
    if (value === "1月23日" && /生まれ|プロフィール|Profile/.test(context)) continue;
    if (path.basename(file) === "visual-report.html" && approvedScheduleDates.has(value)) continue;
    addFailure(file, "actual-date", value);
    break;
  }

  if (path.basename(file) === "roadmap.html") {
    for (const [label, pattern] of roadmapBans) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) addFailure(file, label, match[0]);
    }

    const chapterOneTitles = extractHeadings(extractSection(text, 1));
    const chapterFourStartTitles = extractHeadings(extractSection(text, 4)).slice(0, 2);
    assertSameList(file, "roadmap-chapter-one-contract", chapterOneTitles, expectedChapterOneTitles);
    assertSameList(file, "roadmap-chapter-four-start-contract", chapterFourStartTitles, expectedChapterFourStartTitles);
    for (const title of retiredChapterOneTitles) {
      if (text.includes(`<h3>${title}</h3>`)) addFailure(file, "retired-roadmap-step", title);
    }
  }

  for (const match of text.matchAll(/\bhref=["']([^"']+)["']/g)) {
    const href = match[1];
    if (
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      continue;
    }
    const [hrefWithoutHash] = href.split("#");
    const [hrefPath] = hrefWithoutHash.split("?");
    if (!hrefPath || hrefPath === ".") continue;
    const ext = path.extname(hrefPath);
    if (ext && ext !== ".html") continue;
    const target = path.normalize(path.join(path.dirname(path.relative(outDir, file)), hrefPath));
    if (!htmlSet.has(target)) {
      addFailure(file, "broken-local-href", href);
    }
  }
}

for (const retired of ["stepmail.html", "value-mails.html"]) {
  if (fs.existsSync(path.join(outDir, retired))) {
    failures.push(`web-marketer-road-creation-portal/${retired}: retired file still exists`);
  }
}

for (const file of htmlFiles) {
  const base = path.basename(file);
  if (/^value-mail.*\.html$/.test(base)) {
    failures.push(`${rel(file)}: retired value mail page still exists`);
  }
}

if (failures.length) {
  console.error(`[portal-check] ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 120)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 120) {
    console.error(`...and ${failures.length - 120} more`);
  }
  process.exit(1);
}

console.log(`[portal-check] OK: ${htmlFiles.length} HTML files checked`);
