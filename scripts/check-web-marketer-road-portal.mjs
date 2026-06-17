#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const publicBaseArg = process.argv.find((arg) => arg.startsWith("--public-base="));
const publicBase = publicBaseArg?.split("=").slice(1).join("=");

const requiredPages = [
  "index.html",
  "visual-report.html",
  "text-report.html",
  "roadmap.html",
  "kpi.html",
  "sheets.html",
  "concept.html",
  "profile.html",
  "config.html",
  "research.html",
  "offer.html",
  "assets.html",
  "lp.html",
  "head.html",
  "stepmail.html",
  "line.html",
  "script-opening.html",
  "live-scripts.html",
  "sales-page.html",
  "files.html",
];

const forbidden = [
  "田中祐一OS",
  "TanakaKnowledgeOS",
  "ナレッジOS",
  "第1層",
  "第2層",
  "第3層",
  "作業指示",
  "内部検討",
  "テキストレポート対応",
  "関連レポート一覧",
  "hierarchy.html",
];

const contentChecks = [
  ["index.html", "田中祐一様の制作パッケージ"],
  ["roadmap.html", "9工程"],
  ["concept.html", "旧世界と新世界"],
  ["research.html", "空きポジション"],
  ["offer.html", "購入障壁"],
  ["head.html", "セールスページヘッド"],
  ["stepmail.html", "高額投資に失敗してきたあなたへ"],
  ["stepmail.html", "CTA:"],
  ["line.html", "計画配信"],
  ["line.html", "73件"],
  ["line.html", "実ログ"],
  ["line.html", "全スポット配信タイトル"],
  ["live-scripts.html", "課題提出 91件"],
  ["live-scripts.html", "https://youtu.be/3F5T-slajMQ"],
  ["lp.html", "オプトインLP書き起こし"],
  ["lp.html", "才能・経験・顔出し不要"],
  ["script-opening.html", "本編VSL 書き起こし"],
  ["live-scripts.html", "Day1 ライブ台本全文"],
  ["live-scripts.html", "実録/動画書き起こし"],
  ["sales-page.html", "セールスレター全文"],
  ["sales-page.html", "申し込み期限は9月21日（日）"],
  ["files.html", "差し替え運用"],
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const file of requiredPages) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) fail(`${file} missing`);
}
if (fs.existsSync(path.join(root, "hierarchy.html"))) fail("hierarchy.html should not exist");

for (const file of requiredPages) {
  const html = read(file);
  if (!html.includes('class="side"')) fail(`${file} missing sidebar`);
  if (!html.includes("田中祐一AI")) fail(`${file} missing brand name`);
  for (const word of forbidden) {
    if (html.includes(word)) fail(`${file} contains forbidden term: ${word}`);
  }
}

const css = fs.readFileSync(path.join(root, "portal.css"), "utf8");
for (const color of ["#2CB596", "#189B7D", "#F0FAF8"]) {
  if (!css.includes(color)) fail(`portal.css missing color ${color}`);
}
if (!css.includes("overflow-x: auto")) fail("portal.css missing mobile horizontal nav");

for (const [file, snippet] of contentChecks) {
  const ok = read(file).includes(snippet);
  if (!ok) fail(`${file} missing content: ${snippet}`);
}

const roadmapRows = (read("roadmap.html").match(/class="flow-row"/g) || []).length;
if (roadmapRows !== 9) fail(`roadmap rows expected 9, got ${roadmapRows}`);

for (const file of requiredPages) {
  const html = read(file);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) continue;
    const local = href.split(/[?#]/)[0];
    if (!local || local === "portal.css") continue;
    if (!fs.existsSync(path.join(root, local))) fail(`${file} has broken local link: ${href}`);
  }
}

async function checkPublic() {
  if (!publicBase) return;
  const base = publicBase.replace(/\/$/, "");
  for (const file of ["index.html", "roadmap.html", "stepmail.html", "line.html", "live-scripts.html", "sales-page.html"]) {
    const res = await fetch(`${base}/${file}`);
    if (!res.ok) fail(`public ${file} returned ${res.status}`);
  }
  const old = await fetch(`${base}/hierarchy.html`);
  if (old.status !== 404) fail(`public hierarchy.html should be 404, got ${old.status}`);
}

await checkPublic();

if (!process.exitCode) pass("WEB_MARKETER_ROAD_PORTAL_CHECK");
