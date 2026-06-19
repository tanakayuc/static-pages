#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const publicBaseArg = process.argv.find((arg) => arg.startsWith("--public-base="));
const publicBase = publicBaseArg?.split("=").slice(1).join("=");
const deprecatedOptAfterVsl = "オプトイン後" + "VSL";

const requiredPages = [
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
  "optin-lp-copy.html",
  "optin-after-mails.html",
  "thank-you-copy.html",
  "referral-copy.html",
  "traffic-mails.html",
  "value.html",
  "head.html",
  "stepmail.html",
  "line.html",
  "script-opening.html",
  "live-scripts.html",
  "sales-page.html",
];

const requiredAssets = [
  "funnel-patterns/pattern-current-opt-before-vsl-sales-page.png",
  "funnel-patterns/pattern-06-opt-after-vsl-individual.png",
  "funnel-patterns/pattern-07-opt-before-vsl-individual.png",
  "funnel-patterns/pattern-08-opt-after-vsl-seminar-to-individual.png",
  "funnel-patterns/pattern-09-opt-after-vsl-seminar-direct.png",
  "funnel-patterns/pattern-10-opt-after-vsl-sales-page.png",
  "funnel-parts/challenge-3days.png",
  "funnel-parts/challenge-4days.png",
  "funnel-parts/challenge-5days.png",
  "funnel-parts/day1.png",
  "funnel-parts/day2.png",
  "funnel-parts/day3.png",
  "funnel-parts/day4.png",
  "funnel-parts/day5.png",
  "funnel-parts/thanks-no-video.png",
  "funnel-parts/thanks-opt-after-vsl.png",
  "funnel-parts/seminar-to-individual.png",
  "funnel-parts/seminar-direct.png",
  "funnel-parts/list-building.png",
  "funnel-parts/individual-sales.png",
  "funnel-parts/opt-before-vsl-page.png",
  "funnel-parts/opt-page.png",
  "funnel-parts/sales-page.png",
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
  "第1章で確認する項目",
  "第4章の詳細設計を入れる場所",
  "逆生成",
  "書き起こし",
  "実素材",
  "公開URL台帳",
  "ページ骨子",
  "オプトインLPに掲載されている講師プロフィール",
  "そのまま制作ポータルへ反映",
  "制作ポータル",
  "制作物ポータル",
  "挨拶動画",
  "サンキュー動画",
  "オプトインVSL",
  "オプト後VSL台本",
  "OPT5のVSL台本",
  "集客レイヤー",
  "販売レイヤー",
  "一気通貫モード",
  "個別制作モード",
  deprecatedOptAfterVsl,
];

const contentChecks = [
  ["roadmap.html", "上から順に、どの素材を作るかを確認します。まずは1-1から進めます。"],
  ["roadmap.html", "ファネル工程軸"],
  ["roadmap.html", "集客ページ"],
  ["roadmap.html", "サンクスページ"],
  ["roadmap.html", "教育グループ"],
  ["roadmap.html", "販売ページ"],
  ["roadmap.html", "対応位置"],
  ["roadmap.html", "カツオリーチ"],
  ["roadmap.html", "作業位置マップ"],
  ["roadmap.html", "サンクスページ"],
  ["roadmap.html", "funnel-parts/opt-before-vsl-page.png"],
  ["roadmap.html", "funnel-parts/thanks-no-video.png"],
  ["roadmap.html", "funnel-parts/challenge-5days.png"],
  ["roadmap.html", "funnel-parts/sales-page.png"],
  ["roadmap.html", "1-1"],
  ["roadmap.html", "Step 1"],
  ["roadmap.html", "目的意識を明確にする"],
  ["roadmap.html", "1. 事前設計"],
  ["roadmap.html", "1-2"],
  ["roadmap.html", "販売したい商品を決める"],
  ["roadmap.html", "2. コンセプト設計"],
  ["roadmap.html", "ターゲットシート作成"],
  ["roadmap.html", "ライバル情報の収集"],
  ["roadmap.html", "空いている訴求の特定"],
  ["roadmap.html", "ポジショニングの作成"],
  ["roadmap.html", "プロモーションコンセプト"],
  ["roadmap.html", "3. オファー構築"],
  ["roadmap.html", "本命商品オファー"],
  ["roadmap.html", "4. コンテンツ設計"],
  ["roadmap.html", "5日間コンテンツ設計"],
  ["roadmap.html", "ライブ1コアストーリー"],
  ["roadmap.html", "5. オプトインLPの作成"],
  ["roadmap.html", "オプトインLP原稿"],
  ["roadmap.html", "LPヘッドデザイン指示書"],
  ["roadmap.html", "サンキューページ原稿"],
  ["roadmap.html", "6. 集客素材の作成"],
  ["roadmap.html", "オプト後自動返信メール"],
  ["roadmap.html", "7. ライブ台本の作成"],
  ["roadmap.html", "ライブ1シナリオ作成"],
  ["roadmap.html", "ライブ5シナリオ作成（1ステップ版）"],
  ["roadmap.html", "8. プロモ素材の作成"],
  ["roadmap.html", "1ステップ販売ページ"],
  ["roadmap.html", "9. 本番運用"],
  ["roadmap.html", "特商法・プライバシーポリシー"],
  ["roadmap.html", "Step 65"],
  ["target.html", "ターゲットシート"],
  ["target.html", "ターゲット仮止め"],
  ["target.html", "見込み客像"],
  ["target.html", "地味で平凡な会社員"],
  ["target.html", "悩みと勘違い"],
  ["target.html", "動く条件"],
  ["target.html", "LP/動画に使う感情"],
  ["concept.html", "コンセプト設計結果"],
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
  ["research.html", "コンセプトへの示唆"],
  ["research.html", "ユニークベネフィット"],
  ["research.html", "アドバンテージ"],
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
  ["assets.html", "制作物一覧"],
  ["assets.html", "集客の素材一覧"],
  ["assets.html", "価値提供の素材一覧"],
  ["assets.html", "販売の素材一覧"],
  ["visual-report.html", "第1章の設計値"],
  ["visual-report.html", "第1章で決めた目的、ファネル、KPI、制作対象を確認します。"],
  ["visual-report.html", "今回のファネル確認カード"],
  ["visual-report.html", "pattern-current-opt-before-vsl-sales-page.png"],
  ["visual-report.html", "見込み客が見る導線"],
  ["visual-report.html", "チャレンジローンチ / 販売ページ直販"],
  ["visual-report.html", "オプト前VSL"],
  ["visual-report.html", "カツオリーチ"],
  ["visual-report.html", "5チャレ"],
  ["visual-report.html", "セールスレターでの販売ページ直販"],
  ["visual-report.html", "KPI逆算"],
  ["visual-report.html", "制作対象"],
  ["visual-report.html", "目標売上"],
  ["visual-report.html", "1,800,000円"],
  ["visual-report.html", "必要リスト数"],
  ["visual-report.html", "300件"],
  ["visual-report.html", "広告費目安"],
  ["visual-report.html", "900,000円"],
  ["visual-report.html", "狙うスケジュール"],
  ["visual-report.html", "8月21日（木）〜9月4日（木）"],
  ["visual-report.html", "集客期間"],
  ["visual-report.html", "8月21日（木）"],
  ["visual-report.html", "集客スタート日"],
  ["visual-report.html", "9月4日（木）"],
  ["visual-report.html", "集客終了日"],
  ["visual-report.html", "Day1ライブ"],
  ["visual-report.html", "9月7日（日）"],
  ["visual-report.html", "Day2ライブ"],
  ["visual-report.html", "9月9日（火）"],
  ["visual-report.html", "Day3ライブ"],
  ["visual-report.html", "9月12日（金）"],
  ["visual-report.html", "Day4ライブ"],
  ["visual-report.html", "9月14日（日）"],
  ["visual-report.html", "Day5ライブ"],
  ["visual-report.html", "9月14日（日）〜9月19日（金）"],
  ["visual-report.html", "セールス期間"],
  ["visual-report.html", "9月19日 23:59まで"],
  ["visual-report.html", "オープンチャット"],
  ["visual-report.html", "Day1着席"],
  ["visual-report.html", "レター閲覧 / 購入 / 売上"],
  ["stepmail.html", "高額投資に失敗してきたあなたへ"],
  ["stepmail.html", "オプトイン後メルマガ"],
  ["stepmail.html", "集客前メッセージ"],
  ["stepmail.html", "reader-layout"],
  ["stepmail.html", "1つ上に戻る"],
  ["stepmail.html", "ステップメール全体像"],
  ["stepmail.html", "目的別"],
  ["stepmail.html", "メール一覧"],
  ["stepmail.html", "folder-list"],
  ["stepmail.html", "stepmail-mail-01.html"],
  ["stepmail.html", "9月20日 / 20時"],
  ["stepmail.html", "入口接続"],
  ["stepmail.html", "価値提供接続"],
  ["stepmail.html", "不安解消"],
  ["line.html", "計画配信"],
  ["line.html", "reader-layout"],
  ["line.html", "1つ上に戻る"],
  ["line.html", "73件"],
  ["line.html", "実ログ"],
  ["line.html", "LINE全体ポータル"],
  ["line.html", "全体ポータル"],
  ["line.html", "固定投稿"],
  ["line.html", "通常配信"],
  ["line.html", "公式LINE"],
  ["line.html", "folder-list"],
  ["line.html", "line-fixed-01.html"],
  ["line.html", "line-normal-01.html"],
  ["line.html", "line-official-01.html"],
  ["line.html", "全スポット配信タイトル"],
  ["live-scripts.html", "課題提出 91件"],
  ["lp.html", "集客の素材一覧"],
  ["lp.html", "集客で作る素材"],
  ["lp.html", "production-side"],
  ["lp.html", "1つ上に戻る"],
  ["lp.html", "制作物一覧"],
  ["lp.html", "material-nav-link"],
  ["lp.html", "オプトインLP原稿"],
  ["lp.html", "LPヘッドデザイン指示書"],
  ["lp.html", "オプト前VSL台本"],
  ["lp.html", "オプトイン後メルマガ"],
  ["lp.html", "サンキューページ原稿"],
  ["lp.html", "紹介用文章"],
  ["lp.html", "集客前メッセージ"],
  ["lp.html", "MDフォルダ構成"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/01_オプトインLP原稿/"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/02_LPヘッドデザイン指示書/"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/04_オプトイン後メルマガ/"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/05_サンキューページ原稿/"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/06_紹介用文章/"],
  ["lp.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/07_集客前メッセージ/"],
  ["optin-after-mails.html", "オプトイン後メルマガ一覧"],
  ["optin-after-mails.html", "optin-after-mail-01.html"],
  ["optin-after-mails.html", "optin-after-mail-02.html"],
  ["referral-copy.html", "紹介用文章"],
  ["referral-copy.html", "90_制作パッケージサンプル/05_制作物一覧/01_集客素材/06_紹介用文章/紹介文章.md"],
  ["traffic-mails.html", "集客前メッセージ一覧"],
  ["traffic-mails.html", "traffic-mail-01.html"],
  ["traffic-mails.html", "traffic-mail-07.html"],
  ["optin-lp-copy.html", "オプトインLP原稿"],
  ["optin-lp-copy.html", "1つ上に戻る"],
  ["optin-lp-copy.html", "集客素材一覧"],
  ["optin-lp-copy.html", "才能・経験・顔出し不要"],
  ["optin-lp-copy.html", "動画視聴前"],
  ["optin-lp-copy.html", "動画視聴後"],
  ["optin-lp-copy.html", "02_オプトインLP/01_オプトページ_登録経路なし.md"],
  ["thank-you-copy.html", "サンキューページ原稿"],
  ["thank-you-copy.html", "1つ上に戻る"],
  ["thank-you-copy.html", "集客素材一覧"],
  ["thank-you-copy.html", "LINEオープンチャットに参加する"],
  ["thank-you-copy.html", "03_サンキューページ/01_オプトイン後サンキューページ.md"],
  ["value.html", "価値提供の素材一覧"],
  ["value.html", "価値提供で作る素材"],
  ["value.html", "production-side"],
  ["value.html", "1つ上に戻る"],
  ["value.html", "制作物一覧"],
  ["value.html", "material-nav-link"],
  ["value.html", "LINEオープンチャット"],
  ["value.html", "固定投稿"],
  ["value.html", "通常配信"],
  ["value.html", "Day1〜Day5ライブ台本"],
  ["value.html", "課題/特典案内文"],
  ["value.html", "価値提供中メール"],
  ["value.html", "90_制作パッケージサンプル/05_制作物一覧/02_価値提供素材/01_LINEオープンチャット/"],
  ["value.html", "90_制作パッケージサンプル/05_制作物一覧/02_価値提供素材/04_価値提供中メール/"],
  ["script-opening.html", "今回のVSL台本"],
  ["script-opening.html", "1つ上に戻る"],
  ["script-opening.html", "集客素材一覧"],
  ["script-opening.html", "オプト前VSL台本"],
  ["script-opening.html", "VSLスライド指示書"],
  ["script-opening.html", "オプト前VSL"],
  ["live-scripts.html", "Day別ライブ台本一覧"],
  ["live-scripts.html", "Day別スライド指示書"],
  ["sales-page.html", "販売の素材一覧"],
  ["sales-page.html", "販売で作る素材"],
  ["sales-page.html", "production-side"],
  ["sales-page.html", "1つ上に戻る"],
  ["sales-page.html", "制作物一覧"],
  ["sales-page.html", "material-nav-link"],
  ["sales-page.html", "販売前メッセージ原稿"],
  ["sales-page.html", "セールスレター原稿"],
  ["sales-page.html", "セールスページヘッド指示書"],
  ["sales-page.html", "販売期メルマガ原稿"],
  ["sales-page.html", "LINEオープンチャット販売導線"],
  ["sales-page.html", "販売期公式LINE原稿"],
  ["sales-page.html", "90_制作パッケージサンプル/05_制作物一覧/03_販売素材/04_LINEオープンチャット_Day5後販売導線/"],
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
for (const file of requiredAssets) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) fail(`${file} missing`);
}
if (fs.existsSync(path.join(root, "hierarchy.html"))) fail("hierarchy.html should not exist");
if (fs.existsSync(path.join(root, "index.html"))) fail("index.html should not exist");

const generatedDetailPages = fs.existsSync(root)
  ? fs.readdirSync(root).filter((name) => /^(stepmail-mail|optin-after-mail|traffic-mail|line-fixed|line-normal|line-official)-\d+\.html$/.test(name)).sort()
  : [];
const allRequiredPages = [...requiredPages, ...generatedDetailPages];

for (const file of allRequiredPages) {
  const html = read(file);
  if (!html.includes('class="side') && !html.includes('class="reader-side')) fail(`${file} missing sidebar`);
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
if (!css.includes("ここだよ")) fail("portal.css missing funnel focus label");
if (!css.includes(".funnel-location-link")) fail("portal.css missing funnel location link");
if (!css.includes(".funnel-composite")) fail("portal.css missing funnel composite");

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
  "今回のファネル確認カード",
  "格納済みファネルパターン",
  "パーツ素材ライブラリ",
  "Pattern 06",
  "Pattern 07",
  "Pattern 08",
  "Pattern 09",
  "Pattern 10",
  "標準候補",
  "選択候補",
  "オプション",
  "追加で欲しい単独画像",
  "パターン選択用",
  "選んだ集客・価値提供・販売",
  "一気通貫モードと個別制作モード",
  "個別制作物",
  "<th>確認先</th>",
  "工程表の使い方",
  "ファネルフォーマット確認",
  "集客フェーズ",
  "教育（活性化）フェーズ",
  "販売ページ設計",
  "納品/添削準備",
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

for (const snippet of [
  "標準候補",
  "選ぶ条件",
  "出し分け",
  "集客パターン",
  "集客メディアの確認",
  "何チャレと次ライブ",
  "販売形態4パターン",
  "ビデオセールスレター",
  "遅延CTA",
  "教育設計",
  "詳細設計で追加された素材",
  "詳細設計後の導線",
  "制作物パッケージ",
  "今回サンプルの必須素材",
  "KPIの見方",
]) {
  if (read("visual-report.html").includes(snippet)) fail(`visual-report.html should not include know-how snippet: ${snippet}`);
}

const outputOnlyChecks = [
  ["concept.html", ["田中祐一AIのコンセプト設計フロー", "質問は一度で詰め切る"]],
  ["research.html", ["リサーチはコンセプトの前半戦", "リサーチの順番", "リサーチの切り口", "書籍から取り込むリサーチ原則", "空きポジション分析ロジック", "AIに考えさせること"]],
  ["assets.html", ["工程表との関係", "作る順番", "新規制作モードは工程表"]],
  ["script-opening.html", ["VSL配置の前提", "選択肢", "選ぶ条件"]],
  ["live-scripts.html", ["チャレンジ日数と次ライブ", "何チャレにするか"]],
  ["line.html", ["オプト後VSLパターンでは", "オプト前VSLパターンでは", "いずれかへ分岐"]],
];

for (const [file, snippets] of outputOnlyChecks) {
  const html = read(file);
  for (const snippet of snippets) {
    if (html.includes(snippet)) fail(`${file} should not include procedural/knowledge snippet: ${snippet}`);
  }
}

for (const file of ["lp.html", "value.html", "sales-page.html"]) {
  const html = read(file);
  for (const snippet of ['<div class="nav-section">レポート</div>', '<div class="nav-section">設計シート</div>']) {
    if (html.includes(snippet)) fail(`${file} should show production subnav, not top-level sidebar section: ${snippet}`);
  }
}

for (const file of ["stepmail.html", "optin-after-mails.html", "traffic-mails.html", "line.html"]) {
  const html = read(file);
  if (html.includes('<div class="layout">')) fail(`${file} should use reader layout, not standard report layout`);
  if (html.includes('class="side">')) fail(`${file} should not include the global report sidebar`);
  if (html.includes("stepmail-shell")) fail(`${file} should not nest the mail sidebar inside a panel`);
  if (html.includes("copy-article")) fail(`${file} should be an index page and must not render MD bodies`);
  if (html.includes("source-path")) fail(`${file} should be an index page and must not expose MD source paths`);
}

for (const file of generatedDetailPages) {
  const html = read(file);
  const sourceCount = (html.match(/source-path/g) || []).length;
  if (sourceCount !== 1) fail(`${file} should render exactly one MD source, got ${sourceCount}`);
  if (!html.includes("copy-article")) fail(`${file} should render exactly one MD body`);
}

for (const snippet of ["オプト後VSL台本", "登録直後VSL", "OPT5のVSL台本"]) {
  if (read("lp.html").includes(snippet)) fail(`lp.html should not include nonexistent acquisition material: ${snippet}`);
  if (read("script-opening.html").includes(snippet)) fail(`script-opening.html should not include nonexistent acquisition material: ${snippet}`);
}

for (const snippet of ['href="#optin-lp-copy"', 'href="#thank-you-copy"']) {
  if (read("lp.html").includes(snippet)) fail(`lp.html should link to independent material pages, not in-page anchors: ${snippet}`);
}

const roadmapPhaseSections = (read("roadmap.html").match(/id="phase-[0-9]"/g) || []).length;
if (roadmapPhaseSections !== 9) fail(`roadmap phase sections expected 9, got ${roadmapPhaseSections}`);

for (const file of allRequiredPages) {
  const html = read(file);
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href === "") fail(`${file} has empty link target`);
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
  for (const file of allRequiredPages) {
    const res = await fetch(`${base}/${file}?${cacheBust}`);
    if (!res.ok) fail(`public ${file} returned ${res.status}`);
    publicText.set(file, await res.text());
  }
  for (const file of allRequiredPages) {
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
