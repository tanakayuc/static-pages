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
  "逆生成",
  "ページ骨子",
  "オプトインLPに掲載されている講師プロフィール",
  "そのまま制作ポータルへ反映",
];

const contentChecks = [
  ["index.html", "田中祐一様の制作パッケージ"],
  ["index.html", "期間限定セールスレター"],
  ["roadmap.html", "全体設計で見る5素材"],
  ["roadmap.html", "ワンステップ販売型"],
  ["roadmap.html", "詳細設計で追加された素材"],
  ["roadmap.html", "セールスレター販売"],
  ["roadmap.html", "コンテンツ本数表"],
  ["roadmap.html", "チャレンジ項目一覧"],
  ["roadmap.html", "全体スケジュール"],
  ["concept.html", "コンセプト設計の前提"],
  ["concept.html", "ライバルリサーチ"],
  ["concept.html", "ポジショニング分析"],
  ["concept.html", "総評"],
  ["concept.html", "ノウハウ"],
  ["concept.html", "ベネフィット"],
  ["concept.html", "キーワード"],
  ["concept.html", "パラダイムシフトを起こすための材料"],
  ["concept.html", "旧世界と新世界"],
  ["profile.html", "講師プロフィール"],
  ["profile.html", "株式会社ザ・リード 創業者"],
  ["profile.html", "仲間とともに成長して「全員で勝つ!」"],
  ["config.html", "制作判断の基本コンフィグ"],
  ["config.html", "避ける表現"],
  ["config.html", "誰でも簡単"],
  ["research.html", "空きポジション"],
  ["offer.html", "購入障壁"],
  ["head.html", "セールスページヘッド"],
  ["assets.html", "サンキューページ"],
  ["assets.html", "https://sub.the-lead10.com/p/webmarketer_thanks"],
  ["visual-report.html", "ワンステップ販売型の必須素材"],
  ["visual-report.html", "オープンチャット"],
  ["visual-report.html", "公式LINE内で期間限定セールスレター"],
  ["visual-report.html", "詳細設計で追加された素材"],
  ["visual-report.html", "制作ボリューム"],
  ["visual-report.html", "チャレンジ課題"],
  ["visual-report.html", "全体スケジュール"],
  ["stepmail.html", "高額投資に失敗してきたあなたへ"],
  ["stepmail.html", "CTA:"],
  ["stepmail.html", "オプトイン自動返信メール"],
  ["stepmail.html", "トップに戻る"],
  ["stepmail.html", "ステップメール全体像"],
  ["stepmail.html", "目的別"],
  ["stepmail.html", "メール一覧"],
  ["stepmail.html", "href=\"#mail-"],
  ["stepmail.html", "9月20日 / 20時"],
  ["stepmail.html", "入口接続"],
  ["stepmail.html", "価値提供接続"],
  ["stepmail.html", "不安解消"],
  ["line.html", "計画配信"],
  ["line.html", "73件"],
  ["line.html", "実ログ"],
  ["line.html", "LINE全体ポータル"],
  ["line.html", "全体ポータル"],
  ["line.html", "固定投稿"],
  ["line.html", "通常配信"],
  ["line.html", "href=\"#line-normal-"],
  ["line.html", "全スポット配信タイトル"],
  ["line.html", "Day5で公式LINE登録"],
  ["line.html", "公式LINE内で期間限定レター公開"],
  ["live-scripts.html", "課題提出 91件"],
  ["live-scripts.html", "https://youtu.be/3F5T-slajMQ"],
  ["lp.html", "オプトイン開始セット"],
  ["lp.html", "オプトイン開始4点確認"],
  ["lp.html", "登録直後メール実素材"],
  ["lp.html", "オプトインLP書き起こし"],
  ["lp.html", "才能・経験・顔出し不要"],
  ["lp.html", "オプトイン自動返信メール"],
  ["script-opening.html", "本編VSL 書き起こし"],
  ["live-scripts.html", "Day1 ライブ台本全文"],
  ["live-scripts.html", "実録/動画書き起こし"],
  ["sales-page.html", "公式LINE内で期間限定公開"],
  ["sales-page.html", "セールスページ情報"],
  ["sales-page.html", "セールスレター全文"],
  ["sales-page.html", "ヘッド作成用プロンプト"],
  ["sales-page.html", "購入完了ページ"],
  ["sales-page.html", "販売導線の素材対応"],
  ["sales-page.html", "販売期メルマガ実素材"],
  ["sales-page.html", "販売期公式LINE実素材"],
  ["sales-page.html", "販売期配信"],
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

for (const file of fs.readdirSync(root).filter((name) => /\.(md|txt)$/i.test(name))) {
  const text = read(file);
  for (const word of forbidden) {
    if (text.includes(word)) fail(`${file} contains forbidden term: ${word}`);
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

const roadmapPhaseRows = (read("roadmap.html").match(/<td><strong>[0-9]\./g) || []).length;
if (roadmapPhaseRows !== 9) fail(`roadmap phase rows expected 9, got ${roadmapPhaseRows}`);

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
