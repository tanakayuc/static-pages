#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const publicBaseArg = process.argv.find((arg) => arg.startsWith("--public-base="));
const publicBase = publicBaseArg?.split("=").slice(1).join("=");
const deprecatedOptAfterVsl = "オプトイン後" + "VSL";

const requiredPages = [
  "index.html",
  "visual-report.html",
  "roadmap.html",
  "sheets.html",
  "target.html",
  "concept.html",
  "profile.html",
  "config.html",
  "research.html",
  "offer.html",
  "assets.html",
  "lp.html",
  "value.html",
  "head.html",
  "stepmail.html",
  "line.html",
  "script-opening.html",
  "live-scripts.html",
  "sales-page.html",
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
  "書き起こし",
  "実素材",
  "公開URL台帳",
  "ページ骨子",
  "オプトインLPに掲載されている講師プロフィール",
  "そのまま制作ポータルへ反映",
  "挨拶動画",
  "サンキュー動画",
  "オプトインVSL",
  "集客レイヤー",
  "販売レイヤー",
  "個別説明会",
  "一気通貫モード",
  "個別制作モード",
  deprecatedOptAfterVsl,
];

const contentChecks = [
  ["index.html", "制作ポータル"],
  ["index.html", "主導線"],
  ["index.html", "新規制作モードは工程表を基準"],
  ["index.html", "期間限定セールスレター"],
  ["index.html", "ファネルフォーマット選択"],
  ["index.html", "オプト前VSLパターン"],
  ["index.html", "標準候補"],
  ["index.html", "メルマガ紹介文章"],
  ["index.html", "次ライブ Day2"],
  ["index.html", "販売ページの素材"],
  ["roadmap.html", "上から順に、どの素材を作るかを確認します。まずは1-1から進めます。"],
  ["roadmap.html", "1-1"],
  ["roadmap.html", "全体導線を確認する"],
  ["roadmap.html", "オプトインLP、登録CTA、サンキューページ、オープンチャット"],
  ["roadmap.html", "1-2"],
  ["roadmap.html", "販売商品を確認する"],
  ["roadmap.html", "2. 設計シート"],
  ["roadmap.html", "ターゲットを整理する"],
  ["roadmap.html", "リサーチを行う"],
  ["roadmap.html", "コンセプトを作る"],
  ["roadmap.html", "コンフィグ＋プロフィールを整える"],
  ["roadmap.html", "オファーを整理する"],
  ["roadmap.html", "3. 集客フェーズ"],
  ["roadmap.html", "オプトインLP原稿"],
  ["roadmap.html", "LPヘッド指示書"],
  ["roadmap.html", "オプト前VSL台本"],
  ["roadmap.html", "サンキューページ原稿"],
  ["roadmap.html", "自動返信メールを作る"],
  ["roadmap.html", "紹介文章を作る"],
  ["roadmap.html", "4. 教育（活性化）フェーズ"],
  ["roadmap.html", "価値提供全体を整理する"],
  ["roadmap.html", "Day1〜Day5台本を作る"],
  ["roadmap.html", "課題と特典を作る"],
  ["roadmap.html", "固定投稿を作る"],
  ["roadmap.html", "通常配信を作る"],
  ["roadmap.html", "公式LINE登録誘導を作る"],
  ["roadmap.html", "5. 販売ページ設計"],
  ["roadmap.html", "販売前メッセージを作る"],
  ["roadmap.html", "セールスレター原稿を作る"],
  ["roadmap.html", "セールスページヘッド指示書を作る"],
  ["roadmap.html", "販売期配信を作る"],
  ["roadmap.html", "購入完了ページ原稿を作る"],
  ["roadmap.html", "6. 納品/添削準備"],
  ["roadmap.html", "成果物一覧"],
  ["roadmap.html", "原稿/指示書所在を確認する"],
  ["roadmap.html", "添削確認を行う"],
  ["roadmap.html", "差し替え履歴を残す"],
  ["target.html", "ターゲットシート"],
  ["target.html", "ターゲット仮止め"],
  ["target.html", "見込み客像"],
  ["target.html", "地味で平凡な会社員"],
  ["target.html", "悩みと勘違い"],
  ["target.html", "動く条件"],
  ["target.html", "LP/動画に使う感情"],
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
  ["config.html", "講師プロフィール"],
  ["config.html", "株式会社ザ・リード 創業者"],
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
  ["assets.html", "制作物ポータル"],
  ["assets.html", "集客の素材一覧"],
  ["assets.html", "価値提供の素材一覧"],
  ["assets.html", "販売の素材一覧"],
  ["assets.html", "作る順番"],
  ["assets.html", "素材棚"],
  ["visual-report.html", "今回サンプルの必須素材"],
  ["visual-report.html", "今回のファネルフォーマット"],
  ["visual-report.html", "集客パターンの出し分け"],
  ["visual-report.html", "何チャレと次ライブ"],
  ["visual-report.html", "販売形態4パターン"],
  ["visual-report.html", "見込み客が実際に見るページ、LINE、ライブ、レターだけ"],
  ["visual-report.html", "チャレンジローンチ / ワンステップ販売"],
  ["visual-report.html", "オプト前VSLパターン"],
  ["visual-report.html", "オプト後VSLパターン"],
  ["visual-report.html", "標準候補"],
  ["visual-report.html", "集客メディア"],
  ["visual-report.html", "メルマガ紹介文章"],
  ["visual-report.html", "2チャレ"],
  ["visual-report.html", "3チャレ"],
  ["visual-report.html", "5チャレ"],
  ["visual-report.html", "個別販売パターン"],
  ["visual-report.html", "セミナー販売パターン"],
  ["visual-report.html", "セミナー→個別販売パターン"],
  ["visual-report.html", "セールスレターでの販売パターン"],
  ["visual-report.html", "オプト後VSL"],
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
  ["line.html", "公式LINE内で期間限定レター案内"],
  ["live-scripts.html", "課題提出 91件"],
  ["lp.html", "集客の素材一覧"],
  ["lp.html", "集客で作る素材"],
  ["lp.html", "メルマガ紹介文章"],
  ["lp.html", "オプトインLP原稿"],
  ["lp.html", "LPヘッド指示書"],
  ["lp.html", "オプト前VSL台本"],
  ["lp.html", "サンキューページ原稿"],
  ["lp.html", "オプト後VSL台本"],
  ["lp.html", "オプトイン自動返信メール"],
  ["lp.html", "才能・経験・顔出し不要"],
  ["value.html", "価値提供の素材一覧"],
  ["value.html", "価値提供で作る素材"],
  ["value.html", "LINEオープンチャット全体ポータル"],
  ["value.html", "固定投稿"],
  ["value.html", "通常配信"],
  ["value.html", "Day1〜Day5ライブ台本"],
  ["value.html", "課題/特典案内文"],
  ["script-opening.html", "VSL配置の前提"],
  ["script-opening.html", "VSL台本"],
  ["script-opening.html", "VSLスライド指示書"],
  ["script-opening.html", "オプト前VSL"],
  ["script-opening.html", "オプト後VSL"],
  ["script-opening.html", "5〜10分"],
  ["script-opening.html", "ビデオセールスレター"],
  ["live-scripts.html", "Day別ライブ台本一覧"],
  ["live-scripts.html", "Day別スライド指示書"],
  ["sales-page.html", "販売の素材一覧"],
  ["sales-page.html", "販売で作る素材"],
  ["sales-page.html", "販売前メッセージ原稿"],
  ["sales-page.html", "セールスレター原稿"],
  ["sales-page.html", "セールスページヘッド指示書"],
  ["sales-page.html", "販売期メルマガ原稿"],
  ["sales-page.html", "販売期公式LINE原稿"],
  ["sales-page.html", "個別販売ページ原稿"],
  ["sales-page.html", "購入完了ページ原稿"],
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

for (const file of ["target.html", "concept.html", "profile.html", "config.html", "research.html", "offer.html"]) {
  if (read(file).includes("source-path")) fail(`${file} should not expose source paths`);
}
for (const snippet of ["決済後の流れ", "決済確認", "Chatwork申請", "グループ参加", "価格戦略"]) {
  if (read("offer.html").includes(snippet)) fail(`offer.html should not include ${snippet}`);
}
for (const snippet of [
  "一気通貫モードと個別制作モード",
  "個別制作物",
  "<th>確認先</th>",
  "工程表の使い方",
  "ファネルフォーマット確認",
  "集客パターン",
  "集客メディア",
  "チャレンジ日数と次ライブ",
  "販売形態4パターン",
  "今回サンプルの必須素材",
  "9章の詳細工程",
  "<table class=\"asset-table roadmap-table\"",
]) {
  if (read("roadmap.html").includes(snippet)) fail(`roadmap.html should not include ${snippet}`);
}

const roadmapPhaseSections = (read("roadmap.html").match(/id="phase-[0-9]"/g) || []).length;
if (roadmapPhaseSections !== 6) fail(`roadmap phase sections expected 6, got ${roadmapPhaseSections}`);

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
  const publicText = new Map();
  const cacheBust = `portal_check=${Date.now()}`;
  for (const file of requiredPages) {
    const res = await fetch(`${base}/${file}?${cacheBust}`);
    if (!res.ok) fail(`public ${file} returned ${res.status}`);
    publicText.set(file, await res.text());
  }
  for (const file of requiredPages) {
    const html = publicText.get(file);
    for (const word of forbidden) {
      if (html.includes(word)) fail(`public ${file} contains forbidden term: ${word}`);
    }
  }
  for (const [file, snippet] of contentChecks) {
    if (!publicText.get(file)?.includes(snippet)) fail(`public ${file} missing content: ${snippet}`);
  }
  const old = await fetch(`${base}/hierarchy.html?${cacheBust}`);
  if (old.status !== 404) fail(`public hierarchy.html should be 404, got ${old.status}`);
}

await checkPublic();

if (!process.exitCode) pass("WEB_MARKETER_ROAD_PORTAL_CHECK");
