#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const publicBaseArg = process.argv.find((arg) => arg.startsWith("--public-base="));
const publicBase = publicBaseArg?.split("=").slice(1).join("=");

const requiredPages = [
  "index.html",
  "visual-report.html",
  "roadmap.html",
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
  "挨拶動画",
  "サンキュー動画",
  "オプト後VSL",
];

const contentChecks = [
  ["index.html", "制作ポータル"],
  ["index.html", "主導線"],
  ["index.html", "新規制作モードは工程表を基準"],
  ["index.html", "期間限定セールスレター"],
  ["index.html", "制作モード"],
  ["index.html", "一気通貫モード"],
  ["index.html", "個別制作モード"],
  ["roadmap.html", "工程表の使い方"],
  ["roadmap.html", "ワンステップ販売型"],
  ["roadmap.html", "9章の詳細工程"],
  ["roadmap.html", "項目"],
  ["roadmap.html", "作るもの"],
  ["roadmap.html", "入力/確認"],
  ["roadmap.html", "完成アウトプット"],
  ["roadmap.html", "目的意識を明確にする"],
  ["roadmap.html", "販売したい商品を決める"],
  ["roadmap.html", "販売ファネルを決める"],
  ["roadmap.html", "VSL配置を選択する"],
  ["roadmap.html", "オプトインVSL"],
  ["roadmap.html", "オプトイン後VSL"],
  ["roadmap.html", "5分前後"],
  ["roadmap.html", "5〜10分"],
  ["roadmap.html", "VSL台本/CTA設計"],
  ["roadmap.html", "KPI仮設定"],
  ["roadmap.html", "2. リサーチ/コンセプト設計"],
  ["roadmap.html", "ターゲットシート作成"],
  ["roadmap.html", "ライバル情報の整理"],
  ["roadmap.html", "空いている訴求の特定"],
  ["roadmap.html", "3. オファー設計"],
  ["roadmap.html", "商品オファーシート"],
  ["roadmap.html", "サポート期間"],
  ["roadmap.html", "4. コンテンツ設計"],
  ["roadmap.html", "全体カリキュラム"],
  ["roadmap.html", "Day別テーマ"],
  ["roadmap.html", "コアシナリオ"],
  ["roadmap.html", "ワーク/特典案"],
  ["roadmap.html", "5. オプトイン開始セット"],
  ["roadmap.html", "オプトインLP原稿"],
  ["roadmap.html", "サンキューページ原稿"],
  ["roadmap.html", "6. 配信導線"],
  ["roadmap.html", "オープンチャット固定投稿"],
  ["roadmap.html", "メルマガ件名と配信タイミング"],
  ["roadmap.html", "7. 台本制作"],
  ["roadmap.html", "Day1〜Day5ライブ台本"],
  ["roadmap.html", "8. 販売導線"],
  ["roadmap.html", "セールスレター"],
  ["roadmap.html", "9. 公開/改善"],
  ["roadmap.html", "公開URL台帳"],
  ["roadmap.html", "MD原本保存"],
  ["roadmap.html", "セールスレター販売"],
  ["roadmap.html", "全体スケジュール"],
  ["concept.html", "田中祐一AIのコンセプト設計フロー"],
  ["concept.html", "プロダクト理解"],
  ["concept.html", "ターゲット仮止め"],
  ["concept.html", "ライバル理解"],
  ["concept.html", "3C分析"],
  ["concept.html", "空きポジション"],
  ["concept.html", "コンテンツホルダー側の強み"],
  ["concept.html", "旧世界 / 新世界"],
  ["concept.html", "勘違い"],
  ["concept.html", "真の原因"],
  ["concept.html", "解決策"],
  ["concept.html", "ストーリー"],
  ["concept.html", "ベネフィット"],
  ["concept.html", "ミッション"],
  ["concept.html", "パラダイムシフトトーク"],
  ["concept.html", "コアシナリオ"],
  ["concept.html", "今回の採用コンセプト"],
  ["concept.html", "旧世界と新世界"],
  ["profile.html", "講師プロフィール"],
  ["profile.html", "株式会社ザ・リード 創業者"],
  ["profile.html", "仲間とともに成長して「全員で勝つ!」"],
  ["config.html", "制作判断の基本コンフィグ"],
  ["config.html", "避ける表現"],
  ["config.html", "誰でも簡単"],
  ["research.html", "空きポジション"],
  ["research.html", "ターゲットが見ているライバル"],
  ["research.html", "リサーチはコンセプトの前半戦"],
  ["research.html", "リサーチの順番"],
  ["research.html", "同業ライバルリサーチ"],
  ["research.html", "YCS 横山直宏さん"],
  ["research.html", "YouTubeマーケターおさるさん"],
  ["research.html", "仙道達也さん"],
  ["research.html", "北野哲正さん"],
  ["research.html", "才流（サイル）"],
  ["research.html", "BtoB支援会社"],
  ["research.html", "書籍・メディア"],
  ["research.html", "Instagram"],
  ["research.html", "YouTube"],
  ["research.html", "ホームページ"],
  ["research.html", "リサーチの切り口"],
  ["research.html", "コンセプトへの示唆"],
  ["research.html", "書籍から取り込むリサーチ原則"],
  ["research.html", "プロダクト競合"],
  ["research.html", "インサイト競合"],
  ["research.html", "メソッド競合"],
  ["research.html", "戦うより棲み分ける"],
  ["research.html", "ユニークベネフィット"],
  ["research.html", "アドバンテージ"],
  ["research.html", "空きポジション分析ロジック"],
  ["research.html", "ライバルの強訴求"],
  ["research.html", "ついていけない人"],
  ["research.html", "探している別手段"],
  ["research.html", "コンテンツホルダー価値"],
  ["research.html", "強み判定"],
  ["research.html", "空きポジション分析結果"],
  ["research.html", "3C分析"],
  ["research.html", "ライバルが取りこぼしている顧客"],
  ["research.html", "ずらし方"],
  ["research.html", "ターゲットの感情"],
  ["research.html", "LP/動画に使う論点"],
  ["offer.html", "商品名"],
  ["offer.html", "1. 何を提供するのか"],
  ["offer.html", "2. それがいくらなのか"],
  ["offer.html", "メインプログラム"],
  ["offer.html", "実践環境"],
  ["offer.html", "サポート"],
  ["offer.html", "特典"],
  ["offer.html", "返金保証"],
  ["offer.html", "実践コース"],
  ["offer.html", "69,800円（税込）"],
  ["offer.html", "見るだけプラン"],
  ["offer.html", "教材プラン"],
  ["offer.html", "49,800円（税込）"],
  ["offer.html", "5日間チャレンジ プロモーション素材一式"],
  ["offer.html", "ナレハブ6か月無料"],
  ["offer.html", "PLC差額参加の権利"],
  ["offer.html", "返金保証なし"],
  ["head.html", "セールスページヘッド"],
  ["assets.html", "制作フローの見方"],
  ["assets.html", "「宴」1期制作モニター"],
  ["assets.html", "工程別制作フロー"],
  ["assets.html", "工程順に作る"],
  ["assets.html", "VSL配置を先に選ぶ"],
  ["assets.html", "原稿とデザイン指示書"],
  ["assets.html", "実装/組み込み"],
  ["assets.html", "田中祐一AI側の一区切り"],
  ["assets.html", "次の作業領域"],
  ["assets.html", "添削モード"],
  ["assets.html", "LP実装や細部デザイン"],
  ["assets.html", "サンキューページ"],
  ["assets.html", "章別制作素材集"],
  ["assets.html", "2. リサーチ/コンセプト"],
  ["assets.html", "5. オプトイン開始セット"],
  ["assets.html", "8. 販売導線"],
  ["assets.html", "https://sub.the-lead10.com/p/webmarketer_thanks"],
  ["visual-report.html", "ワンステップ販売型の必須素材"],
  ["visual-report.html", "今回のファネルの形"],
  ["visual-report.html", "見込み客が実際に見るページ、LINE、ライブ、レターだけ"],
  ["visual-report.html", "チャレンジローンチ / ワンステップ販売"],
  ["visual-report.html", "VSL配置の選択"],
  ["visual-report.html", "オプトインVSL"],
  ["visual-report.html", "オプトイン後VSL"],
  ["visual-report.html", "ビデオセールスレター"],
  ["visual-report.html", "遅延CTA"],
  ["visual-report.html", "KPIの見方"],
  ["visual-report.html", "OC参加率 / Day1着席率"],
  ["visual-report.html", "仮売上"],
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
  ["lp.html", "VSL配置方針"],
  ["lp.html", "オプトインVSL"],
  ["lp.html", "オプトイン後VSL"],
  ["lp.html", "5分前後"],
  ["lp.html", "遅延CTA"],
  ["lp.html", "オプトイン開始4点確認"],
  ["lp.html", "登録直後メール実素材"],
  ["lp.html", "オプトインLP書き起こし"],
  ["lp.html", "才能・経験・顔出し不要"],
  ["lp.html", "オプトイン自動返信メール"],
  ["script-opening.html", "本編VSL 書き起こし"],
  ["script-opening.html", "VSL配置の前提"],
  ["script-opening.html", "VSL台本"],
  ["script-opening.html", "オプトインVSL"],
  ["script-opening.html", "オプトイン後VSL"],
  ["script-opening.html", "5〜10分"],
  ["script-opening.html", "ビデオセールスレター"],
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
  if (!html.includes('<meta name="robots" content="noindex, nofollow, noarchive">')) fail(`${file} missing robots noindex`);
  if (!html.includes('<meta name="googlebot" content="noindex, nofollow, noarchive">')) fail(`${file} missing googlebot noindex`);
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

for (const file of ["concept.html", "profile.html", "config.html", "research.html", "offer.html"]) {
  if (read(file).includes("source-path")) fail(`${file} should not expose source paths`);
}
for (const snippet of ["決済後の流れ", "決済確認", "Chatwork申請", "グループ参加", "価格戦略"]) {
  if (read("offer.html").includes(snippet)) fail(`offer.html should not include ${snippet}`);
}
for (const snippet of ["一気通貫モードと個別制作モード", "個別制作物", "<th>確認先</th>"]) {
  if (read("roadmap.html").includes(snippet)) fail(`roadmap.html should not include ${snippet}`);
}

const roadmapPhaseSections = (read("roadmap.html").match(/id="phase-[0-9]"/g) || []).length;
if (roadmapPhaseSections !== 9) fail(`roadmap phase sections expected 9, got ${roadmapPhaseSections}`);

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
