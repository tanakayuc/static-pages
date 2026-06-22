#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const publicDir = "/Users/tanakayuichi/Projects/static-pages/web-marketer-road-creation-portal";
const mirrorDir = "/Users/tanakayuichi/Projects/theleadpromotion/21_プロジェクト一覧/田中祐一/PLCプロモ素材/WEBマーケターへの道/90_制作パッケージサンプル";
const sourceRoot = "/Users/tanakayuichi/Projects/theleadpromotion/21_プロジェクト一覧/田中祐一/PLCプロモ素材/WEBマーケターへの道";

const dirs = [publicDir, mirrorDir];
const deprecatedOptInVsl = "オプトイン" + "VSL";
const deprecatedOptAfterVsl = "オプトイン後" + "VSL";
const deprecatedGreetingVideo = "挨拶" + "動画";
const deprecatedThanksVideo = "サンキュー" + "動画";
const deprecatedTeaseVideo = "ティーアップ" + "動画";

const navGroups = [
  {
    label: "レポート",
    items: [
      ["visual-report.html", "R", "全体構成", "ファネル全体"],
      ["roadmap.html", "M", "工程表", "素材確認"],
    ],
  },
  {
    label: "設計シート",
    items: [
      ["target.html", "T", "ターゲット", "見込み客"],
      ["research.html", "R", "リサーチ", "市場/競合"],
      ["concept.html", "C", "コンセプト", "コアシナリオ"],
      ["config.html", "G", "コンフィグ＋プロフィール", "本人情報"],
      ["offer.html", "O", "オファー", "商品/条件"],
    ],
  },
  {
    label: "制作物",
    items: [
      ["assets.html", "A", "制作物一覧", "カテゴリ"],
      ["lp.html", "L", "集客素材", "一覧"],
      ["value.html", "V", "価値提供素材", "一覧"],
      ["sales-page.html", "S", "販売素材", "一覧"],
    ],
  },
];

const funnelSteps = [
  ["オプトインLP", "フォーム中心、またはLP上部にオプト前VSLを置く形を選び、登録動機を作る。"],
  ["サンキューページ", "登録直後に5分前後のオプト後VSLを置き、LINEオープンチャット参加とDay1着席への期待値を高める。"],
  ["価値提供フェーズのLINEオープンチャット", "固定ノート、事務連絡、Day1〜Day5の案内を集約する。"],
  ["Day1〜Day5配信", "ライブ、課題、Q&Aで価値提供と参加熱量を作る。"],
  ["公式LINE登録", "Day5で、レターを受け取りたい方だけを公式LINEへ移動させる。"],
  ["期間限定セールスレター", "公式LINE内で期限付きの販売ページを公開する。"],
];

const coreFunnelRows = [
  ["LP", "見込み客を登録へ動かす入口。フォーム中心か、オプト前VSLを置くかを全体設計で選ぶ。", "lp.html"],
  ["サンキューページ", "登録直後に次アクションを示す。必要に応じてオプト後VSLでオープンチャット参加と着席期待値を作る。5分前後、長くても5〜10分を目安にする。", "lp.html"],
  ["オープンチャット", "参加者を受け止め、事務連絡、固定ノート、ライブ案内、課題、Q&Aを運用する。", "line.html"],
  ["Day1〜Day5コンテンツ", "5日間のライブ、課題、特典で価値提供と販売前の納得感を作る。", "live-scripts.html"],
  ["セールスレター販売", "個別相談を挟まず、レターで本命商品を販売する。", "sales-page.html"],
];

const detailedAssetRows = [
  ["ヘッドデザイン指示", "LPとセールスページのファーストビュー制作指示。", "head.html"],
  ["VSL台本", "オプト前VSLまたはオプト後VSLとして、次CTAを担う5〜10分の説得動画。", "script-opening.html"],
  ["オプトイン自動返信", "メール登録で止まった人をオープンチャットへ戻す。", "optin-after-mails.html"],
  ["販売導線LINE", "Day5後に、レター希望者を公式LINEへ移動させる。", "sales-oc.html"],
  ["販売メルマガ", "レター閲覧、締切、購入を促すメール。", "sales-mails.html"],
  ["販売期LINE", "販売開始、質問回答、締切を促すLINE。", "sales-line.html"],
  ["購入完了ページ", "決済後の案内、参加導線、次アクションを伝える。", "purchase-complete.html"],
];

const vslPlacementRows = [
  ["オプト後VSLパターン", "サンキューページ（登録直後）", "チャレンジローンチの標準。登録後の軽い案内ではなく、OC参加、Day1着席、チャレンジ参加期待値を高める本気のVSL。5分前後、長くても5〜10分を目安にする。", "サンキューページ原稿、5〜10分VSL台本、OC参加CTA"],
  ["オプト前VSLパターン", "オプトインLP上部（登録前）", "ほとんどの受講生は選ばないオプション。コールド広告 × 無料チャレンジ × OC/ライブ必須で、登録前に教育と選別を入れたいとき。", "LP原稿、VSL台本、視聴連動の遅延CTA指示"],
  ["併用", "LP上 + サンキューページ", "コールド広告から重いチャレンジへ送る場合。入口で教育と選別をし、登録後に正式参加へ押し上げる。", "2本のVSL配置方針、LP/サンキュー原稿、CTA表示ルール"],
];

const defaultFunnelFormat = {
  acquisitionPattern: "オプト後VSLパターン",
  challengePattern: "2チャレ / 3チャレ / 4チャレ / 5チャレ",
  salesPattern: "個別販売パターン",
};

const activeFunnelFormat = {
  acquisitionPattern: "オプト前VSLパターン",
  challengePattern: "5チャレ",
  nextLiveDay: "Day2",
  salesPattern: "セールスレターでの販売パターン",
  acquisitionMedia: "カツオリーチ",
};

const funnelPatternAssetDir = "funnel-patterns";
const funnelPartAssetDir = "funnel-parts";

const funnelPartRows = [
  ["challenge-3days", "3日チャレンジ", "価値提供", `${funnelPartAssetDir}/challenge-3days.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/3days_チャレンジ.png"],
  ["challenge-4days", "4日チャレンジ", "価値提供", `${funnelPartAssetDir}/challenge-4days.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/4days_チャレンジ.png"],
  ["challenge-5days", "5日チャレンジ", "価値提供", `${funnelPartAssetDir}/challenge-5days.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/5days_チャレンジ.png"],
  ["day1", "Day1", "価値提供", `${funnelPartAssetDir}/day1.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/day1.png"],
  ["day2", "Day2", "価値提供", `${funnelPartAssetDir}/day2.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/day2.png"],
  ["day3", "Day3", "価値提供", `${funnelPartAssetDir}/day3.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/day3.png"],
  ["day4", "Day4", "価値提供", `${funnelPartAssetDir}/day4.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/day4.png"],
  ["day5", "Day5", "価値提供", `${funnelPartAssetDir}/day5.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/day5.png"],
  ["thanks-no-video", "サンクスページ / 動画なし", "集客", `${funnelPartAssetDir}/thanks-no-video.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材 2/サンクスページ_動画なし.png"],
  ["thanks-opt-after-vsl", "サンクスページ / オプト後VSL", "集客", `${funnelPartAssetDir}/thanks-opt-after-vsl.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/サンクス_オプト後VSL.png"],
  ["seminar-to-individual", "セミナー→個別説明会", "販売", `${funnelPartAssetDir}/seminar-to-individual.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/セミナーページ_セミナー_個別説明会.png"],
  ["seminar-direct", "セミナー販売", "販売", `${funnelPartAssetDir}/seminar-direct.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/セミナーページ_セミナー.png"],
  ["list-building", "リスト化", "集客", `${funnelPartAssetDir}/list-building.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/リスト化.png"],
  ["individual-sales", "個別説明会", "販売", `${funnelPartAssetDir}/individual-sales.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/個別説明会ページ_個別説明会.png"],
  ["opt-before-vsl-page", "集客ページ / オプト前VSL", "集客", `${funnelPartAssetDir}/opt-before-vsl-page.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/集客ページ_オプト前VSL.png"],
  ["opt-page", "集客ページ", "集客", `${funnelPartAssetDir}/opt-page.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/集客ページ.png"],
  ["sales-page-part", "販売ページ直販", "販売", `${funnelPartAssetDir}/sales-page.png`, "/Users/tanakayuichi/Downloads/ファネル一覧用パーツ素材/販売ページ.png"],
];

const funnelPatternRows = [
  {
    id: "CURRENT",
    label: "今回採用: オプト前VSL × 5チャレ × 販売ページ直販",
    position: "今回採用",
    image: `${funnelPatternAssetDir}/pattern-current-opt-before-vsl-sales-page.png`,
    source: "/Users/tanakayuichi/Downloads/オプト前VSL_販売ページ.png",
    acquisition: "流入元: カツオリーチ / 集客ページ上のオプト前VSL → サンクスページ → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "販売ページ → 成約 → 商品提供",
  },
  {
    id: "06",
    label: "オプト後VSL × 個別説明会",
    position: "標準候補",
    image: `${funnelPatternAssetDir}/pattern-06-opt-after-vsl-individual.png`,
    source: "/Users/tanakayuichi/Downloads/ファネル工程一覧５パターン/6.png",
    acquisition: "集客ページ → サンクスページ上のオプト後VSL → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "個別説明会ページ → 個別説明会 → 成約 → 商品提供",
  },
  {
    id: "07",
    label: "オプト前VSL × 個別説明会",
    position: "オプション",
    image: `${funnelPatternAssetDir}/pattern-07-opt-before-vsl-individual.png`,
    source: "/Users/tanakayuichi/Downloads/ファネル工程一覧５パターン/7.png",
    acquisition: "集客ページ上のオプト前VSL → サンクスページ → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "個別説明会ページ → 個別説明会 → 成約 → 商品提供",
  },
  {
    id: "08",
    label: "オプト後VSL × セミナー→個別説明会",
    position: "選択候補",
    image: `${funnelPatternAssetDir}/pattern-08-opt-after-vsl-seminar-to-individual.png`,
    source: "/Users/tanakayuichi/Downloads/ファネル工程一覧５パターン/8.png",
    acquisition: "集客ページ → サンクスページ上のオプト後VSL → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "セミナーページ → セミナー → 個別説明会 → 成約 → 商品提供",
  },
  {
    id: "09",
    label: "オプト後VSL × セミナー販売",
    position: "選択候補",
    image: `${funnelPatternAssetDir}/pattern-09-opt-after-vsl-seminar-direct.png`,
    source: "/Users/tanakayuichi/Downloads/ファネル工程一覧５パターン/9.png",
    acquisition: "集客ページ → サンクスページ上のオプト後VSL → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "セミナーページ → セミナー → 成約 → 商品提供",
  },
  {
    id: "10",
    label: "オプト後VSL × 販売ページ直販",
    position: "選択候補",
    image: `${funnelPatternAssetDir}/pattern-10-opt-after-vsl-sales-page.png`,
    source: "/Users/tanakayuichi/Downloads/ファネル工程一覧５パターン/10.png",
    acquisition: "集客ページ → サンクスページ上のオプト後VSL → リスト化",
    value: "教育グループ Day1〜Day5",
    sales: "販売ページ → 成約 → 商品提供",
  },
];

const materialMdRoot = "90_制作パッケージサンプル/05_制作物一覧";
const acquisitionMaterialRoot = `${materialMdRoot}/01_集客素材`;
const valueMaterialRoot = `${materialMdRoot}/02_価値提供素材`;
const salesMaterialRoot = `${materialMdRoot}/03_販売素材`;

const acquisitionPatternRows = [
  {
    label: "オプト後VSLパターン",
    position: "標準",
    placement: "フォーム登録後のサンキューページでオプト後VSLを見せる。",
    chooseWhen: "チャレンジローンチの基本形。LPは短く登録を優先し、登録直後に正式参加、OC参加、Day1着席への期待値を高めたいとき。",
    assets: ["オプトインLP原稿", "サンキューページ原稿", "OC参加CTA"],
    flow: ["集客ページ", "登録フォーム", "サンキューページ", "オプト後VSL", "LINE/メールリスト化"],
  },
  {
    label: "オプト前VSLパターン",
    position: "オプション / 今回採用",
    placement: "集客ページ上でVSLを見せ、視聴後に登録CTAへ進ませる。",
    chooseWhen: "選ぶ人はかなり少ない。広告や紹介で温度が低く、登録前に教育と選別を入れたい案件で使う。",
    assets: ["オプトインLP原稿", "オプト前VSL台本", "遅延CTA指示", "LPヘッドデザイン指示書"],
    flow: ["集客ページ", "VSL視聴", "登録CTA", "サンキューページ", "LINE/メールリスト化"],
  },
];

const challengePatternRows = [
  { label: "2チャレ", position: "任意変更", range: "Day1〜Day2", next: "Day2", detail: "短期で参加ハードルを下げる。2本のライブ台本、課題、配信を作る。" },
  { label: "3チャレ", position: "標準", range: "Day1〜Day3", next: "Day2 / Day3", detail: "受講生の多くが選ぶ基本形。教育量と完走率のバランスを取り、3本のライブ台本、課題、配信を作る。" },
  { label: "4チャレ", position: "任意変更", range: "Day1〜Day4", next: "Day2 / Day3 / Day4", detail: "販売前に教育量を増やす。4本のライブ台本、課題、配信を作る。" },
  { label: "5チャレ", position: "成果型 / 今回採用", range: "Day1〜Day5", next: "Day2 / Day3 / Day4 / Day5", detail: "成果を上げる人に多い形。今回の完成素材サンプルは5チャレで、5日間のライブ、課題、特典、販売接続を作る。" },
];

const salesPatternRows = [
  {
    label: "個別販売パターン",
    position: "代表",
    chooseWhen: "高額商品や個別事情の確認が必要で、ページだけでは購入判断が重いとき。",
    output: "個別説明会ページ原稿、事前案内、相談前メッセージ、相談後フォロー。",
    nodes: ["個別販売ページ", "個別相談", "成約", "商品提供"],
  },
  {
    label: "セミナー販売パターン",
    position: "選択肢",
    chooseWhen: "セミナー内で納得形成からオファー提示まで完結できるとき。",
    output: "セミナーページ原稿、セミナー台本、オファースライド指示書、決済導線。",
    nodes: ["セミナーページ", "セミナー", "成約", "商品提供"],
  },
  {
    label: "セミナー→個別販売パターン",
    position: "選択肢",
    chooseWhen: "セミナーで教育し、その後に個別相談で条件確認や提案を行うとき。",
    output: "セミナーページ原稿、セミナー台本、個別説明会ページ原稿、相談導線。",
    nodes: ["セミナーページ", "セミナー", "個別相談", "成約", "商品提供"],
  },
  {
    label: "セールスレターでの販売パターン",
    position: "今回採用",
    chooseWhen: "今回のサンプルのように、公式LINEやメールから期間限定レターへ送り、ページで購入判断させるとき。",
    output: "セールスレター原稿、セールスページデザイン指示書、販売期配信、購入完了ページ原稿。",
    nodes: ["販売ページ", "成約", "商品提供"],
  },
];

const acquisitionMediaRows = [
  {
    label: "カツオリーチ",
    position: "今回採用",
    detail: "KATSUO側の既存接点やリーチから、チャレンジ登録へ送る紹介・告知導線を作る。",
    output: "カツオリーチ用紹介文、配信文、CTA",
  },
  {
    label: "集客前メッセージ",
    position: "素材種別",
    detail: "自分のリストや紹介元のメルマガで、チャレンジ登録へ送る紹介文を作る。",
    output: "ハウスリスト向けメルマガ、紹介元向け文面、件名、配信タイミング、CTA",
  },
  {
    label: "LINE紹介文",
    position: "選択肢",
    detail: "LINEリストに向けて、短文で登録理由とリンクを出す。",
    output: "LINE配信原稿、固定投稿、リマインド",
  },
  {
    label: "SNS紹介文",
    position: "選択肢",
    detail: "X、Instagram、Facebookなどで、チャレンジ登録へ送る投稿文を作る。",
    output: "投稿文、固定投稿、プロフィール導線",
  },
  {
    label: "広告クリエイティブ",
    position: "将来拡張",
    detail: "広告で集客する場合に、広告文、画像指示、遷移先、テスト案を作る。",
    output: "広告文、画像指示、訴求別バリエーション",
  },
];

const visibleFunnelNodes = [
  ["オプトインLP", "登録前", "参加理由を作り、メール登録へ進ませる。オプト前VSLを置く場合はここで教育と選別を行う。", "lp.html", "工程5"],
  ["登録後サンキュー", "登録直後", "オープンチャット参加を正式登録として促す。オプト後VSLを置く場合は5分前後の動画で期待値を上げる。", "lp.html", "工程5"],
  ["価値提供フェーズのLINEオープンチャット", "参加場所", "固定投稿、通常配信、ライブ案内、課題、Q&Aを受け止める。", "line.html", "工程6"],
  ["Day1〜Day5ライブ", "価値提供", "ライブ、課題、特典で実践経験と納得感を作る。", "live-scripts.html", "工程7"],
  ["販売導線LINE", "販売接続", "レターを受け取りたい人だけを移動させ、販売導線へ分岐する。", "sales-oc.html", "工程8"],
  ["期間限定レター", "販売", "公式LINE内で期限付きのセールスページを公開し、購入判断へ進ませる。", "sales-page.html", "工程8"],
  ["購入完了ページ", "決済後", "参加方法、連絡先、次アクションを案内する。", "sales-page.html", "工程8"],
];

const kpiFunnelRows = [
  ["入口", "登録率", "オプトインLPごとの登録率と登録経路別の反応を見る。"],
  ["登録後", "OC参加率 / Day1着席率", "サンキューからオープンチャットへ移動し、初日に着席する率を見る。"],
  ["価値提供", "ライブ参加 / 課題提出", "Day1〜Day5の離脱と提出数を見る。Day1 91件を起点に落ち方を確認する。"],
  ["販売接続", "公式LINE移動率", "レターを受け取りたい人だけが公式LINEへ移動できているかを見る。"],
  ["販売", "レター購入率 / 売上", "期間限定レターから購入する率と、仮単価60,000円での売上規模を見る。"],
];

const chapterAssetRows = [
  ["1. 全体設計", "全体構成レポート、ファネル方針、VSL配置方針、KPI仮シミュレーション、既存素材リスト", "visual-report.html"],
  ["2. リサーチ/コンセプト", "リサーチシート、ターゲット、3C、空きポジション、コンセプトシート、プロフィール、コンフィグ", "research.html"],
  ["3. オファー設計", "商品オファーシート、提供内容、サポート、特典/保証、価格表", "offer.html"],
  ["4. コンテンツ設計", "全体カリキュラム、Day別テーマ、コアシナリオ、ワーク/特典案", "live-scripts.html"],
  ["5. オプトイン開始セット", "オプトインLP、VSL配置方針、ヘッド指示、サンキューページ、自動返信メール", "lp.html"],
  ["6. 配信導線", "価値提供フェーズのLINEオープンチャット、固定投稿、通常配信、メルマガ件名と配信タイミング", "line.html"],
  ["7. 台本制作", "Day1〜Day5ライブ台本、課題フォーム、提出特典、アーカイブ導線", "live-scripts.html"],
  ["8. 販売導線", "販売導線LINE、セールスレター、販売メルマガ、販売期LINE、購入完了ページ", "sales-page.html"],
  ["9. 納品/添削準備", "成果物一覧、原稿/指示書所在、添削観点、更新履歴", "assets.html"],
];

const productionLayerRows = [
  {
    layer: "集客フェーズの素材",
    purpose: "見込み客に出会い、登録し、正式参加まで進んでもらうための素材群。",
    items: [
      ["SNSセットアップ指示書", "プロフィール、固定投稿、導線、投稿テーマ。SNS起点の案件で作る。", "assets.html"],
      ["広告クリエイティブ指示書", "広告画像、広告文、遷移先、テストパターン。広告運用ありの案件で作る。", "head.html"],
      ["オプトインLP原稿", "LP本文、ファーストビュー、登録CTA、オプト前VSLの配置方針を作る。", "lp.html"],
      ["LPヘッドデザイン指示書", "ヘッドの画面指示と参考サンプルをセットにし、ChatGPTやCodeXへ渡せる形にする。", "head.html"],
      ["オプト前VSL台本", "今回の配置に合わせ、登録前に見せるVSL台本を作る。", "script-opening.html"],
      ["VSLスライド指示書", "VSLにスライドが必要な場合、CodeX等へ渡せる構成案と画面指示を作る。", "script-opening.html"],
      ["オプトイン後メルマガ", "登録直後から正式参加・Day1着席へ戻すメールを作る。", "optin-after-mails.html"],
      ["サンキューページ原稿", "登録直後ページで、LINEオープンチャット参加へ進める本文を作る。", "thank-you-copy.html"],
      ["紹介用文章", "紹介元や既存リストから登録ページへ送る紹介文を作る。", "referral-copy.html"],
      ["集客前メッセージ", "全体素材が揃った後、ハウスリストや自社メルマガへ送る集客前メルマガを作る。", "traffic-mails.html"],
    ],
  },
  {
    layer: "価値提供フェーズの素材",
    purpose: "登録後に参加者を迷わせず、ライブ、課題、特典で納得感を作る素材群。",
    items: [
      ["価値提供フェーズのLINEオープンチャット", "全体ポータル、固定投稿、通常配信、ライブ前リマインドを作る。", "line.html"],
      ["価値提供中メール", "今回の本編は価値提供フェーズのLINEオープンチャットとライブで担うため、メールを使う場合だけ分けて作る。", "value-mails.html"],
      ["Day1〜Day5ライブ台本", "各日の教育テーマ、導入、本編、課題、次回予告を台本として分けて作る。", "live-scripts.html"],
      ["Day別スライド指示書", "各ライブにスライドが必要な場合、1日ごとのスライド構成案を作る。", "live-scripts.html"],
      ["課題/特典案内文", "課題フォーム、提出特典、コンプリート特典、提出後案内を作る。", "live-scripts.html"],
    ],
  },
  {
    layer: "販売ページの素材",
    purpose: "価値提供後に購入判断へ進ませ、申込後の次アクションまでつなげる素材群。",
    items: [
      ["販売導線LINE", "Day5後に販売へ接続するLINEメッセージを作る。", "sales-oc.html"],
      ["セールスレター原稿", "問題提起、コンセプト、商品内容、価格、特典、保証、申込導線を作る。", "sales-page.html"],
      ["セールスページヘッド指示書", "ヘッド、CTA、証拠、オファー表など、実装担当へ渡す画面指示を作る。", "sales-head.html"],
      ["販売メルマガ", "販売開始、質問回答、実績共有、締切、終了案内をメールで作る。", "sales-mails.html"],
      ["販売期LINE", "販売開始、質問回答、実績共有、締切、終了案内をLINEで作る。", "sales-line.html"],
      ["購入完了ページ原稿", "決済後の案内、参加導線、次アクションを作る。", "purchase-complete.html"],
    ],
  },
];

const productionCategoryRows = [
  {
    label: "集客の素材一覧",
    meta: "Traffic",
    href: "lp.html",
    detail: "登録前から正式参加・Day1着席まで。LP、ヘッド指示、VSL、登録後メール、紹介文、集客前メッセージを確認します。",
    items: ["オプトインLP原稿", "LPヘッドデザイン指示書", "オプト前VSL台本", "紹介用文章", "集客前メッセージ"],
  },
  {
    label: "価値提供の素材一覧",
    meta: "Value",
    href: "value.html",
    detail: "Day1着席後からDay5本編まで。価値提供フェーズのLINEオープンチャット、ライブ台本、課題、特典を確認します。",
    items: ["価値提供フェーズのLINEオープンチャット", "固定投稿", "通常配信", "Day1〜Day5ライブ台本"],
  },
  {
    label: "販売の素材一覧",
    meta: "Sales",
    href: "sales-page.html",
    detail: "Day5後から購入完了まで。販売接続、セールスレター、販売期配信、購入完了ページを確認します。",
    items: ["販売導線LINE", "販売メルマガ", "セールスレター原稿", "販売期LINE", "購入完了ページ原稿"],
  },
];

const acquisitionMaterialRows = [
  ["オプトインLP原稿", "登録前", "誰に、何を約束し、なぜ今参加するのかをLP本文として作る。", "optin-lp-copy.html", `${acquisitionMaterialRoot}/01_オプトインLP原稿/`],
  ["LPヘッドデザイン指示書", "ファーストビュー", "ヘッドのコピー、画像方向、CTA、参考サンプル、スマホ表示の指示をセットで作る。", "head.html", `${acquisitionMaterialRoot}/02_LPヘッドデザイン指示書/`],
  ["オプト前VSL台本", "登録前VSL", "LP上で登録前の教育と選別を行う動画台本を作る。", "script-opening.html", `${acquisitionMaterialRoot}/03_オプト前VSL台本/`],
  ["オプトイン後メルマガ", "登録直後", "登録直後〜1時間後に、正式参加・Day1着席へ戻すメールを作る。", "optin-after-mails.html", `${acquisitionMaterialRoot}/04_オプトイン後メルマガ/`],
  ["サンキューページ原稿", "登録直後", "メール登録で止めず、LINEオープンチャット参加へ進めるページ本文を作る。", "thank-you-copy.html", `${acquisitionMaterialRoot}/05_サンキューページ原稿/`],
  ["紹介用文章", "紹介元/自社リスト", "紹介元や既存リストから登録ページへ送る紹介文を作る。", "referral-copy.html", `${acquisitionMaterialRoot}/06_紹介用文章/`],
  ["集客前メッセージ", "集客開始前", "ハウスリストや自社メルマガから登録ページへ送る集客前メッセージを作る。", "traffic-mails.html", `${acquisitionMaterialRoot}/07_集客前メッセージ/`],
];

const valueMaterialRows = [
  ["価値提供フェーズのLINEオープンチャット", "参加場所", "固定投稿とDay1前〜Day5本編の通常配信をまとめる。", "line.html", `${valueMaterialRoot}/01_LINEオープンチャット/`],
  ["固定投稿", "OC内の常設案内", "参加直後に見るべき情報、ライブURL、提出先、注意事項を固定する。", "line.html", `${valueMaterialRoot}/01_LINEオープンチャット/01_固定投稿/`],
  ["通常配信", "Day1前〜Day5本編", "ライブ前後の案内、課題提出、リマインド、特典案内を送る。", "line.html", `${valueMaterialRoot}/01_LINEオープンチャット/02_通常配信_Day1前〜Day5本編/`],
  ["Day1〜Day5ライブ台本", "価値提供本編", "各日の導入、本編、課題、次回予告、販売接続を分けて作る。", "live-scripts.html", `${valueMaterialRoot}/02_Day1〜Day5ライブ台本/`],
  ["課題/特典案内文", "行動促進", "提出フォーム、提出特典、コンプリート特典、提出後案内を作る。", "live-scripts.html", `${valueMaterialRoot}/03_課題・特典/`],
  ["価値提供中メール", "今回は未使用", "今回の価値提供本編はOCとライブで担うため、メールは判断MDだけ確認する。", "value-mails.html", `${valueMaterialRoot}/04_価値提供中メール/`],
];

const salesMaterialRows = [
  ["販売メルマガ", "メール配信", "Day5後から販売終了までのメルマガ原稿を配信順に確認する。", "sales-mails.html", `${salesMaterialRoot}/01_オプトイン後メルマガ/`],
  ["セールスレター原稿", "販売ページ本文", "問題提起、コンセプト、商品内容、価格、特典、保証、申込導線を作る。", "sales-letter.html", `${salesMaterialRoot}/02_セールスレター原稿/`],
  ["販売導線LINE", "Day5後", "Day5後に販売へ接続するLINEメッセージをまとめる。", "sales-oc.html", `${salesMaterialRoot}/03_LINEオープンチャット_Day5後販売導線/`],
  ["販売期LINE", "公式LINE", "販売開始、質問回答、実績共有、締切、終了案内を作る。", "sales-line.html", `${salesMaterialRoot}/04_販売期公式LINE/`],
  ["セールスページヘッド指示書", "ファーストビュー", "販売ページ冒頭のコピー、CTA、締切、画面指示を作る。", "sales-head.html", `${salesMaterialRoot}/05_セールスページヘッド指示書/`],
  ["購入完了ページ原稿", "申込後", "決済後の案内、参加導線、連絡先、次アクションを作る。", "purchase-complete.html", `${salesMaterialRoot}/06_購入完了ページ原稿/`],
];

const productionSubnav = {
  "lp.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "optin-lp-copy.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "thank-you-copy.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "head.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "script-opening.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "referral-copy.html": {
    title: "集客素材",
    categoryHref: "lp.html",
    currentCode: "L",
    currentLabel: "集客素材",
    currentSub: "LP/VSL",
    rows: acquisitionMaterialRows,
  },
  "value.html": {
    title: "価値提供素材",
    categoryHref: "value.html",
    currentCode: "V",
    currentLabel: "価値提供素材",
    currentSub: "LINE/ライブ",
    rows: valueMaterialRows,
  },
  "sales-page.html": {
    title: "販売素材",
    categoryHref: "sales-page.html",
    currentCode: "S",
    currentLabel: "販売素材",
    currentSub: "レター/購入後",
    rows: salesMaterialRows,
  },
  "sales-letter.html": {
    title: "販売素材",
    categoryHref: "sales-page.html",
    currentCode: "S",
    currentLabel: "販売素材",
    currentSub: "レター/購入後",
    rows: salesMaterialRows,
  },
  "sales-head.html": {
    title: "販売素材",
    categoryHref: "sales-page.html",
    currentCode: "S",
    currentLabel: "販売素材",
    currentSub: "レター/購入後",
    rows: salesMaterialRows,
  },
  "purchase-complete.html": {
    title: "販売素材",
    categoryHref: "sales-page.html",
    currentCode: "S",
    currentLabel: "販売素材",
    currentSub: "レター/購入後",
    rows: salesMaterialRows,
  },
};

const lpAssetRows = [
  ["オプトインLP原稿", "登録前", "誰に、何を約束し、なぜ今参加するのかを本文として作る。オプト前VSL採用時は動画前提の構成にする。"],
  ["LPヘッドデザイン指示書", "登録前", "ファーストビューで見せる約束、画像方向、CTA、参考サンプル、スマホ表示の指示をセットで作る。"],
  ["オプト前VSL台本", "登録前", "LP上の動画として、登録前の教育と選別を行う台本を作る。"],
  ["オプトイン後メルマガ", "登録直後", "登録直後〜1時間後に、正式参加・Day1着席へ戻すメール原稿を作る。"],
  ["サンキューページ原稿", "登録直後", "メール登録で終わらせず、LINEオープンチャット参加へ進めるページ本文を作る。"],
  ["紹介用文章", "紹介元/自社リスト", "紹介元や既存リストから登録ページへ送る紹介文を作る。"],
  ["集客前メッセージ", "集客開始前", "ハウスリストや紹介元に向けて、チャレンジ登録へ送る件名、本文、CTAを作る。"],
];

const vslSlideRows = [
  ["1. 問題提起", "顔出し・自分の商品・実績がない人の停滞感を1枚で見せる。"],
  ["2. 旧世界/新世界", "スター型起業ではなく、裏方Webマーケターという別ルートを対比する。"],
  ["3. 5日間で得るもの", "D.E.C.O.D.E.、ライブ、課題、オープンチャットの全体像を見せる。"],
  ["4. 参加後の動き", "登録後に何をすれば正式参加になるかを、手順ではなく安心材料として見せる。"],
  ["5. CTA", "オープンチャット参加、Day1着席、課題提出への次アクションを明確にする。"],
];

const liveSlideRows = [
  ["Day1", "全体地図、旧世界/新世界、D.E.C.O.D.E.全体像、課題説明。"],
  ["Day2", "ファネル図、集客導線、数字の見方、分解ワーク。"],
  ["Day3", "3C、空きポジション、コンセプト、オファーの接続。"],
  ["Day4", "実践導線、チーム化、初実績作り、クライアントワークの見方。"],
  ["Day5", "5日間の統合、45日間実践環境、販売導線、次アクション。"],
];

const salesAssetRows = [
  ["セールスレター原稿", "ページ本文", "問題提起、コンセプト、商品内容、価格、特典、保証、申込導線を1本にする。"],
  ["セールスページヘッド指示書", "デザイン指示", "ファーストビュー、CTA、対象者、変化の約束、締切表示の画面指示を作る。"],
  ["販売期メール原稿", "メール", "販売開始、理由、事例、不安解消、締切の配信原稿を作る。"],
  ["販売期LINE原稿", "公式LINE", "販売開始、質問回答、実績共有、締切、終了案内の配信原稿を作る。"],
  ["販売導線LINE", "Day5後", "Day5後に販売へ接続するLINEメッセージを作る。"],
  ["購入完了ページ原稿", "申込後", "決済後に必要な参加案内、連絡先、次アクションを作る。"],
];

const productionFlowRows = [
  {
    phase: "1. 全体設計",
    purpose: "何を売るか、誰に届けるか、どの導線で販売するか、VSLをどこに置くかを仮決めする。",
    assets: ["全体構成レポート", "ファネル方針", "VSL配置方針", "KPI仮シミュレーション", "既存素材リスト"],
    done: "販売導線の全体像、オプト前VSL/オプト後VSLの選択、使える素材/足りない素材が見えている。",
    boundary: "田中祐一AI側の一区切りは、方針と素材台帳が揃うところ。",
    next: "数値運用や公開後の改善は、公開後の添削/改善工程で扱う。",
    href: "visual-report.html",
  },
  {
    phase: "2. リサーチ/コンセプト",
    purpose: "ターゲット、競合、コンテンツホルダーが提供できる価値をつなぎ、空きポジションと採用コンセプトを決める。",
    assets: ["リサーチシート", "ターゲットシート", "3C分析", "空きポジション", "コンセプトシート", "プロフィール", "コンフィグ"],
    done: "リサーチ結果から、LPや台本へ展開できる訴求軸が整理されている。",
    boundary: "田中祐一AI側の一区切りは、コンセプト素材が文章化されるところ。",
    next: "表現の細かな違和感や追加調査は、添削モードで精度を上げる。",
    href: "research.html",
  },
  {
    phase: "3. オファー設計",
    purpose: "何を提供するのか、それがいくらなのかを、セールスレターへ渡せる形で固定する。",
    assets: ["商品オファーシート", "提供内容", "サポート", "特典/保証", "価格と支払い方法"],
    done: "商品の中身、価格、特典、保証がひと目で確認できる。",
    boundary: "田中祐一AI側の一区切りは、オファーシートの完成。",
    next: "決済後の細かな案内や申込導線は、販売導線側で整える。",
    href: "offer.html",
  },
  {
    phase: "4. コンテンツ設計",
    purpose: "チャレンジ全体の教育テーマと、各日のゴール、ワーク、特典を決める。",
    assets: ["全体カリキュラム", "Day別テーマ", "コアシナリオ", "ワーク/特典案"],
    done: "参加者が何を学び、どこで納得し、どこで販売へ進むかが見えている。",
    boundary: "田中祐一AI側の一区切りは、Day別の設計と必要素材の棚卸し。",
    next: "ライブごとの細かな言い回しは、台本制作と添削モードで詰める。",
    href: "live-scripts.html",
  },
  {
    phase: "5. オプトイン開始セット",
    purpose: "登録ページから登録後の導線まで、選択したVSL配置に合わせて入口素材を揃える。",
    assets: ["オプトインLP原稿", "VSL台本", "ヘッドデザイン指示書", "サンキューページ原稿", "自動返信メール"],
    done: "LP原稿、VSL配置に応じた台本、デザイン指示書、登録後ページ/メール原稿が揃っている。",
    boundary: "原稿とデザイン指示書の完成を、田中祐一AI側の一区切りにする。",
    next: "LP実装や細部デザイン、実機への組み込みは本人作業または添削モードで扱う。",
    href: "lp.html",
  },
  {
    phase: "6. 配信導線",
    purpose: "オープンチャット、メルマガ、LINEで、参加者を迷わせず次の行動へ進める。",
    assets: ["価値提供フェーズのLINEオープンチャット", "固定投稿", "通常配信", "メルマガ件名", "配信タイミング"],
    done: "どのタイミングで何を送るか、件名/投稿/配信文が確認できる。",
    boundary: "田中祐一AI側の一区切りは、配信原稿と配信順の完成。",
    next: "配信予約、実機反映、反応を見た微修正は本人作業または添削モードで扱う。",
    href: "line.html",
  },
  {
    phase: "7. 台本制作",
    purpose: "Day1〜Day5のライブで伝える順番、課題、特典、販売前の納得感を作る。",
    assets: ["Day1〜Day5ライブ台本", "課題フォーム", "提出特典", "アーカイブ導線"],
    done: "各日の台本と課題、提出後の導線が揃っている。",
    boundary: "田中祐一AI側の一区切りは、台本原稿と運用素材の完成。",
    next: "当日の話し方、スライド演出、ライブ後の改善は添削モードで扱う。",
    href: "live-scripts.html",
  },
  {
    phase: "8. 販売導線",
    purpose: "販売導線LINE、セールスレター、販売メルマガ、販売期LINE、購入完了までを一続きにする。",
    assets: ["販売導線LINE", "セールスレター原稿", "セールスページヘッド指示", "販売メルマガ", "販売期LINE", "購入完了ページ原稿"],
    done: "販売ページの原稿とデザイン指示書、販売期配信、購入後案内が揃っている。",
    boundary: "原稿とデザイン指示書の完成を、田中祐一AI側の一区切りにする。",
    next: "決済システム設定、ページ実装、細かなデザインブラッシュアップは本人作業または添削モードで扱う。",
    href: "sales-page.html",
  },
  {
    phase: "9. 納品/添削準備",
    purpose: "作成した原稿、台本、構成案、指示書の所在と、次の添削観点をまとめる。",
    assets: ["成果物一覧", "原稿/指示書所在", "添削観点", "更新履歴"],
    done: "どの工程で何が作られ、次に何を添削すべきかが追える。",
    boundary: "田中祐一AI側の一区切りは、原稿・台本・指示書の納品整理。",
    next: "ページ実装、実機への組み込み、細かなデザイン修正は本人作業または添削モードで扱う。",
    href: "assets.html",
  },
];

const researchFlowRows = [
  ["1. ターゲット仮説", "誰が、何と比較して、どこで止まっているのかを仮置きする。", "ターゲット仮説"],
  ["2. ライバル軸の抽出", "見込み客が比較しそうな同業ライバルを5件挙げ、プロダクト競合、インサイト競合、メソッド競合に分ける。", "ライバル候補リスト"],
  ["3. 媒体別リサーチ", "Instagram、YouTube、ホームページで、誰に何を約束し、何を信じさせているかを見る。", "媒体別観察メモ"],
  ["4. ライバルの強訴求", "ライバルが強く訴求している成果、世界観、手段、権威性、実績を抜き出す。", "強訴求リスト"],
  ["5. ついていけない人の特定", "その強訴求についていけない人、重く感じる人、別の入り口を探している人を言語化する。", "未充足顧客リスト"],
  ["6. 別手段の探索", "その人が同じ目的を達成するために探す別手段、避けたい手段、妥協案を整理する。", "メソッド競合/回避行動"],
  ["7. コンテンツホルダー価値", "コンテンツホルダーが提供できる実績、思想、商品、文化、サポートを棚卸しする。", "提供価値リスト"],
  ["8. 強み判定", "その価値がユニークベネフィット型なのか、アドバンテージ型なのかを判定し、伝わる切り口へ変換する。", "強み判定"],
  ["9. コンセプト接続", "空きポジション、旧世界/新世界、真の原因、ベネフィット、訴求表現へ変換する。", "コンセプト素材"],
];

const researchPrincipleRows = [
  ["競合は3種類で見る", "同じ商品カテゴリのプロダクト競合だけでなく、見込み客の心理的な壁であるインサイト競合、同じ目的を達成する別手段であるメソッド競合まで見る。"],
  ["戦うより棲み分ける", "ライバルの強みを否定せず、その強みに合わない人、ついていけない人、別の進み方を探す人を見つける。"],
  ["強みは2種類で判定する", "競合より優れているアドバンテージ型なのか、別の欲求を満たすユニークベネフィット型なのかを分ける。自社サイトやチャレンジ導線では、私のためだと伝わる切り口を優先する。"],
  ["接点から言葉を作る", "コンテンツホルダー側の独自性をそのまま出すのではなく、見込み客の状況と商品の価値が交わる接点を一文にする。"],
];

const competitorResearchRows = [
  {
    name: "YCS 横山直宏さん",
    instagram: "自分らしさ、経営、SNS/ファンマーケティング、活動報告を広く発信。Instagramは約6.7万フォロワー規模の導線として確認。",
    youtube: "YCS会員と主宰・横山さんの対談動画を中心に、受講生の成果やコミュニティの雰囲気を見せる。",
    website: "YCSは、想いや共感を重視し、経営者コミュニティ、実践と継続サポート、オーダーメイド戦略を打ち出す。",
    concept: "強みは、経営者本人の価値観とコミュニティの温かさを軸にしたファン作り。今回の空きは、経営者本人ではなく、裏方でプロモーションを支える実践者ポジション。",
    sources: [["公式サイト", "https://yokoyamanaohiro.com/"], ["YCS", "https://ycs.ctw-hd.com/"], ["Instagram", "https://www.instagram.com/naohiro518/"], ["YouTube", "https://www.youtube.com/@YCS-jissensya"]],
  },
  {
    name: "YouTubeマーケターおさるさん",
    instagram: "SNS集客、ローンチ、海外マーケ、実績訴求を前面に出す。Instagramでは大きな実績と教育者からの転身ストーリーが目立つ。",
    youtube: "YouTubeマーケティング、SNS動画、コンテンツ販売、受講生対談など、動画起点の集客と販売を見せる。",
    website: "おさるマーケティング講座は、セールスファネル、商品設計、集客、YouTube、LINE/メルマガ、ローンチ動画、セールスまで幅広く体系化している。",
    concept: "強みは、SNS動画とコンテンツ販売を高実績で見せるスピード感。今回の空きは、スター性や個人発信の強さを前提にしない会社員向けの裏方導線。",
    sources: [["公式サイト", "https://osaru-marketing.com/"], ["Instagram", "https://www.instagram.com/marketer_osaru1/"], ["YouTube", "https://www.youtube.com/@marketerosaru"]],
  },
  {
    name: "仙道達也さん",
    instagram: "起業家育成、差別化、商品作り、ライブ発信、コーチ/コンサル/セラピスト向けの実績を発信。",
    youtube: "仙道塾、起業家育成、独自コンセプト、差別化、商品設計など、個人起業家向けの教育コンテンツが中心。",
    website: "仙道塾は、マインドセット、魂の差別化、再現性の高い集客ステップ、伴走サポートを訴求する。",
    concept: "強みは、個人の内側から独自コンセプトを作る支援。今回の空きは、自分の魂の商品を作る前段階で、他者の価値を売れる形にするマーケター導線。",
    sources: [["仙道塾", "https://i-shift.com/sendojuku/"], ["Instagram", "https://www.instagram.com/sendo.tatsuya/"], ["YouTube", "https://www.youtube.com/channel/UChHXdmU6rFyqWjDfEILR7ng"]],
  },
  {
    name: "北野哲正さん",
    instagram: "AHAコンセプト、講座ビジネス、コンサル起業、マーケティングコーチ養成、AI活用を発信。",
    youtube: "コンサル型ビジネス、コンテンツビジネス、講座ビジネス、マーケティングコーチ養成に関する発信が中心。",
    website: "公式サイトはマーケティングコーチ養成を軸に、ブログ、成功事例、サービス、無料コンテンツ、メルマガ導線を持つ。",
    concept: "強みは、コンセプト開発とコンサル型ビジネスの上位設計。今回の空きは、講座主宰者になる前に、現場でファネルを動かす右腕人材の道。",
    sources: [["公式サイト", "https://kitanotetsumasa.com/"], ["Instagram", "https://www.instagram.com/tetsumasakitano/"], ["YouTube", "https://www.youtube.com/user/parade01"]],
  },
  {
    name: "才流（サイル）",
    instagram: "個人インフルエンサー型のInstagramより、BtoB企業向けのホームページ、メソッド記事、資料DL、セミナー、書籍・メディア露出が主導線。",
    youtube: "才流のBtoBチャンネルで、新規事業、BtoBマーケティング、営業、施策設計などをコンサルタントが解説する。",
    website: "BtoBマーケティング、法人営業、新規事業開発の支援会社として、サービス、知見、事例、資料、書籍・メディア掲載を体系的に配置している。",
    concept: "強みは、BtoBの方法論、メソッド化、書籍化、法人向け信頼形成。今回の空きは、企業向け専門会社ほど堅くなく、個人が実践で売上導線を体験できる入口。",
    sources: [["公式サイト", "https://sairu.co.jp/"], ["知見", "https://sairu.co.jp/method/"], ["書籍・メディア", "https://sairu.co.jp/media/"], ["YouTube", "https://www.youtube.com/channel/UCp6q-DNpHwyOsHLmINB2ZKw"]],
  },
];

const researchCutRows = [
  ["誰に向けているか", "経営者、個人起業家、講師、コーチ、コンサル、SNSで伸ばしたい人など、対象の違いを見る。"],
  ["何を約束しているか", "売上、集客、ファン化、差別化、コンテンツ販売、講座ビジネス化など、見込み客が欲しい未来を見る。"],
  ["何を信じさせているか", "自分らしさ、SNS動画、魂の差別化、AHAコンセプトなど、行動の前提になる信念を見る。"],
  ["どの媒体を主戦場にしているか", "Instagram、YouTube、ホームページ、メルマガ、LINE、コミュニティの使い方を見る。"],
  ["強訴求についていけない人は誰か", "顔出しが苦手、自分の商品がない、スターになりたくない、単体スキルでは不安という層が残っていないかを見る。"],
  ["その人が探す別手段は何か", "同じ目的を達成したいが、別の方法、低い負荷、裏方の関わり方、実践環境を探していないかを見る。"],
  ["コンテンツホルダーならどうずらすか", "コンテンツホルダーが提供できる価値を、見込み客の状況に合わせて別の切り口へ変換する。"],
];

const positioningLogicRows = [
  ["ライバルの強訴求", "相手がどの市場、媒体、実績、思想、オファーで選ばれているのかを見る。"],
  ["ついていけない人", "その強訴求に魅力を感じつつも、顔出し、実績、商品作り、発信量、難易度、価格、世界観などで止まる人を探す。"],
  ["別手段の探索", "その人が同じ目的を達成するために探す別手段、回避行動、妥協案を整理する。"],
  ["コンテンツホルダーが提供できる価値", "コンテンツホルダーの実績、思想、商品、サポート、環境、文化を、ついていけない人の状況に接続する。"],
  ["強み判定", "競合より優れているアドバンテージ型なのか、別の欲求に刺さるユニークベネフィット型なのかを判定する。"],
  ["訴求表現", "空きポジションを一文で言えるようにし、LP、動画、ステップメール、セールスレターへ展開する。"],
];

const competitorPositionRows = [
  ["YCS 横山直宏さん", "自分らしさ、共感、経営者コミュニティ、ファンマーケティング。", "経営者本人の価値観や発信を前に出すことが重く見える人。", "裏方で関わる、既存の価値を売れる形にする、チームの一員として支える道を探す。", "プロダクトローンチの現場経験、全員で勝つ文化、裏方人材が機能する実践環境。", "ユニークベネフィット型", "自分らしく発信できなくても、社長の右腕として売上を支える道がある。"],
  ["YouTubeマーケターおさるさん", "SNS動画、コンテンツ販売、高い実績、スピード感。", "個人発信力、スター性、SNSで伸ばす前提についていけない人。", "発信者になるより、売れる仕組みを理解し、プロモーションの裏側を担う道を探す。", "ファネル全体を分解し、LP、配信、台本、レターまで制作物として見せられること。", "ユニークベネフィット型", "目立つ人にならなくても、売れる仕組みを支えるWebマーケターになれる。"],
  ["仙道達也さん", "魂の差別化、個人起業家のコンセプト作り、伴走支援。", "自分の商品や強い内的テーマがないため、商品作りから始めることに抵抗がある人。", "自分の商品ではなく、他者の価値を売れる形にするプロデューサー的な実践を探す。", "コンテンツホルダーの商品を、ファネルとコピーで売れる形に変換する技術。", "ユニークベネフィット型", "自分の商品がなくても、価値ある商品を世に出す側に回れる。"],
  ["北野哲正さん", "AHAコンセプト、講座ビジネス、コンサル型ビジネスの上位設計。", "講座主宰者やコンサルとして独立する前提が早すぎると感じる人。", "主宰者になる前に、現場でファネルを動かす右腕人材として経験を積む道を探す。", "上位設計だけでなく、実際のLP、配信、台本、販売導線まで制作する実践環境。", "アドバンテージ型 + ユニークベネフィット型", "講座を売る人になる前に、講座が売れる構造を作る人になれる。"],
  ["才流（サイル）", "BtoB支援会社としての信頼、メソッド、事例、書籍・メディア、資料DL導線。", "法人向けで堅く、未経験個人が最初の実践体験へ入る導線に見えにくい人。", "BtoBマーケの正攻法を学ぶ前に、小さなファネルで売上導線を体験する道を探す。", "体系化された制作物、チャレンジ導線、セールスレターまでを一気通貫で作る型。", "アドバンテージ型", "BtoBの正攻法を学ぶ前に、まず小さなファネルを回してマーケターの感覚を掴む。"],
];

const tanakaProfileMarkdown = `## 講師プロフィール

**田中祐一**

株式会社ザ・リード 創業者

CEO of KATSUO MARKETING FZCO

お金をかけないプロダクトローンチの専門家

1986年1月23日生まれ。

新潟県出身、芝浦工業大卒業。

株式会社NTTデータに就職後コンサルタントとして起業するがあまりに顧客獲得できず貯金800万円を6ヶ月で溶かし切り自信喪失。

その後、「プロダクトローンチ」というマーケティング手法を取り入れ年商300万円のクライアントをわずか1ヶ月で年商4000万円に。その経験を元に、価値あるコンテンツを世の中に送り出す「プロデューサー」として活躍。

クライアントの累計売上を「100億円」以上伸ばしている。

※個人の感想であり成果や効果を保証するものではありません。

「ローンチ講座」では初心者も多く参加する講座にも関わらず受講生250名が100万円〜3000万円以上の売り上げを達成！具体的なノウハウと講座の「雰囲気の良さ」が好評。ビジネス系の講座だがギラギラしないでお互いに応援し合うような土壌づくりが得意。

仲間とともに成長して「全員で勝つ!」がビジネスのモットー。

*実績数値は当社にて調べた数値になります。

## 書籍情報

『僕たちは地味な起業で食っていく。』が海外でも翻訳されました。`;

const configMarkdown = `## 制作判断の基本コンフィグ

この案件では、田中祐一AIは「会社員向けのWebマーケター導線」を作る前提で判断する。

中心に置くのは、派手な起業家像ではなく、社長の右腕として売上を支える裏方の仕事である。地味で平凡、顔出しが苦手、自分の商品がないという状態を弱みとして扱わず、客観視、継続力、支援力、数字を見る力に変換する。

## 最優先で守ること

- 職種型コンセプトとして扱う。
- 「会社員はWEBマーケターを目指しなさい」という一文に戻れるようにする。
- 表に立つスター型起業ではなく、裏方でプロモーションを支える道として描く。
- ノウハウ販売ではなく、最初の実績を作る実践環境を売る。
- ギラギラした成功演出より、静かな実力、チーム、全員で勝つ空気を優先する。

## トーン

言葉は強くしてよい。ただし、煽りすぎない。

読み手に対して「あなたはダメだ」と言うのではなく、「その真面目さや控えめさは、使い方を変えれば武器になる」と伝える。

## 使ってよい表現

- 地味で平凡な会社員
- 才能・経験・顔出し不要
- 社長の右腕
- 裏方Webマーケター
- 売れる仕組み
- プロモーション戦略
- 全員で勝つ
- 実践環境
- 45日間で最初の経験を作る

## 避ける表現

- 誰でも簡単
- 放置で稼げる
- 何もしなくても成功
- 札束、豪邸、高級車で見せる成功
- 顔出しできない人を下げる表現
- 単体スキルだけで稼げるように見える表現

## 制作物ごとの判断

LPでは、登録前の自己認識を変える。顔出しや商品がない人でも、売上に関わる仕事はできると伝える。

サンキューページと自動返信では、メール登録で終わらせず、LINEオープンチャット参加まで進める。

Day1〜Day5では、D.E.C.O.D.E.の全体像を通じて、売上は感覚ではなく構造で作れると理解させる。

セールスページでは、知識量ではなく、実践環境、伴走、チーム、最初の実績作りを中心に置く。

## 最終チェック

読み終わった人が「自分が前に出る起業家にならなくても、売上を支える道なら目指せるかもしれない」と感じるか。

ここに戻って判断する。`;

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

function roadmapStep(sourceStep, name, make, input, output, href = "") {
  return { sourceStep, name, make, input, output, href };
}

const currentFunnelConfig = {
  vslPlacement: "opt-before",
  challengeDays: 5,
  salesPattern: "sales-page-direct",
};

const vslRoadmapByPlacement = {
  "opt-before": {
    step: roadmapStep("23", "オプト前VSLシナリオ作成", "LP上で登録前に見せるVSLの流れ、CTA、視聴後の登録導線を整理する。", "コンセプト・プロフィール・LP訴求・登録CTA", "オプト前VSLシナリオ", "script-opening.html"),
    funnelTag: { label: "集客ページ", target: "part-optin" },
    spot: ["制作物", "オプト前VSL", "opt-before-video"],
  },
  "opt-after": {
    step: roadmapStep("23", "オプト後VSLシナリオ作成", "サンキューページ上で見せるVSLの流れ、CTA、教育グループ参加導線を整理する。", "コンセプト・プロフィール・登録直後案内素材", "オプト後VSLシナリオ", "script-opening.html"),
    funnelTag: { label: "サンクスページ", target: "part-thanks" },
    spot: ["制作物", "サンキューページ上のVSL枠", "thanks"],
  },
};

function currentVslRoadmap() {
  return vslRoadmapByPlacement[currentFunnelConfig.vslPlacement] || null;
}

function currentVslRoadmapItem() {
  return currentVslRoadmap()?.step || null;
}

function currentVslFunnelTag() {
  return currentVslRoadmap()?.funnelTag || { label: "設計シート", target: "" };
}

function currentVslRoadmapSpot() {
  return currentVslRoadmap()?.spot || null;
}

const roadmapPhases = [
  {
    name: "1. 事前設計",
    summary: "Step 1〜6。プロモーションを始める前に、目的・商品・ファネル・KPI・教育グループ・ライブ本数を決める。",
    items: [
      roadmapStep("1", "目的意識を明確にする", "なぜこのプロモーションを行うのかを3〜5項目で書き出す。", "プロフィール・背景情報", "目的リスト", "visual-report.html"),
      roadmapStep("2", "販売したい商品を決める", "販売する商品、価格、期間、販売本数を決める。", "既存の商品・サービス一覧", "商品リスト", "offer.html"),
      roadmapStep("3", "販売ファネルを決める", "今回採用するファネル種別を確定する。", "プロモーションのゴール・販売商品", "ファネル種別", "visual-report.html"),
      roadmapStep("4", "目標KPIの設定", "目標売上から必要な登録数、参加率、購入率を逆算する。", "目標売上・商品単価・販売本数", "KPI逆算メモ", "visual-report.html"),
      roadmapStep("5", "教育グループを決める", "参加者をどこに集めるかを決める。", "ターゲットが普段使う媒体", "教育グループ種別", "line.html"),
      roadmapStep("6", "ライブ回数を決める", "2チャレ / 3チャレ / 4チャレ / 5チャレのどれで進めるかを決める。", "期間・本人の稼働条件", "チャレンジ日数・ライブ本数", "live-scripts.html"),
    ],
  },
  {
    name: "2. コンセプト設計",
    summary: "Step 7〜14。背景情報、ターゲット、リサーチ、ポジショニング、コンセプト、プロフィールを作る。",
    items: [
      roadmapStep("7", "事前情報収集（背景情報）", "本人情報、実績、背景、判断材料を集める。", "プロフィール・音声入力・テキスト", "プロフィールシート", "config.html"),
      roadmapStep("8", "ターゲットシート作成", "見込み客の悩み、願望、動く条件を整理する。", "背景情報", "ターゲットシート", "target.html"),
      roadmapStep("9", "ライバル情報の収集", "同業ライバルの訴求、媒体、商品、強みを整理する。", "市場名・キーワード・競合候補", "ライバル分析シート", "research.html"),
      roadmapStep("10", "空いている訴求の特定", "ライバルの強訴求から、ついていけない人と狙える余白を整理する。", "ターゲット情報・ライバル情報", "空き訴求リスト", "research.html"),
      roadmapStep("11", "ポジショニングの作成", "ターゲット、ライバル、コンテンツホルダーの強みをつなぎ、狙う立ち位置を言語化する。", "ターゲット・ライバル・背景情報", "ポジショニングシート", "concept.html"),
      roadmapStep("12", "プロモーションコンセプト", "LP、配信、台本、販売ページへ展開する中核コピーを決める。", "ポジショニング", "プロモコンセプト", "concept.html"),
      roadmapStep("13", "プロモヘッダーバナーの作成", "プロモーションの見た目に使うヘッドコピーと画像方向を決める。", "コンセプト・配色・サンプルデザイン", "ヘッド指示書", "head.html"),
      roadmapStep("14", "プロフィール作成（ブラッシュアップ）", "ポジショニングに合わせて信頼形成用プロフィールを整える。", "背景情報・コンセプト", "プロフィール文", "config.html"),
    ],
  },
  {
    name: "3. オファー構築",
    summary: "Step 15〜16。提供内容、期間、価格、特典、保証をオファーシートへまとめる。",
    items: [
      roadmapStep("15", "本命商品オファー", "商品名、特徴、サポート期間、価格、特典、保証を整理する。", "コンセプト・ターゲット・BEFORE/AFTER・期間・価格", "オファーシート", "offer.html"),
      roadmapStep("16", "フロント商品オファー", "必要な場合のみ、入口側の商品や中間商品の提供内容を整理する。", "コンセプト・ターゲット", "フロント商品オファー", "offer.html"),
    ],
  },
  {
    name: "4. コンテンツ設計",
    summary: "Step 17〜26。5日間の内容、課題、特典、コアストーリー、登録直後の案内素材を作る。",
    items: [
      roadmapStep("17", "お客様の声ファイル生成", "既存の感想、実績、体験談を素材として使える形にする。", "既存の感想・実績・体験談", "お客様の声リスト", "assets.html"),
      roadmapStep("18", "5日間コンテンツ設計", "Day1〜Day5のテーマと小タイトルを決める。", "コンセプトシート・ターゲットシート", "5日間テーマ一覧", "live-scripts.html"),
      roadmapStep("19", "チャレンジ課題＆特典設計", "各日の課題、提出特典、コンプリート特典を決める。", "コンセプト・ターゲット", "課題/特典設計", "live-scripts.html"),
      roadmapStep("20", "スケジュール決め", "募集開始日、ライブ日、販売開始日、販売終了日を決める。", "開始日・販売終了日", "プロモ全体カレンダー", "visual-report.html"),
      roadmapStep("21", "ライブ1コアストーリー", "Day1の核になるストーリー骨格を作る。", "コンセプト・ターゲット", "コアストーリーシート", "live-scripts.html"),
      roadmapStep("22", "中間オファー構築", "説明会や個別相談を挟む場合の中間オファーを整理する。", "本命オファー", "中間オファーシート", "offer.html"),
      currentVslRoadmapItem(),
      roadmapStep("24", "特典の作成（実体）", "特典タイトル案をもとに、配布できる内容へ落とす。", "特典タイトル案", "特典コンテンツ", "live-scripts.html"),
      roadmapStep("25", "特典サムネイル生成", "特典を見せるためのサムネイル方向を決める。", "特典タイトル・参考サムネ", "特典サムネイル指示書", "head.html"),
      roadmapStep("26", "登録直後案内素材を用意する", "登録直後に次の一歩へ進ませる案内素材を用意する。", "登録直後案内シナリオ", "登録直後案内素材", "thank-you-copy.html"),
    ].filter(Boolean),
  },
  {
    name: "5. オプトインLPの作成",
    summary: "Step 27〜32。LP原稿、画像指示、実装指示、サンキューページ原稿を作る。",
    items: [
      roadmapStep("27", "オプトインLP ライティング", "ファーストビュー、共感、ベネフィット、参加理由、CTAを原稿化する。", "コンフィグ・VSLシナリオ・参考LP・プロモコンセプト", "オプトインLP原稿", "lp.html"),
      roadmapStep("28", "画像指示書の作成", "LPに必要な画像、ヘッド、CTA、スマホ表示、参考サンプルをまとめる。", "オプトインLP原稿", "LPヘッドデザイン指示書", "head.html"),
      roadmapStep("29", "画像素材の作成", "必要な場合のみ、LPで使う画像素材を作る。", "LPヘッドデザイン指示書", "LP用画像素材", "head.html"),
      roadmapStep("30", "HTMLコードの生成と公開", "実装担当へ渡せるHTML化指示と公開先メモを作る。", "LP原稿・画像素材", "LP実装指示書", "lp.html"),
      roadmapStep("31", "サンキューページライティング", "登録後に教育グループへ進ませるサンキューページ本文を作る。", "コンセプト・登録直後案内素材", "サンキューページ原稿", "thank-you-copy.html"),
      roadmapStep("32", "サンキューページ作成", "サンキューページの実装指示と遷移先を整理する。", "サンキューページ原稿・教育グループURL", "サンキューページ実装指示書", "thank-you-copy.html"),
    ],
  },
  {
    name: "6. 集客素材の作成",
    summary: "Step 33〜40。教育グループ、固定投稿、自動返信、紹介文、広告素材を用意する。",
    items: [
      roadmapStep("33", "教育グループ（オープンチャット）作成", "参加場所を作り、登録後に案内できる状態にする。", "コンセプト・グループ名案", "教育グループURL", "line.html"),
      roadmapStep("34", "オープンチャットの固定メッセージを整える", "参加者が最初に見る固定投稿を作る。", "ノート用文章・掲示板用文章", "固定投稿", "line.html"),
      roadmapStep("35", "オープンチャット事前案内の整備", "ライブ開始前までに送る事前案内文を作る。", "コンセプト・VSLシナリオ・特典・スケジュール", "事前案内文", "line.html"),
      roadmapStep("36", "オプト後自動返信メール", "登録直後に教育グループへ戻すメール文面を作る。", "コンセプト・登録直後案内素材", "自動返信メール文面", "optin-after-mails.html"),
      roadmapStep("37", "セットアップライティング", "メルマガやSNSで登録ページへ送る紹介文を作る。", "ターゲット情報・LP原稿", "紹介文章", "traffic-mails.html"),
      roadmapStep("38", "セットアップ用画像生成", "必要な場合のみ、投稿や紹介に使う画像方向を作る。", "紹介文章", "投稿用画像指示書", "head.html"),
      roadmapStep("39", "広告用文章", "広告を使う場合に必要なコピー案を作る。", "コンセプト・ターゲット・Day1シナリオ", "広告コピー案", "assets.html"),
      roadmapStep("40", "広告用クリエイティブ", "広告を使う場合に必要な画像・動画方向を作る。", "広告コピー案", "広告クリエイティブ指示書", "assets.html"),
    ],
  },
  {
    name: "7. ライブ台本の作成",
    summary: "Step 41〜47。Day1〜Day5の台本と課題フォームを作る。",
    items: [
      roadmapStep("41", "ライブ1シナリオ作成", "Day1の導入、本編、課題、次回予告を台本化する。", "コンセプト・ターゲット・コアストーリー・プロフィール・お客様の声", "Day1ライブ台本", "live-scripts.html"),
      roadmapStep("42", "ライブ2シナリオ作成", "Day2の導入、本編、課題、次回予告を台本化する。", "Day1台本・コンセプト類・オファー", "Day2ライブ台本", "live-scripts.html"),
      roadmapStep("43", "ライブ3シナリオ作成", "Day3の導入、本編、課題、次回予告を台本化する。", "Day1〜Day2台本・コンセプト類・オファー", "Day3ライブ台本", "live-scripts.html"),
      roadmapStep("44", "ライブ4シナリオ作成", "Day4の導入、本編、課題、次回予告を台本化する。", "Day1〜Day3台本・コンセプト類・オファー", "Day4ライブ台本", "live-scripts.html"),
      roadmapStep("45", "ライブ5シナリオ作成（2ステップ版）", "説明会や個別相談へ接続する場合のDay5台本を作る。", "Day1〜Day4台本・本命オファー", "Day5台本（2ステップ版）", "live-scripts.html"),
      roadmapStep("46", "ライブ5シナリオ作成（1ステップ版）", "販売ページへ直接接続する場合のDay5台本を作る。", "Day1〜Day4台本・本命オファー", "Day5台本（1ステップ版）", "live-scripts.html"),
      roadmapStep("47", "チャレンジ課題のアウトプットフォーム", "各日の課題提出先を用意する。", "課題内容", "回答フォームURL", "live-scripts.html"),
    ],
  },
  {
    name: "8. プロモ素材の作成",
    summary: "Step 48〜55。配信、LINE投稿、販売ページ、購入後案内を作る。",
    items: [
      roadmapStep("48", "リマインドメール", "教育グループ登録誘導とライブ前リマインドを作る。", "スケジュール・コンセプト", "リマインド文面", "line.html"),
      roadmapStep("49", "LINEオープンチャット投稿文章", "期間中に送る固定投稿と通常配信を時系列で作る。", "スケジュール・課題・ライブ内容", "LINE投稿文", "line.html"),
      roadmapStep("50", "説明会ページ（2ステップ販売用）", "説明会や個別相談を挟む場合の申込みページ原稿を作る。", "中間オファー・本命オファー", "説明会ページ原稿", "sales-page.html"),
      roadmapStep("51", "説明会ページ自動返信", "説明会申込み後の日時確認、準備事項、リマインドを作る。", "申込み完了情報", "説明会自動返信メール", "sales-page.html"),
      roadmapStep("52", "説明会ページサンキューページ", "説明会申込み後のサンキューページ原稿を作る。", "申込み完了情報", "説明会サンキューページ原稿", "sales-page.html"),
      roadmapStep("53", "1ステップ販売ページ", "販売ページ直販用のセールスレター原稿を作る。", "本命オファー・コンセプト・証拠素材", "セールスレター原稿", "sales-page.html"),
      roadmapStep("54", "1ステップ販売ページ サンキュー", "購入後に必要な案内をページ原稿にする。", "購入完了情報", "購入完了ページ原稿", "sales-page.html"),
      roadmapStep("55", "1ステップ販売ページ 自動返信", "購入後に送る自動返信メールを作る。", "購入完了情報", "購入後自動返信メール", "purchase-complete.html"),
    ],
  },
  {
    name: "9. 本番運用",
    summary: "Step 56〜65。素材完成後に、運用・販売・法務・改善で確認する項目。",
    items: [
      roadmapStep("56", "集客の実施", "用意した紹介文、投稿、広告素材から登録ページへ送る。", "紹介文・広告素材・サンキューページ・教育グループ", "目標オプト数", "visual-report.html"),
      roadmapStep("57", "ライブの実施", "Day1〜Day5の台本に沿ってライブ、課題、質問対応を行う。", "Day1〜Day5台本", "ライブ実施ログ", "live-scripts.html"),
      roadmapStep("58", "限定性のプッシュ（1ステップ販売）", "販売ページ直販の場合の販売開始、締切、終了案内を作る。", "販売ページ・限定特典", "販売期配信", "sales-mails.html"),
      roadmapStep("59", "限定性のプッシュ（2ステップ販売）", "説明会や個別相談へ進む場合の締切案内を作る。", "説明会ページ・視聴期限", "説明会誘導配信", "sales-mails.html"),
      roadmapStep("60", "説明会申込み後のステップ＆リマインド", "説明会申込み後のリマインド配信を作る。", "申込者情報・説明会日時", "説明会リマインド", "sales-mails.html"),
      roadmapStep("61", "販売スライド（2ステップ用）", "説明会で使うスライド構成案を作る。", "本命オファー・お客様の声", "販売スライド指示書", "sales-page.html"),
      roadmapStep("62", "セールストーク（クロージング）", "個別販売がある場合の相談前後の会話台本を整える。", "販売スライド・想定問答", "セールストーク台本", "sales-page.html"),
      roadmapStep("63", "特商法・プライバシーポリシー", "販売条件に合わせて必要ページを確認する。", "事業者情報・販売条件", "特商法/プライバシーポリシー", "sales-page.html"),
      roadmapStep("64", "法定書面", "該当する場合のみ概要書面と契約書面を用意する。", "商品情報・提供条件", "概要書面/契約書面", "sales-page.html"),
      roadmapStep("65", "セールス改善（次回プロモへ）", "成約データ、離脱データ、録画から次回の改善点をまとめる。", "セールス録画・成約データ・離脱データ", "改善レポート", "visual-report.html"),
    ],
  },
];

const contentVolumeRows = [
  ["動画/ライブ", "6本", "VSL台本1本 + Day1〜Day5ライブ5本"],
  ["チャレンジ課題", "5本", "Day1〜Day5で課題あり。提出数をKPIとして見る。"],
  ["課題提出特典", "5点想定", "課題提出の動機づけと完走率を上げる。"],
  ["オプトイン開始セット", "5点", "LP本文、VSL台本、ヘッド指示、サンキュー、自動返信メール。"],
  ["LINEオープンチャット", "固定3件 + 計画73件", "固定ノート、事務連絡、ライブ案内、課題、Q&A。"],
  ["販売導線", "レター1本 + 公式LINE8通", "Day5後に公式LINEへ移動し、期間限定レターを公開する。"],
];

const scheduleRows = [
  ["準備", "全体設計、コンセプト、オファー、コンテンツ設計を固める。"],
  ["オプトイン開始", "選択したVSL配置に合わせ、LP、サンキュー、自動返信でLINEオープンチャットへ誘導する。"],
  ["参加前", "固定ノート、事務連絡、ライブ前リマインドで参加率を上げる。"],
  ["Day1〜Day5", "毎日ライブ、課題、特典、Q&Aで価値提供する。"],
  ["Day5後", "レター希望者を公式LINEへ移動させる。"],
  ["販売期", "公式LINE内で期間限定セールスレターを公開し、販売期配信と購入完了案内を出す。"],
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

function normalizeOutputTerms(text = "") {
  return String(text)
    .replaceAll(deprecatedGreetingVideo, "オプト後VSL")
    .replaceAll(deprecatedThanksVideo, "オプト後VSL")
    .replaceAll(deprecatedTeaseVideo, "オプト後VSL")
    .replaceAll(deprecatedOptInVsl, "オプト前VSL")
    .replaceAll(deprecatedOptAfterVsl, "オプト後VSL");
}

function hideFinishedUrls(text = "") {
  return String(text).replace(/https?:\/\/[^\s)）<>"']+/g, "（導線URLを設定）");
}

function stripSourceMeta(text = "") {
  return String(text)
    .replace(/^>?\s*(原稿URL|該当URL|該当動画|取得元|生データ|配信一覧対応):.*$/gm, "")
    .replace(/^種別:.*$/gm, "")
    .replace(/^元スプレッドシート.*$/gm, "")
    .replace(/^Kind: captions$/gm, "")
    .replace(/^Language: ja$/gm, "")
    .replace(/^(Produced by|Version|Licensed to|Security Trace ID|Generated by):.*$/gm, "")
    .replace(/^カテゴリ:\s*(.+?)（実ログ反映）$/gm, "カテゴリ: $1")
    .replace(/^このスライドはGenspark上.*確認済みです（\d{4}-\d{2}-\d{2}）。$/gm, "")
    .replace(/実録書き起こし/g, "台本")
    .replace(/書き起こし/g, "本文")
    .replace(/文字起こし/g, "本文")
    .replace(/実ログ/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

function cleanVisibleFileRefs(text = "") {
  return String(text)
    .replace(/\[([^\]]+?)\]\(([^)]*?\.md[^)]*?)\)/g, "$1")
    .replace(/\.md/g, "");
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
  return normalizeOutputTerms(heading || path.basename(relative, ".md"));
}

function meta(text, key) {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() || "";
}

function cleanMetaValue(value = "", fallback = "") {
  const cleaned = stripSourceMeta(normalizeOutputTerms(value))
    .replace(/（実ログ反映）/g, "")
    .replace(/\s*\/\s*実ログ\s*/g, "")
    .replace(/^実ログ$/g, "")
    .trim();
  return cleaned || fallback;
}

function bodyExcerpt(relative, limit = 360) {
  const text = read(relative)
    .replace(/^#\s+.+$/m, "")
    .replace(/^Produced by[\s\S]*$/m, "")
    .replace(/^---$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const compact = cleanVisibleFileRefs(hideFinishedUrls(stripSourceMeta(normalizeOutputTerms(text.replace(/\s+\n/g, "\n").trim()))));
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
}

function bodyFull(relative, limit = 36000) {
  const text = read(relative)
    .replace(/^Produced by[\s\S]*$/m, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (!text) return "";
  const normalized = stripSourceMeta(normalizeOutputTerms(text));
  return normalized.length > limit ? `${normalized.slice(0, limit).trim()}\n\n（以下、原本に続きます）` : normalized;
}

function inlineMarkdown(value = "") {
  const visibleText = cleanVisibleFileRefs(value);
  return esc(visibleText)
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
  if (!markdown) return `<p class="muted">素材が見つかりません。</p>`;
  return `<div class="article">${markdownToHtml(markdown)}</div>`;
}

function copyArticleFrom(relative, limit = 36000) {
  const text = read(relative);
  const body = text.includes("\n---")
    ? text.split(/^---$/m).slice(1).join("---")
    : text.replace(/^#\s+.+$/m, "");
  const markdown = stripSourceMeta(normalizeOutputTerms(body))
    .replace(/^Produced by[\s\S]*$/m, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (!markdown) return `<p class="muted">本文が見つかりません。</p>`;
  const clipped = markdown.length > limit ? `${markdown.slice(0, limit).trim()}\n\n（以下、原本に続きます）` : markdown;
  return `<div class="article copy-article">${markdownToHtml(clipped)}</div>`;
}

function sourceDetails(label, relative, limit = 36000, open = false) {
  return `<details ${open ? "open" : ""}><summary>${esc(label)}</summary><div class="details-body">${articleFrom(relative, limit)}</div></details>`;
}

function sourceDetailsList(items, openFirst = true) {
  if (!items.length) return `<p class="muted">素材が見つかりません。</p>`;
  return `<div class="full-source-list">${items.map((relative, index) => sourceDetails(titleOf(relative), relative, 36000, openFirst && index === 0)).join("")}</div>`;
}

function sourceSummaryList(items) {
  if (!items.length) return `<p class="muted">素材が見つかりません。</p>`;
  return `<div class="folder-list">${items.map((relative) => `<a href="#"><span>素材</span><strong>${esc(titleOf(relative))}</strong><small>${esc(bodyExcerpt(relative, 160))}</small></a>`).join("")}</div>`;
}

function parseMail(relative) {
  const text = read(relative);
  const title = titleOf(relative);
  const isLine = relative.includes("/公式LINE/");
  const phase = relative.includes("集客前メッセージ") || relative.includes("フェーズ0")
    ? "集客前"
    : relative.includes("オプトイン後メルマガ") || relative.includes("フェーズ1")
      ? "登録後"
      : isLine
        ? "公式LINE"
        : "販売期";
  const day = cleanMetaValue(meta(text, "配信日") || meta(text, "配信実績日") || meta(text, "配信タイミング"));
  const time = cleanMetaValue(meta(text, "配信時間") || meta(text, "配信実績時刻"));
  const category = cleanMetaValue(meta(text, "カテゴリ"), phase);
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

function mailSortValue(mail) {
  const name = path.basename(mail.relative);
  const numericPrefix = name.match(/^(\d+)_/)?.[1];
  if (numericPrefix) return Number(numericPrefix);
  if (mail.time.includes("即時") || mail.day.includes("登録直後") || mail.title.includes("必ずご確認")) return 0;
  const hour = mail.time.match(/(\d+)時間/)?.[1];
  if (hour) return Number(hour);
  return 999;
}

function materialMailList(relative) {
  return list(relative)
    .map(parseMail)
    .sort((a, b) => mailSortValue(a) - mailSortValue(b) || a.relative.localeCompare(b.relative, "ja"));
}

function parseSpot(relative) {
  const name = path.basename(relative, ".md");
  const title = titleOf(relative);
  const phase = relative.includes("フェーズ1") ? "ライブ前" : relative.includes("フェーズ2") ? "価値提供中" : relative.includes("フェーズ3") ? "販売期" : "通常配信";
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

function productionSideNav(active, config) {
  const categoryLinks = [
    ["assets.html", "A", "制作物一覧", "カテゴリ"],
    ["lp.html", "L", "集客素材", "LP/VSL"],
    ["value.html", "V", "価値提供素材", "LINE/ライブ"],
    ["sales-page.html", "S", "販売素材", "販売"],
  ];
  const categoryActive = config.categoryHref || active;
  const category = categoryLinks.find(([href]) => href === categoryActive);
  const isCategoryPage = active === categoryActive;
  const backHref = isCategoryPage ? "assets.html" : categoryActive;
  const backLabel = isCategoryPage ? "制作物一覧" : `${category?.[2] || config.title}一覧`;
  return `<aside class="side production-side">
    <div class="brand"><div class="brand-mark">祐</div><div><p class="brand-title">田中祐一AI</p><span class="brand-sub">WEBマーケターへの道</span></div></div>
    <a class="back-link" href="${esc(backHref)}"><span>←</span><strong>1つ上に戻る</strong><small>${esc(backLabel)}</small></a>
    <div class="nav-section">制作物</div>
    ${categoryLinks.map(([href, code, label, sub]) => `<a class="nav-link ${href === categoryActive ? "active" : ""}" href="${href}"><span class="nav-num">${code}</span><span>${label}<small>${sub}</small></span></a>`).join("")}
    <div class="nav-section">${esc(config.title)}</div>
    ${config.rows.map(([label, metaLabel, _detail, href]) => `<a class="nav-link material-nav-link ${href === active ? "active" : ""}" href="${esc(href)}"><span class="nav-num">${esc(label.slice(0, 1))}</span><span>${esc(label)}<small>${esc(metaLabel)}</small></span></a>`).join("")}
  </aside>`;
}

function nav(active) {
  const subnav = productionSubnav[active];
  if (subnav) return productionSideNav(active, subnav);
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
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="googlebot" content="noindex, nofollow, noarchive">
  <title>${esc(title)} | WEBマーケターへの道</title>
  <link rel="stylesheet" href="portal.css?v=20260618-full-package">
</head>
<body class="report-page">
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

function readerPage({ file, title, eyebrow, lead, sidebar, body }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="googlebot" content="noindex, nofollow, noarchive">
  <title>${esc(title)} | WEBマーケターへの道</title>
  <link rel="stylesheet" href="portal.css?v=20260618-full-package">
</head>
<body class="reader-page">
<div class="reader-layout">
${sidebar}
<main class="reader-main"><div class="reader-wrap">
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

function inlineList(items) {
  return `<ul class="mini-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function status(label) {
  const cls = label.includes("要") ? "need" : label.includes("順次") ? "todo" : "";
  return `<span class="status ${cls}">${esc(label)}</span>`;
}

function source(relative) {
  return "";
}

function linkedAssetTable(rows) {
  return `<table class="asset-table"><thead><tr><th>素材</th><th>役割</th><th>確認ページ</th></tr></thead><tbody>${rows.map(([label, detail, href]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(detail)}</td><td><a href="${esc(href)}">開く</a></td></tr>`).join("")}</tbody></table>`;
}

function vslPlacementTable() {
  return `<table class="asset-table"><thead><tr><th>選択肢</th><th>配置</th><th>選ぶ条件</th><th>完成させるもの</th></tr></thead><tbody>${vslPlacementRows.map(([label, placement, condition, output]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(placement)}</td><td>${esc(condition)}</td><td>${esc(output)}</td></tr>`).join("")}</tbody></table>`;
}

function productionAssetTable(rows) {
  return `<table class="asset-table"><thead><tr><th>制作物</th><th>区分</th><th>作るもの</th></tr></thead><tbody>${rows.map(([label, type, detail]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(type)}</td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table>`;
}

function materialShelf(rows) {
  return `<div class="material-shelf">${rows.map(([label, metaLabel, detail, href, folder]) => `<a class="material-card" href="${esc(href)}">
<span class="meta">${esc(metaLabel)}</span>
<strong>${esc(label)}</strong>
<span>${esc(detail)}</span>
</a>`).join("")}</div>`;
}

function materialFolderTable(rows) {
  return `<table class="asset-table compact-table"><thead><tr><th>素材</th><th>区分</th><th>確認ページ</th></tr></thead><tbody>${rows.map(([label, metaLabel, , href]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(metaLabel)}</td><td><a href="${esc(href)}">開く</a></td></tr>`).join("")}</tbody></table>`;
}

function categoryShelf(rows) {
  return `<div class="material-shelf">${rows.map((row) => `<a class="material-card category-card" href="${esc(row.href)}">
<span class="meta">${esc(row.meta)}</span>
<strong>${esc(row.label)}</strong>
<span>${esc(row.detail)}</span>
${pills(row.items)}
</a>`).join("")}</div>`;
}

function slideInstructionTable(rows) {
  return `<table class="asset-table compact-table"><thead><tr><th>スライド</th><th>指示内容</th></tr></thead><tbody>${rows.map(([label, detail]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table>`;
}

function visibleFunnelMap(nodes = visibleFunnelNodes) {
  return `<div class="funnel-map" aria-label="今回のファネルの形">
<div class="funnel-map-head"><span>今回のファネル</span><strong>チャレンジローンチ / ワンステップ販売</strong></div>
<div class="funnel-track">${nodes.map(([label, timing, detail, href, phase], index) => `<a class="funnel-node" href="${esc(href)}">
<span class="node-index">${String(index + 1).padStart(2, "0")}</span>
<span class="node-body"><span class="node-meta">${esc(timing)} / ${esc(phase)}</span><strong>${esc(label)}</strong><span>${esc(detail)}</span></span>
</a>`).join("")}</div>
</div>`;
}

function selectedAcquisitionPattern() {
  return acquisitionPatternRows.find((row) => row.label === activeFunnelFormat.acquisitionPattern) || acquisitionPatternRows[0];
}

function selectedSalesPattern() {
  return salesPatternRows.find((row) => row.label === activeFunnelFormat.salesPattern) || salesPatternRows[0];
}

function selectedAcquisitionMedia() {
  return acquisitionMediaRows.find((row) => row.label === activeFunnelFormat.acquisitionMedia) || acquisitionMediaRows[0];
}

function formatNode(label, detail = "", href = "") {
  const content = `<span>${esc(label)}</span>${detail ? `<small>${esc(detail)}</small>` : ""}`;
  return href ? `<a class="format-node" href="${esc(href)}">${content}</a>` : `<div class="format-node">${content}</div>`;
}

function formatChain(nodes, href = "") {
  return `<div class="format-chain">${nodes.map((node, index) => formatNode(node, index === 0 ? "作る場所" : "", index === 0 ? href : "")).join("")}</div>`;
}

function challengeDayStrip() {
  const days = ["Day1", "Day2", "Day3", "Day4", "Day5"];
  return `<div class="day-strip">${days.map((day) => `<span class="day-chip ${day === activeFunnelFormat.nextLiveDay ? "next" : ""}">${esc(day)}${day === activeFunnelFormat.nextLiveDay ? "<small>次ライブ</small>" : ""}</span>`).join("")}</div>`;
}

function funnelFormatBoard() {
  const acquisition = selectedAcquisitionPattern();
  const sales = selectedSalesPattern();
  const media = selectedAcquisitionMedia();
  return `<div class="funnel-format-board" aria-label="今回のファネル設定">
<div class="format-summary">
  <span>今回の案件設定</span>
  <strong>${esc(activeFunnelFormat.acquisitionPattern)} / ${esc(activeFunnelFormat.challengePattern)} / 次ライブ ${esc(activeFunnelFormat.nextLiveDay)} / ${esc(activeFunnelFormat.salesPattern)} / ${esc(activeFunnelFormat.acquisitionMedia)}</strong>
</div>
<div class="format-stages">
  <section class="format-stage">
    <div class="stage-head"><span>01 集客</span><strong>${esc(acquisition.label)}</strong></div>
    ${formatChain(acquisition.flow, "lp.html")}
    <p>今回の集客素材は${esc(media.label)}、オプトインLP原稿、LPヘッドデザイン指示書、VSL台本、オプトイン後メルマガ、サンキューページ原稿、紹介用文章、集客前メッセージです。</p>
  </section>
  <section class="format-stage">
    <div class="stage-head"><span>02 価値提供</span><strong>${esc(activeFunnelFormat.challengePattern)}</strong></div>
    ${challengeDayStrip()}
    <p>Day1〜Day5のライブ台本、配信、課題、特典を素材として管理します。</p>
  </section>
  <section class="format-stage">
    <div class="stage-head"><span>03 販売</span><strong>${esc(sales.label)}</strong></div>
    ${formatChain(sales.nodes, "sales-page.html")}
    <p>セールスレター原稿、販売期配信、セールスページ指示書、購入完了ページ原稿を管理します。</p>
  </section>
</div>
</div>`;
}

function acquisitionPatternTable() {
  return `<table class="asset-table"><thead><tr><th>集客パターン</th><th>位置づけ</th><th>配置</th><th>選ぶ条件</th><th>作る素材</th></tr></thead><tbody>${acquisitionPatternRows.map((row) => `<tr class="${row.label === activeFunnelFormat.acquisitionPattern ? "active-row" : ""}"><td><strong>${esc(row.label)}</strong></td><td>${esc(row.position)}</td><td>${esc(row.placement)}</td><td>${esc(row.chooseWhen)}</td><td>${pills(row.assets)}</td></tr>`).join("")}</tbody></table>`;
}

function challengePatternTable() {
  return `<table class="asset-table"><thead><tr><th>何チャレ</th><th>位置づけ</th><th>ライブ範囲</th><th>次ライブ候補</th><th>作る素材の考え方</th></tr></thead><tbody>${challengePatternRows.map((row) => `<tr class="${row.label === activeFunnelFormat.challengePattern ? "active-row" : ""}"><td><strong>${esc(row.label)}</strong></td><td>${esc(row.position)}</td><td>${esc(row.range)}</td><td>${esc(row.next)}</td><td>${esc(row.detail)}</td></tr>`).join("")}</tbody></table>`;
}

function salesPatternTable() {
  return `<table class="asset-table"><thead><tr><th>販売形態</th><th>位置づけ</th><th>選ぶ条件</th><th>作る素材</th><th>導線</th></tr></thead><tbody>${salesPatternRows.map((row) => `<tr class="${row.label === activeFunnelFormat.salesPattern ? "active-row" : ""}"><td><strong>${esc(row.label)}</strong></td><td>${esc(row.position)}</td><td>${esc(row.chooseWhen)}</td><td>${esc(row.output)}</td><td>${esc(row.nodes.join(" → "))}</td></tr>`).join("")}</tbody></table>`;
}

function acquisitionMediaTable() {
  return `<table class="asset-table"><thead><tr><th>集客メディア</th><th>位置づけ</th><th>整理すること</th><th>完成アウトプット</th></tr></thead><tbody>${acquisitionMediaRows.map((row) => `<tr class="${row.label === activeFunnelFormat.acquisitionMedia ? "active-row" : ""}"><td><strong>${esc(row.label)}</strong></td><td>${esc(row.position)}</td><td>${esc(row.detail)}</td><td>${esc(row.output)}</td></tr>`).join("")}</tbody></table>`;
}

function chapterAssetTable() {
  return `<table class="asset-table chapter-asset-table"><thead><tr><th>章</th><th>素材集</th><th>主な確認ページ</th></tr></thead><tbody>${chapterAssetRows.map(([chapter, assets, href]) => `<tr><td><strong>${esc(chapter)}</strong></td><td>${esc(assets)}</td><td><a href="${esc(href)}">開く</a></td></tr>`).join("")}</tbody></table>`;
}

function productionLayerList() {
  return `<div class="production-layers">${productionLayerRows.map((row, index) => `<details class="layer-details" ${index === 0 ? "open" : ""}>
<summary><span class="concept-number">${String(index + 1).padStart(2, "0")}</span><span><span class="meta">Asset Layer</span><strong>${esc(row.layer)}</strong></span></summary>
<div class="details-body">
<p>${esc(row.purpose)}</p>
<table class="asset-table compact-table"><thead><tr><th>素材</th><th>役割</th><th>確認</th></tr></thead><tbody>
${row.items.map(([label, detail, href]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(detail)}</td><td><a href="${esc(href)}">開く</a></td></tr>`).join("")}
</tbody></table>
</div>
</details>`).join("")}</div>`;
}

function productionFlowList() {
  return `<div class="concept-sequence production-flow">${productionFlowRows.map((row, index) => `<article class="concept-item production-flow-item">
<span class="concept-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<span class="meta">Production Flow</span>
<h3>${esc(row.phase)}</h3>
<p>${esc(row.purpose)}</p>
${pills(row.assets)}
<table class="asset-table compact-table production-flow-table"><tbody>
<tr><th>完了条件</th><td>${esc(row.done)}</td></tr>
<tr><th>AI側の区切り</th><td>${esc(row.boundary)}</td></tr>
<tr><th>次の作業領域</th><td>${esc(row.next)}</td></tr>
<tr><th>確認ページ</th><td><a href="${esc(row.href)}">開く</a></td></tr>
</tbody></table>
</div>
</article>`).join("")}</div>`;
}

function sourceLinks(items) {
  return items.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join(" / ");
}

function competitorResearchTable() {
  return `<div class="concept-sequence">${competitorResearchRows.map((row, index) => `<article class="concept-item">
<span class="concept-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<span class="meta">Competitor</span>
<h3>${esc(row.name)}</h3>
<table class="asset-table compact-table"><tbody>
<tr><th>Instagram</th><td>${esc(row.instagram)}</td></tr>
<tr><th>YouTube</th><td>${esc(row.youtube)}</td></tr>
<tr><th>ホームページ</th><td>${esc(row.website)}</td></tr>
<tr><th>コンセプトへの示唆</th><td>${esc(row.concept)}</td></tr>
<tr><th>参照</th><td>${sourceLinks(row.sources)}</td></tr>
</tbody></table>
</div>
</article>`).join("")}</div>`;
}

function competitorPositionCards() {
  return `<div class="concept-sequence">${competitorPositionRows.map(([name, strongAppeal, dropout, alternative, holderValue, strengthType, appeal], index) => `<article class="concept-item">
<span class="concept-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<span class="meta">Positioning</span>
<h3>${esc(name)}</h3>
<table class="asset-table compact-table"><tbody>
<tr><th>ライバルの強訴求</th><td>${esc(strongAppeal)}</td></tr>
<tr><th>ついていけない人</th><td>${esc(dropout)}</td></tr>
<tr><th>探している別手段</th><td>${esc(alternative)}</td></tr>
<tr><th>コンテンツホルダー価値</th><td>${esc(holderValue)}</td></tr>
<tr><th>強み判定</th><td>${esc(strengthType)}</td></tr>
<tr><th>訴求表現</th><td>${esc(appeal)}</td></tr>
</tbody></table>
</div>
</article>`).join("")}</div>`;
}

function roadmapJump(phases) {
  return `<nav class="jump-nav">${phases.map((phase, index) => `<a href="#phase-${index + 1}">${esc(phase.name)}</a>`).join("")}</nav>`;
}

function roadmapFunnelTag(item) {
  const step = Number(item.sourceStep);
  if (step <= 22) return { label: "設計シート", target: "" };
  if (step >= 23 && step <= 26) {
    if (step === 23) return currentVslFunnelTag();
    if (step === 26) return { label: "サンクスページ", target: "part-thanks" };
    return { label: "教育グループ", target: "part-value" };
  }
  if (step >= 27 && step <= 30) return { label: "集客ページ", target: "part-optin" };
  if (step >= 31 && step <= 32) return { label: "サンクスページ", target: "part-thanks" };
  if (step >= 33 && step <= 35) return { label: "教育グループ", target: "part-value" };
  if (step === 36 || step === 48) return { label: "リスト化", target: "part-list" };
  if (step >= 37 && step <= 40) return { label: "集客ページ", target: "part-optin" };
  if (step >= 41 && step <= 47) return { label: "教育グループ", target: "part-value" };
  if (step === 49) return { label: "教育グループ", target: "part-value" };
  if (step >= 50 && step <= 55) return { label: "販売ページ", target: "part-sales" };
  if (step === 56) return { label: "集客ページ", target: "part-optin" };
  if (step === 57) return { label: "教育グループ", target: "part-value" };
  if (step >= 58) return { label: "販売ページ", target: "part-sales" };

  const text = `${item.name} ${item.make} ${item.input} ${item.output}`;
  if (/販売|セールス|購入|成約|説明会|特商法|法定書面/.test(text)) return { label: "販売ページ", target: "part-sales" };
  if (/Day[1-5]|ライブ|課題|特典|教育グループ|オープンチャット|LINE投稿|固定投稿|通常配信/.test(text)) return { label: "教育グループ", target: "part-value" };
  if (/サンキュー|登録直後/.test(text)) return { label: "サンクスページ", target: "part-thanks" };
  if (/メール|リマインド|自動返信|リスト化/.test(text)) return { label: "リスト化", target: "part-list" };
  if (/LP|ヘッド|VSL|広告|紹介|セットアップ|集客/.test(text)) return { label: "集客ページ", target: "part-optin" };
  return { label: "設計シート", target: "" };
}

function roadmapFunnelTagHtml(item) {
  const tag = roadmapFunnelTag(item);
  if (!tag.target) return `<strong>${esc(tag.label)}</strong>`;
  return `<a class="funnel-location-link" href="#${esc(tag.target)}">${esc(tag.label)}</a>`;
}

function roadmapStepSpot(item) {
  const step = Number(item.sourceStep);
  const itemSpots = {
    13: ["制作物", "集客ページ / ヘッド", "opt-before-head"],
    21: ["制作物", "Day1ライブ", "day1"],
    23: currentVslRoadmapSpot(),
    26: ["制作物", "サンキューページ / 登録直後案内", "thanks"],
    27: ["制作物", "ランディングページ / オプト前VSL", "opt-before-vsl"],
    28: ["制作物", "LPヘッド指示", "opt-before-head"],
    31: ["制作物", "サンキューページ本体", "thanks"],
    32: ["制作物", "サンキューページ本体", "thanks"],
    33: ["制作物", "教育グループ", "content"],
    34: ["制作物", "教育グループ / 固定投稿", "content"],
    35: ["制作物", "教育グループ / 事前案内", "content"],
    36: ["制作物", "自動返信文 / リスト化", "list"],
    37: ["制作物", "流入元からランディングページへ送る素材", "traffic"],
    41: ["制作物", "Day1ライブ", "day1"],
    42: ["制作物", "Day2ライブ", "day2"],
    43: ["制作物", "Day3ライブ", "day3"],
    44: ["制作物", "Day4ライブ", "day4"],
    45: ["制作物", "Day5ライブ", "day5"],
    46: ["制作物", "Day5ライブ", "day5"],
    48: ["制作物", "リスト化 / ライブ前メール", "list"],
    49: ["制作物", "教育グループの投稿", "content"],
    53: ["制作物", "販売ページ", "sales-page"],
    54: ["制作物", "成約後 / 商品提供", "product"],
    55: ["制作物", "成約後 / 商品提供", "product"],
    58: ["制作物", "販売ページ / 販売期配信", "sales"],
  };
  const spot = itemSpots[step];
  if (!spot) return null;
  const [type, label, focus] = spot;
  return { type, label, focus };
}

function roadmapStepTargetHtml(item) {
  const target = roadmapStepSpot(item);
  if (!target) return "";
  const figure = `<details class="roadmap-step-figure">
<summary>図で確認する</summary>
${spotlightFigure(target.focus, target.label, "mini-spotlight")}
</details>`;
  return `<div class="roadmap-step-target">
<div class="roadmap-step-target-main"><span class="target-type">${esc(target.type)}</span><span class="target-koko">ここ</span><strong>${esc(target.label)}</strong></div>
${figure}
</div>`;
}

function findFunnelPart(id) {
  const row = funnelPartRows.find(([partId]) => partId === id);
  if (!row) throw new Error(`Missing funnel part: ${id}`);
  const [, label, phase, image] = row;
  return { id, label, phase, image };
}

function compositeImagePart(targetId, partId, badge, title, note) {
  const part = findFunnelPart(partId);
  return `<article class="composite-part image-part" id="${esc(targetId)}">
<span class="part-badge">${esc(badge || part.phase)}</span>
<img src="${esc(part.image)}" alt="${esc(title || part.label)}">
<strong>${esc(title || part.label)}</strong>
${note ? `<small>${esc(note)}</small>` : ""}
</article>`;
}

function compositeTextPart(targetId, badge, title, note) {
  return `<article class="composite-part text-part" id="${esc(targetId)}">
<span class="part-badge">${esc(badge)}</span>
<div class="text-part-icon">${esc(title.slice(0, 1))}</div>
<strong>${esc(title)}</strong>
${note ? `<small>${esc(note)}</small>` : ""}
</article>`;
}

function compositeArrow() {
  return `<div class="composite-arrow" aria-hidden="true">→</div>`;
}

function currentPatternImageCard() {
  const current = funnelPatternRows.find((row) => row.id === "CURRENT");
  return `<section class="panel current-pattern-panel">
<h2>今回のファネル正本ビジュアル</h2>
<p class="note">第1章で確定したファネル図です。図解はこの画像を正本として扱い、各章では対象箇所だけをハイライトします。</p>
<figure class="current-pattern-figure">
<img src="${esc(current.image)}" alt="${esc(current.label)}">
<figcaption><strong>${esc(current.label)}</strong><span>${esc(current.acquisition)} / ${esc(current.value)} / ${esc(current.sales)}</span></figcaption>
</figure>
</section>`;
}

function funnelSpotlightCard({ title, note, focus, label }) {
  const current = funnelPatternRows.find((row) => row.id === "CURRENT");
  return `<section class="panel funnel-spotlight-panel">
<h2>${esc(title)}</h2>
<p class="note">${esc(note)}</p>
${spotlightFigure(focus, label)}
</section>`;
}

function spotlightFigure(focus, label, extraClass = "") {
  const current = funnelPatternRows.find((row) => row.id === "CURRENT");
  const className = ["spotlight-figure", extraClass].filter(Boolean).join(" ");
  return `<figure class="${esc(className)}">
<div class="spotlight-image-wrap">
<img src="${esc(current.image)}" alt="${esc(current.label)}">
<span class="spotlight-box ${esc(focus)}"><span>${esc(label)}</span></span>
</div>
</figure>`;
}

function funnelPartLibrary() {
  const groups = ["集客", "価値提供", "販売"];
  return `<details class="part-library">
<summary>パーツ素材ライブラリ</summary>
<div class="details-body">${groups.map((group) => `<section class="part-library-group">
<h3>${esc(group)}</h3>
<div class="part-library-grid">${funnelPartRows.filter(([, , phase]) => phase === group).map(([, label, , image]) => `<a href="${esc(image)}" class="part-library-card">
<img src="${esc(image)}" alt="${esc(label)}">
<strong>${esc(label)}</strong>
</a>`).join("")}</div>
</section>`).join("")}</div>
</details>`;
}

function currentFunnelComposite() {
  return `<section class="panel funnel-composite-panel">
<h2>作業位置マップ</h2>
<p class="note">各ステップの「ここ」から、どこを作るかを確認できます。</p>
<div class="funnel-composite-wrap">
<div class="funnel-composite" aria-label="今回のファネルパーツ合成">
  <div class="composite-phase acquisition">
    <div class="composite-phase-label">集客</div>
    <div class="composite-chain">
      ${compositeTextPart("part-reach", "流入", "カツオリーチ", "ハウス / 広告 / 紹介")}
      ${compositeArrow()}
      ${compositeImagePart("part-optin", "opt-before-vsl-page", "登録前", "集客ページ / オプト前VSL", "メールアドレス登録")}
      ${compositeArrow()}
      ${compositeImagePart("part-thanks", "thanks-no-video", "登録直後", "サンクスページ", "教育グループへ案内")}
      ${compositeArrow()}
      ${compositeImagePart("part-list", "list-building", "リスト", "リスト化", "LINE / メール")}
    </div>
  </div>
  <div class="composite-phase value">
    <div class="composite-phase-label">価値提供</div>
    <div class="composite-chain single">
      ${compositeImagePart("part-value", "challenge-5days", "5チャレ", "教育グループ", "Day1〜Day5")}
    </div>
  </div>
  <div class="composite-phase sales">
    <div class="composite-phase-label">販売</div>
    <div class="composite-chain single">
      ${compositeImagePart("part-sales", "sales-page-part", "直販", "販売ページ", "成約 / 商品提供")}
    </div>
  </div>
</div>
</div>
</section>`;
}

function roadmapFunnelAxis() {
  const acquisitionNodes = [
    ["集客ページ", "コンセプト / オプト前VSL / メールアドレス", "lp.html"],
    ["サンクスページ", "教育グループへ正式参加", "thank-you-copy.html"],
    ["リスト化", "LINE / メール", "optin-after-mails.html"],
  ];
  const valueNodes = [
    ["Day1", "チャレンジ", "live-scripts.html"],
    ["Day2", "チャレンジ", "live-scripts.html"],
    ["Day3", "チャレンジ", "live-scripts.html"],
    ["Day4", "チャレンジ", "live-scripts.html"],
    ["Day5", "チャレンジ", "live-scripts.html"],
  ];
  const salesNodes = [
    ["販売ページ", "今回: セールスレターで販売", "sales-page.html"],
    ["成約", "申込/決済", "sales-page.html"],
    ["商品提供", "購入完了後の案内", "sales-page.html"],
  ];
  return `<section class="panel roadmap-axis-panel">
<h2>ファネル工程軸</h2>
<p class="note">工程表の各ステップは、この流れのどこを作っているかを確認しながら進めます。</p>
<div class="roadmap-axis" aria-label="今回のファネル工程軸">
  <div class="traffic-source" aria-label="集客元">
    <span>カツオリーチ</span>
    <span>ハウス</span>
    <span>広告</span>
    <span>紹介</span>
  </div>
  <section class="axis-phase acquisition">
    <div class="axis-phase-title">集客</div>
    <div class="axis-nodes">${acquisitionNodes.map(([label, detail, href]) => `<a class="axis-node" href="${esc(href)}"><strong>${esc(label)}</strong><span>${esc(detail)}</span></a>`).join("")}</div>
  </section>
  <section class="axis-phase value">
    <div class="axis-phase-title">価値提供</div>
    <div class="axis-group-title">教育グループ</div>
    <div class="axis-days">${valueNodes.map(([label, detail, href]) => `<a class="axis-day" href="${esc(href)}"><strong>${esc(label)}</strong><span>${esc(detail)}</span></a>`).join("")}</div>
  </section>
  <section class="axis-phase sales">
    <div class="axis-phase-title">販売</div>
    <div class="axis-nodes">${salesNodes.map(([label, detail, href]) => `<a class="axis-node" href="${esc(href)}"><strong>${esc(label)}</strong><span>${esc(detail)}</span></a>`).join("")}</div>
  </section>
</div>
</section>`;
}

function funnelPatternGallery() {
  return `<section class="panel funnel-pattern-panel">
<h2>格納済みファネルパターン</h2>
<p class="note">全体図はパターン選択用の参照として置きます。実際の工程表は、選んだ集客・価値提供・販売の組み合わせに合わせて切り替える前提です。</p>
<div class="pattern-grid">${funnelPatternRows.map((row) => {
    const imageBlock = row.image
      ? `<a href="${esc(row.image)}"><img src="${esc(row.image)}" alt="${esc(row.label)}"></a>`
      : `<div class="pattern-placeholder"><strong>今回採用</strong><span>作成待ち</span></div>`;
    return `<article class="pattern-card ${row.id === "CURRENT" ? "current-pattern" : ""}">
${imageBlock}
<div class="pattern-card-body">
<span class="meta">Pattern ${esc(row.id)} / ${esc(row.position)}</span>
<h3>${esc(row.label)}</h3>
<table class="asset-table compact-table"><tbody>
<tr><th>集客</th><td>${esc(row.acquisition)}</td></tr>
<tr><th>価値提供</th><td>${esc(row.value)}</td></tr>
<tr><th>販売</th><td>${esc(row.sales)}</td></tr>
</tbody></table>
</div>
</article>`;
  }).join("")}</div>
<details class="pattern-request">
<summary>追加で欲しい単独画像</summary>
<div class="details-body">
<ul>
<li>集客単独: オプト後VSL、オプト前VSL、フォーム登録のみ、カツオリーチ/広告/ハウス/紹介の入口違い。</li>
<li>価値提供単独: 2チャレ、3チャレ、4チャレ、5チャレ、次ライブがDay2/Day3/Day4/Day5の違い。</li>
<li>販売単独: 個別説明会、セミナー→個別説明会、セミナー販売、販売ページ直販。</li>
<li>任意で欲しいもの: 公式LINE販売、メール販売、LINEオープンチャット販売接続、購入完了後の提供導線。</li>
</ul>
</div>
</details>
</section>`;
}

function roadmapPhaseSection(phase, index) {
  const phaseNumber = index + 1;
  const spotlight = roadmapPhaseSpotlight(phaseNumber);
  return `<section class="panel roadmap-phase" id="phase-${phaseNumber}">
<h2>${esc(phase.name)}</h2>
${spotlight}
<p class="note">${esc(phase.summary)}</p>
<div class="roadmap-steps">${phase.items.map((item, itemIndex) => {
    const stepNumber = `${phaseNumber}-${itemIndex + 1}`;
    const link = item.href ? `<a class="report-link" href="${esc(item.href)}">開く</a>` : "";
    return `<article class="roadmap-step">
<span class="roadmap-step-num">${esc(stepNumber)}</span>
<div>
${roadmapStepTargetHtml(item)}
<span class="roadmap-source-step">Step ${esc(item.sourceStep)}</span>
<h3>${esc(item.name)}</h3>
<p>${esc(item.make)}</p>
<p class="roadmap-step-output"><span>このステップで作る/決めるもの</span>${esc(item.output)}</p>
${link}
</div>
</article>`;
  }).join("")}</div>
</section>`;
}

function roadmapPhaseSpotlight(phaseNumber) {
  const settings = {
    2: ["第2章の対象箇所", "concept", "第2章 コンセプト設計"],
    3: ["第3章の対象箇所", "offer-product", "オファー構築"],
    4: ["第4章の対象箇所", "content", "第4章 コンテンツ設計"],
    5: ["第5章の対象箇所", "lp", "第5章 LP制作"],
    6: ["第6章の対象箇所", "lp", "第6章 集客素材"],
    7: ["第7章の対象箇所", "content", "第7章 ライブ台本"],
    8: ["第8章の対象箇所", "sales", "第8章 販売素材"],
  };
  const setting = settings[phaseNumber];
  if (!setting) return "";
  const [title, focus, label] = setting;
  return `<div class="roadmap-phase-spotlight">
<h3>${esc(title)}</h3>
${spotlightFigure(focus, label)}
</div>`;
}

function card(title, metaLabel, text, href = "") {
  const link = href ? `<a class="report-link" href="${href}">開く</a>` : "";
  return `<article class="report-item"><span class="meta">${esc(metaLabel)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${link}</article>`;
}

function conceptItem(number, title, metaLabel, text, bullets = []) {
  const list = bullets.length ? `<ul>${bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : "";
  return `<article class="concept-item">
<span class="concept-number">${String(number).padStart(2, "0")}</span>
<div>
<span class="meta">${esc(metaLabel)}</span>
<h3>${esc(title)}</h3>
<p>${esc(text)}</p>
${list}
</div>
</article>`;
}

const registrationMails = materialMailList(`${acquisitionMaterialRoot}/04_オプトイン後メルマガ`);
const setupMails = materialMailList(`${acquisitionMaterialRoot}/07_集客前メッセージ`);
const referralCopies = list(`${acquisitionMaterialRoot}/06_紹介用文章`);
const salesMails = materialMailList(`${salesMaterialRoot}/01_オプトイン後メルマガ`)
  .filter((mail) => !path.basename(mail.relative).startsWith("00_"));
const salesMailOverview = `${salesMaterialRoot}/01_オプトイン後メルマガ/00_販売メッセージ.md`;
const salesLetters = list(`${salesMaterialRoot}/02_セールスレター原稿`);
const salesHeadDocs = list(`${salesMaterialRoot}/05_セールスページヘッド指示書`);
const purchaseCompleteDocs = list(`${salesMaterialRoot}/06_購入完了ページ原稿`);
const salesOcMessages = materialMailList(`${salesMaterialRoot}/03_LINEオープンチャット_Day5後販売導線`)
  .filter((mail) => !path.basename(mail.relative).startsWith("00_"));
const salesOcOverview = `${salesMaterialRoot}/03_LINEオープンチャット_Day5後販売導線/00_Day5後販売導線.md`;
const salesOfficialLines = materialMailList(`${salesMaterialRoot}/04_販売期公式LINE`)
  .filter((mail) => !path.basename(mail.relative).startsWith("00_"));
const salesOfficialOverview = `${salesMaterialRoot}/04_販売期公式LINE/00_配信対応表.md`;
const fixedNotes = list(`${valueMaterialRoot}/01_LINEオープンチャット/01_固定投稿`).map((relative) => ({ relative, title: titleOf(relative), excerpt: bodyExcerpt(relative, 280) }));
const plannedSpots = list(`${valueMaterialRoot}/01_LINEオープンチャット/02_通常配信_Day1前〜Day5本編`)
  .filter((file) => !path.basename(file).startsWith("00_"))
  .map(parseSpot)
  .filter((spot) => spot.phase !== "販売期");

const phaseCounts = plannedSpots.reduce((acc, item) => {
  acc[item.phase] = (acc[item.phase] || 0) + 1;
  return acc;
}, {});

function lineFixedFile(index) {
  return `line-fixed-${String(index + 1).padStart(2, "0")}.html`;
}

function lineNormalFile(index) {
  return `line-normal-${String(index + 1).padStart(2, "0")}.html`;
}

function mailTiming(row) {
  return [row.day, row.time].filter(Boolean).join(" / ") || cleanMetaValue(row.category) || row.phase || "配信";
}

fixedNotes.forEach((note, index) => {
  note.file = lineFixedFile(index);
});
plannedSpots.forEach((spot, index) => {
  spot.file = lineNormalFile(index);
});

function folderList(rows, metaFn = mailTiming) {
  return `<div class="folder-list">${rows.map((row) => `<a href="${esc(row.file)}"><span>${esc(metaFn(row))}</span><strong>${esc(row.title)}</strong></a>`).join("")}</div>`;
}

function assetFolderList(rows, metaFn = mailTiming) {
  return `<div class="folder-list">${rows.map((row) => `<a href="${esc(row.assetFile)}"><span>${esc(metaFn(row))}</span><strong>${esc(row.title)}</strong></a>`).join("")}</div>`;
}

function optinAfterMailFile(index) {
  return `optin-after-mail-${String(index + 1).padStart(2, "0")}.html`;
}

function trafficMailFile(index) {
  return `traffic-mail-${String(index + 1).padStart(2, "0")}.html`;
}

function salesMailFile(index) {
  return `sales-mail-${String(index + 1).padStart(2, "0")}.html`;
}

function salesOcFile(index) {
  return `sales-oc-${String(index + 1).padStart(2, "0")}.html`;
}

function salesLineFile(index) {
  return `sales-line-${String(index + 1).padStart(2, "0")}.html`;
}

registrationMails.forEach((mail, index) => {
  mail.assetFile = optinAfterMailFile(index);
});
setupMails.forEach((mail, index) => {
  mail.assetFile = trafficMailFile(index);
});
salesMails.forEach((mail, index) => {
  mail.assetFile = salesMailFile(index);
});
salesOcMessages.forEach((mail, index) => {
  mail.assetFile = salesOcFile(index);
});
salesOfficialLines.forEach((mail, index) => {
  mail.assetFile = salesLineFile(index);
});

function mailAssetSidebar({ title, indexFile, activeFile, rows, parentHref = "lp.html", parentLabel = "集客素材一覧", sectionLabel = "メール一覧" }) {
  const upHref = activeFile === indexFile ? parentHref : indexFile;
  const upLabel = activeFile === indexFile ? parentLabel : title;
  const links = rows.map((mail) => {
    const href = mail.assetFile || mail.file;
    return `<a class="stepmail-side-link ${href === activeFile ? "active" : ""}" href="${esc(href)}"><span class="date">${esc(mailTiming(mail))}</span>${esc(mail.title)}</a>`;
  }).join("");
  return `<aside class="reader-side stepmail-side">
<div class="brand"><div class="brand-mark">祐</div><div><p class="brand-title">田中祐一AI</p><span class="brand-sub">WEBマーケターへの道</span></div></div>
<h3>${esc(title)}</h3>
<a class="stepmail-side-link top-link" href="${esc(upHref)}"><span class="date">Back</span>1つ上に戻る</a>
<a class="stepmail-side-link top-link ${activeFile === indexFile ? "active" : ""}" href="${esc(indexFile)}"><span class="date">${esc(upLabel)}</span>一覧</a>
<div class="stepmail-side-section">${esc(sectionLabel)}</div>
${links}
</aside>`;
}

function mailAssetIndexBody({ title, lead, rows, label = "集客素材", overview = "" }) {
  return `<div class="stepmail-content reader-content">
<section class="stepmail-block">
<p class="block-label">${esc(label)}</p>
<h2>${esc(title)}</h2>
<p>${esc(lead)}</p>
${overview ? `<div class="details-body">${articleFrom(overview).replace(source(overview), "")}</div>` : ""}
${assetFolderList(rows)}
</section>
</div>`;
}

function singleMailBody(mail) {
  return `<section class="panel article-panel">
<p class="block-label">${esc(mail.purpose || mail.phase)} / ${esc(mailTiming(mail))}</p>
<h2>${esc(mail.title)}</h2>
<table class="asset-table compact-table"><tbody>
<tr><th>タイミング</th><td>${esc(mailTiming(mail))}</td></tr>
<tr><th>カテゴリ</th><td>${esc(mail.category || mail.phase)}</td></tr>
</tbody></table>
<div class="mail-full single-md">${copyArticleFrom(mail.relative).replace(source(mail.relative), "")}</div>
</section>`;
}

function lineSpotId(index) {
  return `line-normal-${String(index + 1).padStart(2, "0")}`;
}

function lineFixedId(index) {
  return `line-fixed-${String(index + 1).padStart(2, "0")}`;
}

function spotTiming(row) {
  return [row.timing, row.time].filter(Boolean).join(" / ") || row.phase;
}

function lineSidebar(activeFile = "line.html") {
  const fixedLinks = fixedNotes.map((note) => `<a class="stepmail-side-link ${note.file === activeFile ? "active" : ""}" href="${esc(note.file)}"><span class="date">固定投稿</span>${esc(note.title)}</a>`).join("");
  const normalLinks = plannedSpots.map((spot) => `<a class="stepmail-side-link ${spot.file === activeFile ? "active" : ""}" href="${esc(spot.file)}"><span class="date">${esc(spotTiming(spot))}</span>${esc(spot.title)}</a>`).join("");
  const parentHref = activeFile === "line.html" ? "value.html" : "line.html";
  const parentLabel = activeFile === "line.html" ? "価値提供素材一覧" : "価値提供LINE一覧";
  return `<aside class="reader-side stepmail-side line-side">
	<div class="brand"><div class="brand-mark">祐</div><div><p class="brand-title">田中祐一AI</p><span class="brand-sub">WEBマーケターへの道</span></div></div>
	<h3>価値提供LINE</h3>
	<a class="stepmail-side-link top-link" href="${parentHref}"><span class="date">Back</span>1つ上に戻る</a>
	<a class="stepmail-side-link top-link ${activeFile === "line.html" ? "active" : ""}" href="line.html"><span class="date">${esc(parentLabel)}</span>配信一覧</a>
<div class="stepmail-side-section">固定投稿</div>
${fixedLinks}
<div class="stepmail-side-section">通常配信</div>
${normalLinks}
</aside>`;
}

function singleMaterialBody(item, label, timing = "") {
  const timingRow = timing ? `<tr><th>タイミング</th><td>${esc(timing)}</td></tr>` : "";
  const metaTable = timingRow ? `<table class="asset-table compact-table"><tbody>${timingRow}</tbody></table>` : "";
  return `<section class="panel article-panel">
<p class="block-label">${esc(label)}</p>
<h2>${esc(item.title)}</h2>
${metaTable}
<div class="mail-full single-md">${copyArticleFrom(item.relative).replace(source(item.relative), "")}</div>
</section>`;
}

function lineFixedArticle(note, index) {
  return `<article id="${lineFixedId(index)}" class="mail-entry">
<div class="mail-entry-head">
<span class="mail-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<p class="block-label">固定投稿</p>
<h3>${esc(note.title)}</h3>
</div>
</div>
<div class="mail-full">${copyArticleFrom(note.relative)}</div>
</article>`;
}

function lineSpotArticle(spot, index) {
  return `<article id="${lineSpotId(index)}" class="mail-entry">
<div class="mail-entry-head">
<span class="mail-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<p class="block-label">${esc(spot.phase)} / ${esc(spotTiming(spot))}</p>
<h3>${esc(spot.title)}</h3>
</div>
</div>
<div class="mail-full">${copyArticleFrom(spot.relative)}</div>
</article>`;
}

function linePageBody() {
  return `<div class="stepmail-content reader-content">
	<section id="line-overview" class="stepmail-block">
	<p class="block-label">価値提供素材</p>
	<h2>価値提供フェーズのLINEオープンチャット</h2>
	<p>価値提供側のLINEオープンチャットです。固定投稿で参加者の迷子を防ぎ、通常配信でDay1前からDay5本編までのライブ、課題、アーカイブ案内を流します。Day5後の販売導線LINEとは別ページで管理します。</p>
	<table class="asset-table compact-table"><tbody>
	<tr><th>固定投稿</th><td>${fixedNotes.length}件。ライブ参加、課題、特典、基本案内を常設する。</td></tr>
	<tr><th>通常配信</th><td>${plannedSpots.length}件。ライブ前、価値提供中の計画配信。</td></tr>
	<tr><th>販売導線LINE</th><td>Day5後の販売接続は、販売素材側の<a href="sales-oc.html">販売導線LINE</a>で確認する。</td></tr>
	</tbody></table>
</section>
<section id="line-funnel" class="stepmail-block">
<p class="block-label">参加導線</p>
<h2>サンクスページから教育グループへ</h2>
	<p>今回の登録後導線は、サンキューページと自動返信から価値提供フェーズのLINEオープンチャットへ参加してもらう構成です。</p>
<table class="asset-table compact-table"><tbody>
<tr><th>入口</th><td>オプトインLP、サンキューページ、自動返信メールから教育グループへ接続する。</td></tr>
<tr><th>価値提供</th><td>Day1〜Day5のライブ、課題、特典、アーカイブを通常配信で案内する。</td></tr>
	<tr><th>販売分岐</th><td>Day5後の販売接続メッセージは販売素材側のLINEへ分ける。</td></tr>
</tbody></table>
</section>
<section id="line-fixed" class="stepmail-block">
<p class="block-label">常設案内</p>
<h2>固定投稿</h2>
${folderList(fixedNotes, () => "固定投稿")}
</section>
<section id="line-normal" class="stepmail-block">
<p class="block-label">時系列</p>
<h2>通常配信</h2>
<table class="asset-table compact-table"><thead><tr><th>フェーズ</th><th>件数</th><th>役割</th></tr></thead><tbody>
<tr><td>ライブ前</td><td>${phaseCounts["ライブ前"] || 0}件</td><td>参加前の期待値形成、概要説明、ライブ参加リマインド。</td></tr>
<tr><td>価値提供中</td><td>${phaseCounts["価値提供中"] || 0}件</td><td>ライブリンク、課題、アーカイブ、質問回答、特典案内。</td></tr>
</tbody></table>
<h3 class="section-title">全スポット配信タイトル</h3>
${folderList(plannedSpots, spotTiming)}
</section>
</div>
</div>`;
}

function sourceInventory() {
  const categories = [
    ["主要ページ", list("02_オプトインLP").length + list("03_サンキューページ").length + list("06_セールス").length],
    ["ライブ台本/動画", list("04_価値提供/01_ライブシナリオ").length + list("04_価値提供/02_ライブ動画").length],
    ["課題/特典", list("04_価値提供/03_課題").length + list("21_特典").length],
    ["オープンチャット", fixedNotes.length + plannedSpots.length],
    ["メール/公式LINE", registrationMails.length + salesMails.length + salesOfficialLines.length],
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
html { scroll-behavior: smooth; font-size: 18px; }
html, body { overflow-x: hidden; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif;
  line-height: 1.95;
  letter-spacing: 0;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--sub); text-decoration: none; font-weight: 760; }
a:hover { text-decoration: underline; }
.layout { display: block; min-height: 100vh; max-width: 100vw; padding-left: 292px; }
.side { position: fixed; left: 0; top: 0; bottom: 0; width: 292px; height: 100dvh; overflow-y: auto; overflow-x: hidden; padding: 18px 14px 72px; background: var(--paper); border-right: 1px solid var(--line); scrollbar-gutter: stable; overscroll-behavior: contain; }
.reader-layout { display: block; min-height: 100vh; max-width: 100vw; padding-left: 320px; }
.reader-side {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 16px 72px;
  background: var(--paper);
  border-right: 1px solid var(--line);
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}
.reader-main { min-width: 0; padding: 44px min(6vw, 72px) 88px; }
.reader-wrap { max-width: 1040px; margin: 0 auto; }
.reader-page .hero { margin-bottom: 28px; }
.brand { display: grid; grid-template-columns: 46px 1fr; gap: 12px; align-items: center; margin-bottom: 24px; }
.brand-mark { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 8px; background: var(--main); color: #fff; font-weight: 850; }
.brand-title { margin: 0; font-size: 18px; line-height: 1.35; font-weight: 850; }
.brand-sub { display: block; margin-top: 2px; color: var(--muted); font-size: 12px; font-weight: 650; }
.nav-section { margin: 14px 0 5px; color: var(--muted); font-size: 11px; font-weight: 900; }
.nav-link { display: grid; grid-template-columns: 24px 1fr; gap: 8px; align-items: center; min-height: 34px; padding: 6px 8px; border-radius: 8px; color: #223449; font-size: 13px; font-weight: 760; }
.nav-link small { display: block; color: var(--muted); font-size: 10px; font-weight: 650; line-height: 1.35; }
.nav-link:hover, .nav-link.active { background: var(--soft); color: var(--sub); text-decoration: none; }
.nav-num { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 11px; font-weight: 850; }
.back-link {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  margin: 0 0 14px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--pale);
  color: var(--ink);
  font-size: 13px;
  font-weight: 850;
}
.back-link span {
  display: grid;
  place-items: center;
  width: 21px;
  height: 21px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--sub);
  font-weight: 900;
}
.back-link strong { display: block; color: var(--ink); line-height: 1.25; }
.back-link small { display: block; color: var(--muted); font-size: 10px; font-weight: 650; line-height: 1.35; }
.back-link:hover { background: var(--soft); color: var(--sub); text-decoration: none; }
.production-side .material-nav-link { grid-template-columns: 22px 1fr; padding-left: 14px; }
.production-side .material-nav-link .nav-num { width: 19px; height: 19px; font-size: 10px; }
.main { min-width: 0; padding: 44px min(5vw, 64px) 88px; }
.wrap { max-width: 880px; margin: 0 auto; }
.hero { margin-bottom: 30px; }
.eyebrow { margin: 0 0 10px; color: var(--sub); font-size: 13px; font-weight: 900; }
h1 { margin: 0 0 14px; font-size: clamp(34px, 4vw, 54px); line-height: 1.18; font-weight: 850; letter-spacing: 0; }
h2 { margin: 0 0 18px; font-size: 1.32rem; line-height: 1.45; font-weight: 760; color: var(--sub); }
h3 { margin: 0 0 10px; font-size: 1.1rem; line-height: 1.55; font-weight: 760; }
p { margin: 0; }
ul, ol { margin: 10px 0 0; padding-left: 1.2em; }
li { margin: 4px 0; }
.lead { max-width: 42em; color: #526760; font-size: 1.05rem; font-weight: 450; }
.muted { color: var(--muted); font-size: 13px; }
.panel { margin: 24px 0; padding: 2.1rem 2.3rem 2.35rem; border: 1px solid var(--line); border-radius: 18px; background: var(--paper); box-shadow: 0 8px 30px rgba(24, 155, 125, .08); font-size: 1.02rem; }
.panel.flush { padding: 0; overflow: hidden; }
.grid-2, .grid-3, .grid-4 { display: grid; grid-template-columns: 1fr; gap: 0; }
.report-item,
.card,
.card.white {
  position: relative;
  padding: .95rem 0 .95rem 1rem;
  border: 0;
  border-left: 4px solid var(--line);
  border-radius: 0;
  background: transparent;
}
.report-item + .report-item,
.card + .card { border-top: 1px dashed var(--line); }
.report-item .meta,
.card .meta { display: block; margin-bottom: .2rem; color: var(--sub); font-size: .82rem; font-weight: 900; }
.report-item h3,
.card h3 { margin-bottom: .25rem; color: var(--ink); }
.report-item p,
.card p { color: #324b44; font-size: 1rem; line-height: 1.8; }
.report-link,
.card-link { display: inline-flex; margin-top: .35rem; }
.material-shelf { display: grid; gap: 0; }
.material-card {
  display: block;
  padding: 1rem 0 1rem 1rem;
  border-left: 4px solid var(--line);
  color: var(--ink);
}
.material-card + .material-card { border-top: 1px dashed var(--line); }
.material-card:hover { border-left-color: var(--main); background: var(--pale); text-decoration: none; }
.material-card .meta { display: block; margin-bottom: .2rem; color: var(--sub); font-size: .82rem; font-weight: 900; }
.material-card strong { display: block; margin-bottom: .25rem; color: var(--ink); font-size: 1.08rem; line-height: 1.55; }
.material-card span:not(.meta):not(.pill) { display: block; color: #324b44; font-size: 1rem; line-height: 1.8; }
.material-card code { display: block; margin-top: .45rem; color: #607970; font-size: .72rem; line-height: 1.55; word-break: break-all; }
.category-card .pills { margin-top: .65rem; }
.concept-sequence { display: grid; gap: 1rem; }
.concept-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 1rem;
  padding: 1.15rem 0 1.15rem 1rem;
  border-left: 4px solid var(--line);
  border-bottom: 1px dashed var(--line);
}
.concept-item:last-child { border-bottom: 0; }
.concept-number {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--soft);
  color: var(--sub);
  font-size: .86rem;
  font-weight: 900;
}
.concept-item p { color: #324b44; line-height: 1.85; }
.concept-item ul { margin-top: .65rem; color: #324b44; }
.kpi { padding: .95rem 0 .95rem 1rem; border: 0; border-left: 4px solid var(--line); border-radius: 0; background: transparent; }
.kpi span { display: block; color: var(--muted); font-size: 12px; font-weight: 800; }
.kpi strong { display: block; margin-top: 6px; font-size: 24px; line-height: 1.2; }
.flow { display: grid; gap: 0; }
.flow-row { display: grid; grid-template-columns: 180px minmax(0, 1fr) minmax(220px, .7fr) 92px; gap: 12px; align-items: center; padding: 15px 18px; border-top: 1px solid var(--line); }
.flow-row:first-child { border-top: 0; }
.flow-row strong { font-size: 15px; }
.flow-row p { color: var(--muted); font-size: 13px; }
.mini-list { margin: 0; padding-left: 1.1em; color: #4c625b; font-size: 13px; line-height: 1.55; }
.mini-list li { margin: 2px 0; }
.status { justify-self: start; padding: 4px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; white-space: nowrap; }
.status.todo { background: var(--warn-bg); color: var(--warn); }
.status.need { background: var(--danger-bg); color: var(--danger); }
.funnel-map { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: #fff; }
.funnel-map-head { display: grid; gap: 3px; padding: 16px 18px; background: var(--soft); border-bottom: 1px solid var(--line); }
.funnel-map-head span { color: var(--sub); font-size: .78rem; font-weight: 900; }
.funnel-map-head strong { color: var(--ink); font-size: 1.08rem; line-height: 1.5; }
.funnel-track { display: grid; gap: 0; }
.funnel-node { position: relative; display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 13px; padding: 17px 18px; color: var(--ink); border-bottom: 1px solid var(--line); text-decoration: none; }
.funnel-node:last-child { border-bottom: 0; }
.funnel-node::after { content: ""; position: absolute; left: 39px; bottom: -8px; width: 15px; height: 15px; border-right: 2px solid var(--main); border-bottom: 2px solid var(--main); transform: rotate(45deg); background: #fff; z-index: 1; }
.funnel-node:last-child::after { display: none; }
.funnel-node:hover { background: var(--pale); text-decoration: none; }
.node-index { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 8px; background: var(--main); color: #fff; font-size: .78rem; font-weight: 900; }
.node-body { display: grid; gap: 3px; min-width: 0; }
.node-body strong { color: var(--ink); font-size: 1.03rem; line-height: 1.45; }
.node-body span:last-child { color: #405a53; font-size: .9rem; line-height: 1.7; font-weight: 520; }
.node-meta { color: var(--sub); font-size: .76rem; font-weight: 900; }
.funnel-format-board { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: #fff; }
.format-summary { display: grid; gap: 4px; padding: 16px 18px; background: var(--soft); border-bottom: 1px solid var(--line); }
.format-summary span { color: var(--sub); font-size: .78rem; font-weight: 900; }
.format-summary strong { color: var(--ink); font-size: 1.02rem; line-height: 1.55; }
.format-summary small { color: var(--muted); font-size: .82rem; font-weight: 760; line-height: 1.6; }
.format-stages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; }
.format-stage { display: grid; align-content: start; gap: 13px; padding: 18px; border-left: 1px solid var(--line); }
.format-stage:first-child { border-left: 0; }
.stage-head { display: grid; gap: 3px; }
.stage-head span { color: var(--sub); font-size: .76rem; font-weight: 900; }
.stage-head strong { color: var(--ink); font-size: 1.02rem; line-height: 1.45; }
.traffic-row { display: flex; flex-wrap: wrap; gap: 7px; }
.traffic-row span { display: inline-flex; align-items: center; min-height: 26px; padding: 3px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; }
.format-chain { display: grid; gap: 8px; }
.format-node { position: relative; display: grid; gap: 2px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--pale); color: var(--ink); text-decoration: none; font-weight: 820; }
.format-node::after { content: "↓"; position: absolute; left: 50%; bottom: -18px; transform: translateX(-50%); color: var(--sub); font-size: 13px; font-weight: 900; }
.format-node:last-child::after { display: none; }
.format-node small { color: var(--muted); font-size: 11px; font-weight: 760; }
.format-node:hover { background: var(--soft); text-decoration: none; }
.format-stage p { color: #405a53; font-size: .88rem; line-height: 1.75; }
.day-strip { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; }
.day-chip { display: grid; place-items: center; min-height: 46px; padding: 6px 4px; border: 1px solid var(--line); border-radius: 8px; background: var(--pale); color: var(--ink); font-size: 13px; font-weight: 850; text-align: center; }
.day-chip small { display: block; color: var(--muted); font-size: 10px; line-height: 1.2; }
.day-chip.next { background: var(--main); border-color: var(--main); color: #fff; }
.day-chip.next small { color: #E8FFFA; }
.asset-table tr.active-row td { background: var(--pale); box-shadow: inset 4px 0 0 var(--main); }
.pills { display: flex; flex-wrap: wrap; gap: 7px; }
.pill { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 800; }
.jump-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.3rem; }
.jump-nav a { display: inline-flex; align-items: center; min-height: 36px; padding: 7px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: #2d6f61; font-size: 14px; font-weight: 850; text-decoration: none; }
.jump-nav a:hover { background: var(--soft); }
.roadmap-axis-panel { overflow-x: auto; }
.roadmap-axis { display: grid; grid-template-columns: 90px minmax(230px, .95fr) minmax(330px, 1.25fr) minmax(260px, .95fr); gap: 18px; align-items: stretch; min-width: 920px; margin-top: 1.15rem; }
.traffic-source { display: grid; align-content: center; gap: 12px; padding-top: 1.9rem; color: #2f74bd; font-weight: 900; }
.traffic-source span { position: relative; display: block; padding-right: 20px; text-align: right; }
.traffic-source span::after { content: "→"; position: absolute; right: 0; color: var(--main); }
.axis-phase { position: relative; display: grid; align-content: space-between; gap: 14px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: #fff; }
.axis-phase + .axis-phase::before { content: ""; position: absolute; left: -12px; top: 22px; bottom: 22px; width: 3px; border-radius: 999px; background: #1f6fb6; }
.axis-phase-title { justify-self: center; min-width: 148px; padding: 9px 18px; border-radius: 8px; background: #06395a; color: #fff; font-size: 1.08rem; font-weight: 900; text-align: center; }
.axis-nodes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: stretch; }
.axis-node, .axis-day { display: grid; align-content: center; gap: 5px; min-height: 102px; padding: 12px; border: 1px solid var(--line); border-radius: 9px; background: var(--pale); color: var(--ink); text-align: center; text-decoration: none; }
.axis-node:hover, .axis-day:hover { border-color: var(--main); background: var(--soft); text-decoration: none; }
.axis-node strong, .axis-day strong { display: block; color: var(--ink); font-size: .94rem; line-height: 1.4; }
.axis-node span, .axis-day span { display: block; color: #48645d; font-size: .76rem; line-height: 1.45; font-weight: 780; }
.axis-group-title { justify-self: center; color: var(--ink); font-size: 1.08rem; font-weight: 900; }
.axis-days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 9px; }
.axis-day { min-height: 116px; }
.axis-day strong { display: grid; place-items: center; min-height: 42px; border-radius: 8px; background: #2f80c9; color: #fff; font-size: .92rem; }
.pattern-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 1.1rem; }
.pattern-card { overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: #fff; }
.pattern-card.current-pattern { border-color: var(--main); box-shadow: 0 14px 36px rgba(24, 155, 125, .12); }
.pattern-card > a { display: block; background: #fff; }
.pattern-card img { display: block; width: 100%; aspect-ratio: 14 / 10.8; object-fit: contain; background: #fff; border-bottom: 1px solid var(--line); }
.pattern-placeholder { display: grid; place-items: center; align-content: center; gap: 8px; width: 100%; aspect-ratio: 14 / 10.8; background: linear-gradient(180deg, #F7FFFD, #EAF7F4); border-bottom: 1px solid var(--line); text-align: center; }
.pattern-placeholder strong { padding: 7px 14px; border-radius: 999px; background: var(--main); color: #fff; font-size: .92rem; }
.pattern-placeholder span { color: var(--sub); font-size: .9rem; font-weight: 900; }
.pattern-card-body { padding: 14px; }
.pattern-card-body h3 { margin: 4px 0 10px; font-size: 1rem; line-height: 1.45; }
.pattern-card-body .compact-table { margin-top: 0; font-size: .78rem; }
.pattern-card-body .compact-table th,
.pattern-card-body .compact-table td { padding: 8px 9px; }
.pattern-request { margin-top: 16px; }
.current-pattern-figure {
  display: grid;
  gap: 12px;
  margin: 1.1rem 0 0;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
}
.current-pattern-figure img {
  display: block;
  width: 100%;
  max-height: 620px;
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
}
.current-pattern-figure figcaption {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--pale);
}
.current-pattern-figure figcaption strong {
  color: var(--ink);
  font-size: 1rem;
  line-height: 1.55;
}
.current-pattern-figure figcaption span {
  color: #405a53;
  font-size: .84rem;
  font-weight: 760;
  line-height: 1.65;
}
.funnel-spotlight-panel { overflow: hidden; }
.spotlight-figure { margin: 1.1rem 0 0; }
.spotlight-image-wrap {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 42px rgba(19, 32, 51, .08);
}
.spotlight-image-wrap img {
  display: block;
  width: 100%;
  height: auto;
}
.spotlight-box {
  position: absolute;
  z-index: 2;
  border: 4px solid #FFD24D;
  border-radius: 20px;
  background: rgba(255, 210, 77, .13);
  box-shadow: 0 0 0 9999px rgba(255, 255, 255, .68), 0 18px 38px rgba(111, 74, 0, .16);
}
.spotlight-box span {
  position: absolute;
  left: 50%;
  top: -20px;
  transform: translateX(-50%);
  min-width: 130px;
  padding: 6px 13px;
  border-radius: 999px;
  background: #FFD24D;
  color: #3F2A00;
  font-size: .78rem;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 10px 22px rgba(111, 74, 0, .18);
}
.spotlight-box.concept { left: 7%; top: 18%; width: 22%; height: 43%; }
.spotlight-box.offer-product { left: 87%; top: 35%; width: 10%; height: 17%; }
.spotlight-box.content { left: 39%; top: 24%; width: 31%; height: 50%; }
.spotlight-box.lp { left: 5%; top: 18%; width: 29%; height: 45%; }
.spotlight-box.sales { left: 70%; top: 20%; width: 26%; height: 51%; }
.spotlight-box.traffic { left: 1.5%; top: 29%; width: 8%; height: 25%; }
.spotlight-box.opt-before-vsl { left: 8%; top: 24%; width: 17%; height: 31%; }
.spotlight-box.opt-before-head { left: 8%; top: 24%; width: 17%; height: 16%; }
.spotlight-box.opt-before-video { left: 10%; top: 29%; width: 13%; height: 9%; }
.spotlight-box.thanks { left: 25%; top: 24%; width: 14%; height: 31%; }
.spotlight-box.list { left: 15%; top: 56%; width: 18%; height: 13%; }
.spotlight-box.day1 { left: 41.5%; top: 34%; width: 5.5%; height: 20%; }
.spotlight-box.day2 { left: 46.1%; top: 34%; width: 5.5%; height: 20%; }
.spotlight-box.day3 { left: 50.8%; top: 34%; width: 5.5%; height: 20%; }
.spotlight-box.day4 { left: 55.5%; top: 34%; width: 5.5%; height: 20%; }
.spotlight-box.day5 { left: 60.2%; top: 34%; width: 5.5%; height: 20%; }
.spotlight-box.sales-page { left: 69%; top: 24%; width: 13%; height: 34%; }
.spotlight-box.product { left: 88%; top: 36%; width: 10%; height: 18%; }
.mini-spotlight {
  max-width: 560px;
  margin-top: .7rem;
}
.mini-spotlight .spotlight-image-wrap {
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(19, 32, 51, .07);
}
.mini-spotlight .spotlight-box {
  border-width: 3px;
  border-radius: 14px;
}
.mini-spotlight .spotlight-box span {
  top: -17px;
  min-width: 92px;
  padding: 4px 10px;
  font-size: .68rem;
}
.funnel-composite-panel { overflow: visible; }
.funnel-composite-wrap { overflow-x: auto; margin-top: 1.1rem; padding: 0 0 .65rem; }
.funnel-composite {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  align-items: stretch;
  min-width: 0;
}
.composite-phase {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff, #F8FFFD);
}
.composite-phase + .composite-phase::before { display: none; }
.composite-phase-label {
  justify-self: center;
  min-width: 138px;
  padding: 8px 18px;
  border-radius: 8px;
  background: #06395a;
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.45;
  text-align: center;
}
.composite-chain { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr) 28px minmax(0, 1fr) 28px minmax(0, 1fr); gap: 10px; align-items: center; }
.composite-chain.single { grid-template-columns: 1fr; justify-self: center; width: min(100%, 360px); }
.composite-part {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 210px;
  padding: 12px;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  scroll-margin-top: 26px;
  box-shadow: 0 10px 28px rgba(19, 32, 51, .06);
}
.composite-part.image-part img {
  display: block;
  width: 100%;
  height: 132px;
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
}
.composite-part strong {
  display: block;
  color: var(--ink);
  font-size: .92rem;
  line-height: 1.45;
  text-align: center;
}
.composite-part small {
  display: block;
  color: var(--muted);
  font-size: .7rem;
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
}
.part-badge {
  justify-self: start;
  min-height: 24px;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--sub);
  font-size: .68rem;
  font-weight: 900;
  line-height: 1.5;
}
.text-part { align-content: center; justify-items: center; background: var(--pale); }
.text-part-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: var(--main);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1;
}
.composite-arrow {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: 0 auto;
  border-radius: 999px;
  background: #06395a;
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
}
.composite-part:target {
  border-color: #FFD24D;
  background: #FFFDF2;
  box-shadow: 0 0 0 6px rgba(255, 210, 77, .26), 0 20px 48px rgba(157, 101, 23, .18);
}
.composite-part:target::before {
  content: "ここだよ";
  position: absolute;
  left: 50%;
  top: -17px;
  transform: translateX(-50%);
  z-index: 2;
  padding: 4px 12px;
  min-width: 72px;
  border-radius: 999px;
  background: #FFD24D;
  color: #3F2A00;
  font-size: .72rem;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 8px 18px rgba(157, 101, 23, .18);
}
.funnel-location-link {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--sub);
  font-size: .86rem;
  font-weight: 900;
  line-height: 1.45;
  text-decoration: none;
}
.funnel-location-link::after { content: "↗"; margin-left: 6px; font-size: .72rem; }
.funnel-location-link:hover { border-color: var(--main); background: var(--soft); text-decoration: none; }
.part-library { margin-top: 16px; }
.part-library-group + .part-library-group { margin-top: 18px; }
.part-library-group h3 { margin-bottom: 8px; color: var(--ink); font-size: 1rem; }
.part-library-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.part-library-card {
  display: grid;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--pale);
  color: var(--ink);
  text-decoration: none;
}
.part-library-card:hover { border-color: var(--main); background: var(--soft); text-decoration: none; }
.part-library-card img { display: block; width: 100%; height: 88px; object-fit: contain; border-radius: 8px; background: #fff; }
.part-library-card strong { color: var(--ink); font-size: .78rem; line-height: 1.45; }
.asset-table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; font-size: .95rem; }
.asset-table th, .asset-table td { padding: 13px 12px; border-top: 1px solid var(--line); text-align: left; vertical-align: top; }
.asset-table th { background: linear-gradient(180deg, var(--main), var(--sub)); color: #fff; font-size: .86rem; font-weight: 800; border-top: 0; }
.asset-table td p { color: var(--muted); font-size: 13px; }
.production-flow .pills { margin-top: .75rem; }
.production-flow-table { margin-top: .9rem; }
.production-flow-table th { width: 140px; }
.note + .asset-table,
.note + .concept-sequence,
.note + .jump-nav,
.asset-table + .asset-table { margin-top: 1rem; }
.roadmap-phase { scroll-margin-top: 18px; }
.roadmap-phase-spotlight {
  margin: 1rem 0 1.15rem;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}
.roadmap-phase-spotlight h3 {
  margin: 0;
  color: var(--main);
  font-size: 1rem;
}
.roadmap-phase-spotlight .spotlight-figure { margin-top: .8rem; }
.roadmap-steps { display: grid; gap: 0; }
.roadmap-step { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 1rem; padding: 1.1rem 0; border-top: 1px dashed var(--line); }
.roadmap-step:first-child { padding-top: 0; border-top: 0; }
.roadmap-step-num { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--soft); color: var(--sub); font-weight: 900; }
.roadmap-source-step { display: inline-flex; align-items: center; margin-bottom: .25rem; padding: .16rem .45rem; border: 1px solid var(--line); border-radius: 999px; color: var(--brand); font-size: .72rem; font-weight: 900; }
.roadmap-step h3 { margin-bottom: .3rem; }
.roadmap-step p { color: #324b44; line-height: 1.8; }
.roadmap-step .report-link { margin-top: .75rem; }
.roadmap-step-target {
  display: grid;
  gap: .55rem;
  margin: 0 0 .85rem;
  padding: .72rem .85rem;
  border: 1px solid #F3D67B;
  border-radius: 10px;
  background: #FFFDF2;
}
.roadmap-step-target-main {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  align-items: center;
}
.target-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--sub);
  font-size: .72rem;
  font-weight: 900;
  line-height: 1.35;
}
.target-koko {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 3px 11px;
  border-radius: 999px;
  background: #FFD24D;
  color: #3F2A00;
  font-size: .72rem;
  font-weight: 900;
  line-height: 1.35;
}
.roadmap-step-target strong {
  color: var(--ink);
  font-size: .95rem;
  line-height: 1.55;
}
.roadmap-step-figure {
  margin: 0;
}
.roadmap-step-figure summary {
  cursor: pointer;
  color: var(--sub);
  font-size: .78rem;
  font-weight: 900;
  line-height: 1.5;
}
.roadmap-step-figure summary:hover { color: var(--main); }
.roadmap-step-output {
  margin-top: .45rem;
  color: #324b44;
  font-weight: 760;
}
.roadmap-step-output span {
  display: inline-block;
  margin-right: .5rem;
  color: var(--sub);
  font-size: .78rem;
  font-weight: 900;
}
.chapter-asset-table th:nth-child(1) { width: 24%; }
.chapter-asset-table th:nth-child(3) { width: 16%; }
.copy-box { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: #26384c; white-space: pre-wrap; font-size: 14px; line-height: 1.82; }
.note { padding: 1rem 1.2rem; border: 1px solid var(--line); border-radius: 12px; background: var(--soft); color: #426158; font-weight: 650; }
.quote { margin-top: 1.1rem; padding: 1.05rem 1.2rem; border-left: 5px solid var(--main); background: var(--pale); color: #304840; font-weight: 650; border-radius: 0 12px 12px 0; }
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
.stepmail-shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 30px; align-items: start; padding: 0; overflow: visible; }
.stepmail-side { position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow: auto; padding: 1.5rem 1.25rem 1.6rem; border-right: 1px solid var(--line); background: var(--pale); }
.reader-side.stepmail-side {
  position: fixed;
  top: 0;
  max-height: none;
  padding: 18px 16px 72px;
  border-right: 1px solid var(--line);
  border-bottom: 0;
  background: var(--paper);
}
.stepmail-side h3 { margin: 0 0 .8rem; color: var(--ink); font-size: 1rem; }
.stepmail-side-section { margin: 1.15rem 0 .35rem; color: var(--sub); font-size: .72rem; font-weight: 900; letter-spacing: 0; }
.stepmail-side-link { display: block; padding: .58rem .55rem; border-radius: 8px; color: var(--ink); font-size: .82rem; line-height: 1.5; font-weight: 760; }
.stepmail-side-link:hover,
.stepmail-side-link.active { background: var(--soft); color: var(--sub); text-decoration: none; }
.stepmail-side-link .date { display: block; color: var(--muted); font-size: .68rem; line-height: 1.35; font-weight: 760; }
.stepmail-side-link.top-link { color: var(--sub); }
.stepmail-content { min-width: 0; padding: 2.6rem 2.8rem 3rem 0; }
.reader-page .stepmail-content { padding: 0; }
.stepmail-block { padding: 0 0 2.1rem; border-bottom: 1px solid var(--line); }
.stepmail-block + .stepmail-block { padding-top: 2rem; }
.stepmail-block p { max-width: 42em; color: #324b44; }
.reader-page .stepmail-block p { max-width: 48em; }
.block-label { margin: 0 0 .45rem; color: var(--sub); font-size: .78rem; font-weight: 900; }
.compact-table { margin-top: 1rem; font-size: .9rem; }
.compact-table th { width: 150px; background: var(--soft); color: var(--sub); }
.mail-entry-list { display: grid; gap: 0; }
.mail-entry { padding: 1.45rem 0; border-bottom: 1px dashed var(--line); }
.reader-page .mail-entry { padding: 2rem 0; }
.mail-entry:first-child { padding-top: .3rem; }
.mail-entry-head { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: .85rem; align-items: start; margin-bottom: .6rem; }
.mail-number { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; background: var(--soft); color: var(--sub); font-size: .82rem; font-weight: 900; }
.mail-entry h3 { margin: 0; color: var(--ink); font-size: 1.08rem; line-height: 1.55; }
.mail-full { margin-top: 1rem; }
.reader-page .article,
.reader-page .article p,
.reader-page .article ul,
.reader-page .article ol { max-width: 48em; }
.reader-page .copy-article { font-size: 1.02rem; line-height: 1.95; }
.lp-writing-flow { display: grid; gap: 0; margin: 1.35rem 0 2.25rem; border-top: 1px dashed var(--line); }
.lp-writing-flow .section-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px dashed var(--line);
}
.lp-writing-flow .section-row > span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--soft);
  color: var(--sub);
  font-size: .82rem;
  font-weight: 900;
}
.lp-writing-flow strong { display: block; color: var(--ink); font-size: 1.02rem; line-height: 1.5; }
.lp-writing-flow p { margin-top: .15rem; color: #405a53; font-size: .92rem; line-height: 1.75; }
.copy-part-heading {
  margin: 2.4rem 0 1.1rem;
  padding: .72rem 1rem;
  border-left: 6px solid var(--main);
  border-radius: 0 10px 10px 0;
  background: linear-gradient(90deg, rgba(44, 181, 150, .13), rgba(44, 181, 150, 0));
  color: var(--sub);
}
.copy-part-heading + .copy-article { margin-top: 0; }
.lp-copy-panel .copy-article + .copy-part-heading { margin-top: 3rem; }
.folder-list { display: grid; gap: 8px; margin-top: 1rem; }
.folder-list a {
  display: grid;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  text-decoration: none;
}
.folder-list a:hover { border-color: var(--main); background: var(--pale); text-decoration: none; }
.folder-list span { color: var(--sub); font-size: .72rem; font-weight: 900; }
.folder-list strong { color: var(--ink); font-size: .96rem; line-height: 1.55; }
.folder-list.compact { gap: 6px; margin-top: 0; }
.folder-list.compact a { padding: 9px 11px; }
.single-md { margin-top: 1.35rem; }
.script-block { padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.script-block + .script-block { margin-top: 12px; }
.script-block .time { display: inline-flex; margin-bottom: 7px; padding: 3px 8px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; }
.funnel { display: grid; grid-template-columns: 1fr; gap: 0; }
.funnel-step { padding: .8rem 0 .8rem 1rem; border: 0; border-left: 4px solid var(--line); background: transparent; text-align: left; font-weight: 850; }
details { border: 1px solid var(--line); border-radius: 8px; background: #fff; overflow: hidden; }
details + details { margin-top: 10px; }
summary { cursor: pointer; padding: 14px 16px; color: var(--ink); font-weight: 850; }
details .details-body { padding: 0 16px 16px; }
.layer-details { border-radius: 12px; box-shadow: 0 8px 24px rgba(24, 155, 125, .06); }
.layer-details summary { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 1rem; align-items: center; padding: 1.05rem 1.1rem; }
.layer-details summary strong { display: block; color: var(--ink); font-size: 1.12rem; line-height: 1.45; }
.layer-details .details-body { padding: 0 1.1rem 1.2rem; }
.layer-details .details-body > p { margin: .2rem 0 1rem; color: #324b44; }
.article-panel { padding: 3rem 3.2rem 3.4rem; }
.article { max-width: 42em; color: #243B36; font-size: 1.05rem; line-height: 1.95; }
.article h2 { margin: 2.8rem 0 1.1rem; padding: .55rem 0 .55rem 1rem; color: var(--sub); font-size: 1.32rem; line-height: 1.45; border-left: 6px solid var(--main); background: linear-gradient(90deg, rgba(44, 181, 150, .10), rgba(44, 181, 150, 0)); border-radius: 0 8px 8px 0; }
.article h2:first-child { margin-top: 0; }
.article h3 { margin: 2rem 0 .7rem; padding-left: .85rem; color: var(--ink); font-size: 1.1rem; border-left: 4px solid var(--line); }
.article h4 { margin: 1.4rem 0 .5rem; font-size: 1rem; color: var(--muted); }
.article p { margin: 1.15rem 0; color: #324b44; max-width: 42em; }
.article ul, .article ol { margin: .9rem 0; padding-left: 1.4rem; max-width: 42em; }
.article li { margin: .5rem 0; color: #324b44; }
.article li::marker { color: var(--main); }
.article strong { color: var(--sub); font-weight: 760; }
.article code { padding: 1px 5px; border-radius: 5px; background: var(--soft); color: var(--sub); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .92em; }
.full-source-list { display: grid; gap: 12px; }
.two-col-list { columns: 2; column-gap: 36px; }
.badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
@media (max-width: 1080px) {
  .flow-row, .source-card, .timeline-item { grid-template-columns: 1fr; }
  .funnel { grid-template-columns: 1fr; }
  .format-stages { grid-template-columns: 1fr; }
  .format-stage { border-left: 0; border-top: 1px solid var(--line); }
  .format-stage:first-child { border-top: 0; }
}
@media (max-width: 900px) {
  html { font-size: 16.5px; }
  .layout { display: block; padding-left: 0; }
  .reader-layout { display: block; padding-left: 0; }
  .side {
    position: sticky;
    top: 0;
    width: auto;
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
  .reader-side,
  .reader-side.stepmail-side {
    position: sticky;
    top: 0;
    width: auto;
    z-index: 20;
    height: auto;
    max-height: 42vh;
    padding: 12px 14px;
    overflow-x: hidden;
    overflow-y: auto;
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
  .reader-main { padding: 28px 18px 60px; }
  .reader-wrap { max-width: none; }
  .panel { padding: 1.6rem 1.3rem 2rem; border-radius: 14px; }
  .article-panel { padding: 1.6rem 1.3rem 2rem; }
  .roadmap-axis { min-width: 0; grid-template-columns: 1fr; }
  .traffic-source { display: flex; flex-wrap: wrap; align-content: start; padding-top: 0; }
  .traffic-source span { padding-right: 18px; text-align: left; }
  .axis-phase + .axis-phase::before { display: none; }
  .axis-nodes { grid-template-columns: 1fr; }
  .axis-days { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .funnel-composite { min-width: 0; grid-template-columns: 1fr; }
  .composite-phase + .composite-phase::before { display: none; }
  .composite-chain { grid-template-columns: 1fr; }
  .composite-arrow { transform: rotate(90deg); }
  .part-library-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pattern-grid { grid-template-columns: 1fr; }
  .stepmail-shell { display: block; padding: 0; }
  .stepmail-side { position: relative; top: auto; max-height: none; padding: 1.2rem; border-right: 0; border-bottom: 1px solid var(--line); }
  .stepmail-content { padding: 1.5rem 1.25rem 2rem; }
  .stepmail-block { padding-bottom: 1.6rem; }
  .stepmail-block + .stepmail-block { padding-top: 1.6rem; }
  .roadmap-step { grid-template-columns: 48px minmax(0, 1fr); gap: .8rem; }
  .roadmap-step-num { width: 40px; height: 40px; font-size: .84rem; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .two-col-list { columns: 1; }
}`;

const pages = new Map();

pages.set("visual-report.html", page({
  file: "visual-report.html",
  title: "全体構成レポート",
  eyebrow: "レポート",
  lead: "第1章で決めた目的、ファネル、KPI、制作対象を確認します。",
  body: `
<section class="panel"><h2>第1章の設計値</h2><table class="asset-table"><thead><tr><th>項目</th><th>今回の内容</th></tr></thead><tbody>
<tr><td>制作目的</td><td>WEBマーケターへの道の登録、価値提供、販売までの制作物を揃える。</td></tr>
<tr><td>商品</td><td>45日間WEBマーケター超実践ブートキャンプ</td></tr>
<tr><td>ファネル</td><td>チャレンジローンチ / 販売ページ直販</td></tr>
<tr><td>流入元</td><td>カツオリーチ。今回の流入元として記録する。</td></tr>
<tr><td>集客方式</td><td>オプト前VSL。集客ページ上で登録前にVSLを見せる。</td></tr>
	<tr><td>価値提供</td><td>価値提供フェーズのLINEオープンチャット + 5チャレ（Day1〜Day5）</td></tr>
<tr><td>販売方式</td><td>セールスレターでの販売ページ直販</td></tr>
<tr><td>決済後</td><td>購入完了ページ</td></tr>
</tbody></table></section>
${currentPatternImageCard()}
<section class="panel"><h2>見込み客が見る導線</h2>${visibleFunnelMap([
  ["オプトインLP", "集客", "LP原稿 / オプト前VSL台本 / LPヘッドデザイン指示書", "lp.html", "集客"],
  ["登録後サンキュー", "登録直後", "サンキューページ原稿 / 自動返信メール", "lp.html", "集客"],
	  ["価値提供フェーズのLINEオープンチャット", "参加場所", "固定投稿 / 通常配信", "line.html", "価値提供"],
  ["Day1〜Day5", "価値提供", "ライブ台本 / 課題 / 特典", "live-scripts.html", "価値提供"],
	  ["販売導線LINE", "販売接続", "販売接続メッセージ / 公式LINE登録誘導", "sales-oc.html", "販売"],
  ["期間限定レター", "販売", "セールスレター原稿 / 販売期配信", "sales-page.html", "販売"],
  ["購入完了ページ", "決済後", "購入完了ページ原稿", "sales-page.html", "販売"],
])}</section>
<section class="panel"><h2>KPI逆算</h2><div class="grid-4">
<div class="kpi"><span>商品単価</span><strong>60,000円</strong></div>
<div class="kpi"><span>目標売上</span><strong>1,800,000円</strong></div>
<div class="kpi"><span>目標販売数</span><strong>30名</strong></div>
<div class="kpi"><span>必要リスト数</span><strong>300件</strong></div>
</div><table class="asset-table"><thead><tr><th>計算項目</th><th>設計値</th><th>計算式</th></tr></thead><tbody>
<tr><td>目標販売数</td><td>30名</td><td>1,800,000円 ÷ 60,000円</td></tr>
<tr><td>販売ページ成約率</td><td>10%</td><td>仮置き</td></tr>
<tr><td>必要リスト数</td><td>300件</td><td>30名 ÷ 10%</td></tr>
<tr><td>1リスト獲得単価</td><td>3,000円</td><td>仮置き</td></tr>
<tr><td>広告費目安</td><td>900,000円</td><td>300件 × 3,000円</td></tr>
</tbody></table></section>
<section class="panel"><h2>KPI管理位置</h2><table class="asset-table"><thead><tr><th>位置</th><th>管理する数字</th><th>記録</th></tr></thead><tbody>
<tr><td>入口</td><td>登録数 / 登録率 / 流入元</td><td>カツオリーチ、ハウス、広告、紹介など</td></tr>
<tr><td>登録後</td><td>オープンチャット参加 / Day1着席</td><td>サンキューページ、自動返信メール</td></tr>
<tr><td>価値提供</td><td>ライブ参加 / 課題提出</td><td>Day別</td></tr>
<tr><td>販売前</td><td>公式LINE移動</td><td>Day5後</td></tr>
<tr><td>販売</td><td>レター閲覧 / 購入 / 売上</td><td>販売期間</td></tr>
</tbody></table></section>
<section class="panel"><h2>狙うスケジュール</h2><table class="asset-table"><thead><tr><th>日程</th><th>内容</th><th>時間</th></tr></thead><tbody>
<tr><td>8月21日（木）〜9月4日（木）</td><td>集客期間</td><td>Day1開始まで</td></tr>
<tr><td>8月21日（木）</td><td>集客スタート日</td><td>予定</td></tr>
<tr><td>9月4日（木）</td><td>集客終了日</td><td>予定</td></tr>
<tr><td>9月4日（木）</td><td>Day1ライブ</td><td>21:00〜22:30</td></tr>
<tr><td>9月7日（日）</td><td>Day2ライブ</td><td>21:00〜22:00</td></tr>
<tr><td>9月9日（火）</td><td>Day3ライブ</td><td>21:00〜22:00</td></tr>
<tr><td>9月12日（金）</td><td>Day4ライブ</td><td>21:00〜22:00</td></tr>
<tr><td>9月14日（日）</td><td>Day5ライブ</td><td>21:00〜22:30</td></tr>
<tr><td>9月14日（日）〜9月19日（金）</td><td>セールス期間</td><td>9月19日 23:59まで</td></tr>
</tbody></table></section>
<section class="panel"><h2>制作対象</h2><table class="asset-table"><thead><tr><th>区分</th><th>作る素材</th><th>確認ページ</th></tr></thead><tbody>
<tr><td>集客</td><td>オプトインLP原稿、LPヘッドデザイン指示書、オプト前VSL台本、オプトイン後メルマガ、サンキューページ原稿、紹介用文章、集客前メッセージ</td><td><a href="lp.html">集客素材</a></td></tr>
	<tr><td>価値提供</td><td>Day1〜Day5台本、課題、特典、価値提供フェーズのLINEオープンチャット（固定投稿/通常配信）</td><td><a href="value.html">価値提供素材</a></td></tr>
	<tr><td>販売</td><td>販売導線LINE、セールスレター原稿、セールスページヘッド指示書、販売メルマガ、販売期LINE、購入完了ページ原稿</td><td><a href="sales-page.html">販売素材</a></td></tr>
</tbody></table></section>
`}));

pages.set("roadmap.html", page({
  file: "roadmap.html",
  title: "制作工程表",
  eyebrow: "工程表",
  lead: "上から順に、どの素材を作るかを確認します。まずは1-1から進めます。",
  body: `${roadmapPhases.map((phase, index) => roadmapPhaseSection(phase, index)).join("")}`}));

pages.set("target.html", page({
  file: "target.html",
  title: "ターゲットシート",
  eyebrow: "設計シート",
  lead: "誰に向けて作るのか、どんな悩みを抱え、どの言葉なら動けるのかを整理します。",
  body: `<section class="panel"><h2>ターゲット仮止め</h2><div class="concept-sequence">
${conceptItem(1, "見込み客像", "Customer", "顔出しや派手な発信が苦手で、自分の商品や強い実績をまだ持っていない地味で平凡な会社員。副業や起業には関心があるが、自分がスターになる未来はしっくり来ていない。")}
${conceptItem(2, "持っている資質", "Strength", "真面目さ、継続力、支援力、客観視、数字を見る力。自分が前に出るより、誰かの売上や導線を支える方に適性がある。")}
${conceptItem(3, "止まっている理由", "Block", "顔出し、発信、商品作り、実績不足が壁になり、スキルを学んでも売上につながる全体像が見えない。")}
</div></section>
<section class="panel"><h2>悩みと勘違い</h2><div class="concept-sequence">
${conceptItem(1, "悩み", "Pain", "副業や起業に挑戦したいが、自分が表に出るのは怖い。SNSでキラキラ発信する自分も想像できず、どこから実践すればよいか分からない。")}
${conceptItem(2, "勘違い", "Misbelief", "稼ぐには自分が有名になる必要がある。自分の商品がないと始められない。単体スキルを積み上げれば自然に売上につながる。")}
${conceptItem(3, "真の原因", "Cause", "努力不足やセンス不足ではなく、売上までの全体構造を見通す型と、最初の実績を安全に作れる実践環境がないこと。")}
</div></section>
<section class="panel"><h2>動く条件</h2><ol><li>地味で平凡は弱みではなく、裏方Webマーケターの適性になり得ると分かる。</li><li>起業はスターになる道だけではないと分かる。</li><li>自分の商品がなくても、起業家のプロモーション支援で実績を作れると分かる。</li><li>単体スキルではなく、売れる仕組み全体を理解できると分かる。</li><li>45日間の実践環境で、最初の経験作りへ進めると分かる。</li></ol></section>
<section class="panel"><h2>LP/動画に使う感情</h2><p class="quote">地味で平凡だから向いていないのではなく、地味で平凡だからこそ、派手な自己演出ではなく売上構造を支える役割に向いている。</p></section>`}));

pages.set("concept.html", page({
  file: "concept.html",
  title: "コンセプトシート",
  eyebrow: "設計シート",
  lead: "LPや台本へ展開するためのコンセプト素材をまとめます。",
  body: `
${funnelSpotlightCard({
  title: "第2章の対象箇所",
  note: "コンセプト設計は、集客ページ、オプト前VSL、サンキューページ、販売ページへ展開する前提素材です。",
  focus: "concept",
  label: "第2章 コンセプト設計",
})}
<section class="panel"><h2>コンセプト設計結果</h2><div class="concept-sequence">
${conceptItem(1, "プロダクト理解", "Product", "45日間WEBマーケター超実践ブートキャンプ。知識の受講ではなく、売上導線を理解し、最初の実践経験を作るための環境。", ["Day1〜Day5でD.E.C.O.D.E.の全体像を学び、販売後に45日間の実践へ接続する。"])}
${conceptItem(2, "ターゲット仮止め", "Customer", "顔出しや派手な発信が苦手で、自分の商品や強い実績をまだ持っていない地味で平凡な会社員。", ["副業や起業には関心があるが、自分がスターになる未来はしっくり来ていない。", "真面目さ、継続力、支援力、数字を見る力を持っている。"])}
${conceptItem(3, "ライバル理解", "Competitor", "比較対象はSNS起業、副業スクール、Web制作スクール、広告運用講座、AI副業系。多くは個人が目立つこと、単体スキルを身につけること、自分の商品を売ることに寄りやすい。")}
${conceptItem(4, "3C分析", "3C", "Customerは顔出しや商品作りに抵抗がある会社員。Competitorは華やかさや単体スキル訴求に寄る講座群。Companyはプロダクトローンチ、ファネル設計、全員で勝つ文化、累計売上100億円超の実績を持つ田中祐一。")}
${conceptItem(5, "空きポジション", "Positioning", "表に立つ起業家でも作業者型の単体スキル習得でもなく、社長の右腕としてプロモーション全体を支え、売上に関わる裏方Webマーケター。")}
${conceptItem(6, "コンテンツホルダー側の強み", "Company", "お金をかけないプロダクトローンチ、ファネル全体の設計、起業家やコンテンツホルダーの売上を伸ばしてきた現場経験、ギラギラしないチーム型の土壌。")}
${conceptItem(7, "旧世界 / 新世界", "Worldview", "旧世界は、自分がスターになり、SNSで目立ち、自分の商品やフォロワーを持たなければ始められないという前提。新世界は、社長の右腕として裏方で売上を支える道があるという前提。")}
${conceptItem(8, "悩み", "Pain", "副業や起業に興味はあるが、顔出し、発信、商品作り、実績不足が壁になる。スキルを学んでも売上につながる全体像が見えず、どこから実践すればよいか分からない。")}
${conceptItem(9, "勘違い", "Misbelief", "稼ぐには自分が有名になる必要がある。自分の商品がないと始められない。単体スキルを積み上げれば自然に売上につながる。実績がない人はプロモーションに関われない。")}
${conceptItem(10, "真の原因", "Cause", "努力不足やセンス不足ではなく、売上までの全体構造を見通す型と、最初の実績を安全に作れる実践環境がないこと。")}
${conceptItem(11, "解決策", "Solution", "D.E.C.O.D.E.で集客、教育、販売、オファー、LTVを構造として理解し、裏方Webマーケターとしてプロモーション全体に関わる実践環境へ進む。")}
${conceptItem(12, "ストーリー", "Story", "田中祐一自身も最初から順調だったわけではなく、NTTデータ退職後に顧客獲得で苦戦し、プロダクトローンチを通じて売上を伸ばす道を見つけた。その経験が、表に出るだけではない売上支援の道につながっている。")}
${conceptItem(13, "ベネフィット", "Benefit", "才能、経験、顔出し、自分の商品がなくても、社長の右腕として売上に関われる。自分がスターにならずに、裏方として価値を出す道を持てる。")}
${conceptItem(14, "ミッション", "Mission", "価値あるコンテンツを世の中に送り出す人を増やし、表に立つ人だけでなく、裏方で支える人も含めて全員で勝つ土壌を作る。")}
${conceptItem(15, "パラダイムシフトトーク", "Shift", "地味で平凡だから向いていないのではなく、地味で平凡だからこそ、派手な自己演出ではなく売上構造を支える役割に向いている。起業はスターになる道だけではない。")}
${conceptItem(16, "コアシナリオ", "Scenario", "顔出しや商品作りに詰まる会社員に、裏方Webマーケターという空きポジションを提示し、5日間で売上構造を理解させ、45日間の実践環境で最初の経験作りへ進める。")}
</div></section>
<section class="panel"><h2>今回の採用コンセプト</h2><p class="quote">会社員はWEBマーケターを目指しなさい</p><div class="concept-sequence">
${conceptItem(1, "採用理由", "Concept", "ターゲットの自己認識を「起業に向いていない人」から「売上を支える裏方に向いている人」へ変える一文。")}
${conceptItem(2, "約束", "Promise", "才能、経験、顔出し、自分の商品がなくても、社長の右腕として売上に関われる道を提示する。")}
${conceptItem(3, "商品接続", "Bridge", "ノウハウの暗記ではなく、45日間の実践環境、伴走、チーム、最初の経験作りへ自然につなげる。")}
</div></section>
<section class="panel"><h2>3C分析</h2><div class="concept-sequence">
${conceptItem(1, "Customer", "見込み客", "顔出しや派手な発信が苦手で、自分の商品や強い実績をまだ持っていない会社員。売上に関わりたいが、何から始めるべきか分からない。")}
${conceptItem(2, "Competitor", "ライバル", "SNS起業、副業スクール、Web制作スクール、広告運用講座、AI副業系。華やかさ、単体スキル、短期収益化を訴求しやすい。")}
${conceptItem(3, "Company", "コンテンツホルダー", "プロダクトローンチ、ファネル設計、累計売上100億円超の実績、全員で勝つ文化、コンテンツホルダーの価値を世の中へ届ける現場経験。")}
</div></section>
<section class="panel"><h2>旧世界と新世界</h2><div class="concept-sequence">
${conceptItem(1, "旧世界", "Before", "自分がスターになり、SNSで目立ち、自分の商品やフォロワーを持たなければ始められない。単体スキルを積み上げても、売上までの全体構造が見えない。")}
${conceptItem(2, "新世界", "After", "社長の右腕として、裏方でプロモーションを支えながら売上に関われる。顔出しや自分の商品を前提にせず、ファネル全体を理解して実績を作れる。")}
</div></section>
`}));

pages.set("config.html", page({
  file: "config.html",
  title: "コンフィグ＋プロフィール",
  eyebrow: "設計シート",
  lead: "制作判断の基本コンフィグと、信頼形成に使う本人プロフィールを同じ場所で確認します。",
  body: `<section class="panel article-panel"><div class="article">
${markdownToHtml(configMarkdown)}
</div></section>
<section class="panel article-panel"><div class="article">
${markdownToHtml(tanakaProfileMarkdown)}
</div></section>`}));

pages.set("research.html", page({
  file: "research.html",
  title: "リサーチシート",
  eyebrow: "設計シート",
  lead: "同業ライバル、媒体別発信、取りこぼし、空きポジションを整理します。",
  body: `<section class="panel"><h2>同業ライバルリサーチ</h2>${competitorResearchTable()}</section>
<section class="panel"><h2>空きポジション分析結果</h2>${competitorPositionCards()}</section>
<section class="panel"><h2>3C分析</h2><div class="concept-sequence">
${conceptItem(1, "Customer", "顧客", "顔出しや商品作りに抵抗があり、発信者として目立つことに違和感がある会社員。真面目さや支援力はあるが、売上に関わる経験がない。")}
${conceptItem(2, "Competitor", "競合", "横山直宏さんは自分らしい経営と温かいコミュニティ、おさるさんはSNS動画とコンテンツ販売、仙道達也さんは魂の差別化と伴走支援、北野哲正さんはAHAコンセプトとコンサル型ビジネス、才流はBtoBメソッドと書籍・メディア導線に強い。")}
${conceptItem(3, "Company", "自社", "売上導線、プロモーション全体、プロダクトローンチ、コンテンツホルダー支援、全員で勝つ文化を持つ。")}
</div></section>
<section class="panel"><h2>ライバルが取りこぼしている顧客</h2><div class="concept-sequence">
${conceptItem(1, "顔出しが苦手な人", "Gap", "発信者本人が目立つモデルに入りづらい。")}
${conceptItem(2, "自分の商品がない人", "Gap", "商品作りから始めるモデルだと止まりやすい。")}
${conceptItem(3, "単体スキルだけでは不安な人", "Gap", "SNS動画、広告運用、AI活用を学んでも、売上全体にどうつながるかが見えない。")}
${conceptItem(4, "チームで支えたい人", "Gap", "自分が前に出るより、起業家や社長を支援する方が自然に力を出せる。")}
</div></section>
<section class="panel"><h2>空きポジション</h2><p class="quote">スター型起業でも単体スキル習得でもなく、起業家のプロモーションを裏方から支え、売上に関わる実績を作るWebマーケター。</p></section>
<section class="panel"><h2>ずらし方</h2><div class="concept-sequence">
${conceptItem(1, "世界観でずらす", "Worldview", "華やかに見せる起業ではなく、地味で平凡でも売上を支える道として見せる。")}
${conceptItem(2, "役割でずらす", "Role", "自分の商品を売る人ではなく、社長の右腕としてプロモーション全体に関わる人にする。")}
${conceptItem(3, "ノウハウでずらす", "Know-how", "単体スキルではなく、D.E.C.O.D.E.でファネル全体を理解する。")}
${conceptItem(4, "実践環境でずらす", "Offer", "学ぶだけではなく、最初の実績作りに向かう45日間の環境として見せる。")}
</div></section>
<section class="panel"><h2>ターゲットの感情</h2><ol><li>副業や起業には興味があるが、自分が表に出るのは怖い。</li><li>スキルを学んでも、売上につながる実感がない。</li><li>自分の商品やフォロワーがないので、始める資格がないと思っている。</li><li>でも、誰かを支えたり、仕組みを整えたりすることには向いている気がする。</li><li>地味でも現実的に売上へ関われる道があるなら知りたい。</li></ol></section>
<section class="panel"><h2>LP/動画に使う論点</h2><ol><li>地味で平凡は弱みではなく、裏方Webマーケターの適性になり得る。</li><li>起業はスターになる道だけではない。</li><li>自分の商品がなくても、起業家のプロモーション支援で実績を作れる。</li><li>単体スキルではなく、売れる仕組み全体を理解する。</li><li>45日間の実践環境で、最初の経験作りへ進む。</li></ol></section>`}));

pages.set("offer.html", page({
  file: "offer.html",
  title: "オファーシート",
  eyebrow: "設計シート",
  lead: "本命商品のオファーとして、何を提供するのか、それがいくらなのかをシンプルに整理します。",
  body: `${funnelSpotlightCard({
  title: "第3章の対象箇所",
  note: "オファーは、販売ページ、成約、商品提供へつなぐための商品条件として整理します。",
  focus: "offer-product",
  label: "オファー構築",
})}
<section class="panel"><h2>1. 何を提供するのか</h2><table class="asset-table"><thead><tr><th>項目</th><th>内容</th><th>詳細</th></tr></thead><tbody>
<tr><td><strong>商品名</strong></td><td>45日間Webマーケター“超”実践ブートキャンプ</td><td>45日で売る流れを体感し、Webマーケターとして最初の成功体験を掴む実践プログラム。</td></tr>
<tr><td><strong>メインプログラム</strong></td><td>前半15日間 + 後半30日間のチーム戦</td><td>前半15日間でプロの思考基準を身につけ、後半30日間でチーム運用、顔出し不要のInstagramアカウント運用、note販売まで実践する。</td></tr>
<tr><td><strong>実践環境</strong></td><td>最初の売上を安全に作る場</td><td>クライアント案件の前に、自分たちで集客から販売までをやり切り、最初の小さな売上体験を作る。</td></tr>
<tr><td><strong>サポート</strong></td><td>プロの現場を疑似体験するChatwork環境</td><td>チーム専用Chatworkと全体サポート用Chatworkを使い、クライアントワークに近い進捗共有、作戦会議、全体報告を体験する。</td></tr>
<tr><td><strong>サポート</strong></td><td>田中祐一による毎週1回のライブフォローアップ</td><td>45日間の進捗を支え、実践中の詰まりを全体で解消する。</td></tr>
<tr><td><strong>サポート</strong></td><td>インスタ専門家による週次添削サポート</td><td>プロの視点から投稿や運用を改善し、チーム実践を前に進める。</td></tr>
<tr><td><strong>特典</strong></td><td>5日間チャレンジ プロモーション素材一式</td><td>LP、セールスレター、動画シナリオ、各種クリエイティブなど、今回の5日間チャレンジで使った全設計図と全素材を丸ごと譲渡する。</td></tr>
<tr><td><strong>特典</strong></td><td>7つの絶対達成パッケージ</td><td>45日間の行動を前に進めるための補助パッケージとして提示する。詳細名称はセールスページ側で追加確認する。</td></tr>
<tr><td><strong>特典</strong></td><td>ナレハブ6か月無料</td><td>マーケティングを学ぶ完全招待制コミュニティ。3か月に1度の勉強会、動画教材、参加者だけの懇親会を含む。見るだけプラン/教材プランには付かない。</td></tr>
<tr><td><strong>特典</strong></td><td>PLC差額参加の権利</td><td>実践コース参加者は、1年以内にPLCへ参加する場合、今回の商品購入費用との差額で参加できる。</td></tr>
<tr><td><strong>返金保証</strong></td><td>返金保証なし</td><td>売上保証や返金保証で安心させる商品ではなく、何度でもテストできる最高の環境と本物の哲学を提供する方針。</td></tr>
</tbody></table></section>
<section class="panel"><h2>2. それがいくらなのか</h2><table class="asset-table"><thead><tr><th>プラン</th><th>価格</th><th>含まれるもの</th></tr></thead><tbody>
<tr><td><strong>実践コース</strong></td><td>69,800円（税込）</td><td>45日間の実践、チーム戦、全特典、サポート、ナレハブ、PLC差額参加の権利。</td></tr>
<tr><td><strong>見るだけプラン</strong></td><td>49,800円（税込）</td><td>実践コースの活動をウォッチできる。講義動画とプロモーション素材一式を受け取れる。直接サポートとナレハブはなし。</td></tr>
<tr><td><strong>教材プラン</strong></td><td>49,800円（税込）</td><td>講義動画とプロモーション素材一式を受け取れる。チーム実践、直接サポート、ナレハブはなし。</td></tr>
</tbody></table><p class="quote">受付は9月18日21時から9月21日21時までの4日間限定。実践コースは次回以降99,800円で提供予定のところ、5日間チャレンジ参加者向けに69,800円で提示する。</p></section>`}));

pages.set("assets.html", page({
  file: "assets.html",
  title: "制作物一覧",
  eyebrow: "制作物",
  lead: "集客、価値提供、販売の3カテゴリで、生成された原稿、台本、指示書を確認します。",
  body: `<section class="panel"><h2>制作物一覧</h2>${categoryShelf(productionCategoryRows)}</section>`}));

pages.set("lp.html", page({
  file: "lp.html",
  title: "集客の素材一覧",
  eyebrow: "制作物",
  lead: "登録前から登録直後、集客開始前までに作る素材を、一覧からすぐ確認できるようにまとめます。",
  body: `${funnelSpotlightCard({
  title: "集客素材の対象箇所",
  note: "集客素材は、集客ページ、オプト前VSL、サンキューページ、リスト化までの導線に使います。",
  focus: "lp",
  label: "集客素材",
})}
<section class="panel"><h2>集客で作る素材</h2>${materialShelf(acquisitionMaterialRows)}</section>
<section class="panel"><h2>素材の確認順</h2><p class="note">登録前から正式参加・Day1着席までの流れで確認します。</p>${materialFolderTable(acquisitionMaterialRows)}</section>`}));

pages.set("optin-after-mails.html", readerPage({
  file: "optin-after-mails.html",
  title: "オプトイン後メルマガ",
  eyebrow: "集客素材",
  lead: "登録直後から1時間後までに、正式参加とDay1着席へ戻すメールを確認します。",
  sidebar: mailAssetSidebar({ title: "オプトイン後メルマガ", indexFile: "optin-after-mails.html", activeFile: "optin-after-mails.html", rows: registrationMails }),
  body: mailAssetIndexBody({
    title: "オプトイン後メルマガ一覧",
    lead: "メール登録で止まった人を、サンキューページとLINEオープンチャット参加へ戻すためのメール群です。",
    rows: registrationMails,
  }),
}));

for (const mail of registrationMails) {
  pages.set(mail.assetFile, readerPage({
    file: mail.assetFile,
    title: mail.title,
    eyebrow: "オプトイン後メルマガ",
    lead: mailTiming(mail),
    sidebar: mailAssetSidebar({ title: "オプトイン後メルマガ", indexFile: "optin-after-mails.html", activeFile: mail.assetFile, rows: registrationMails }),
    body: singleMailBody(mail),
  }));
}

pages.set("traffic-mails.html", readerPage({
  file: "traffic-mails.html",
  title: "集客前メッセージ",
  eyebrow: "集客素材",
  lead: "ハウスリストや自社メルマガから登録ページへ送る集客開始前のメッセージを確認します。",
  sidebar: mailAssetSidebar({ title: "集客前メッセージ", indexFile: "traffic-mails.html", activeFile: "traffic-mails.html", rows: setupMails }),
  body: mailAssetIndexBody({
    title: "集客前メッセージ一覧",
    lead: "LP、VSL、サンキューページ、ライブ台本が揃った後に、登録へ送るための告知メール群です。",
    rows: setupMails,
  }),
}));

for (const mail of setupMails) {
  pages.set(mail.assetFile, readerPage({
    file: mail.assetFile,
    title: mail.title,
    eyebrow: "集客前メッセージ",
    lead: mailTiming(mail),
    sidebar: mailAssetSidebar({ title: "集客前メッセージ", indexFile: "traffic-mails.html", activeFile: mail.assetFile, rows: setupMails }),
    body: singleMailBody(mail),
  }));
}

pages.set("optin-lp-copy.html", page({
  file: "optin-lp-copy.html",
  title: "オプトインLP原稿",
  eyebrow: "集客素材",
  lead: "登録前に見込み客へ提示するLP本文です。動画視聴前から、6分視聴後に開く下部エリアまで、1本のLP原稿として確認します。",
  body: `<section class="panel article-panel lp-copy-panel"><h2>LP全体原稿</h2>
<p class="note">実際のページを開いた状態で、上からそのまま読めるように並べています。オプト前VSLを約6分視聴した後に表示される範囲も、このページ内で続けて確認できます。</p>
<div class="section-list lp-writing-flow">
<div class="section-row"><span>01</span><div><strong>ファーストビュー</strong><p>キャッチコピー、サブヘッド、オプト前VSLを配置します。</p></div></div>
<div class="section-row"><span>02</span><div><strong>動画視聴後に開くエリア</strong><p>ヘッドバナー、成果実績、特徴、CTA、プロフィールまでを続けて表示します。</p></div></div>
<div class="section-row"><span>03</span><div><strong>登録フォーム</strong><p>LINEオープンチャット参加へつなげるためのメール登録フォームを置きます。</p></div></div>
</div>
<h3 class="copy-part-heading">常時表示エリア</h3>
${copyArticleFrom(`${acquisitionMaterialRoot}/01_オプトインLP原稿/オプトインLP_動画視聴前.md`)}
<h3 class="copy-part-heading">動画6分視聴後に表示するエリア</h3>
${copyArticleFrom(`${acquisitionMaterialRoot}/01_オプトインLP原稿/オプトインLP_動画視聴後.md`)}</section>`}));

pages.set("referral-copy.html", page({
  file: "referral-copy.html",
  title: "紹介用文章",
  eyebrow: "集客素材",
  lead: "紹介元や既存リストから、オプトインLPへ送るための紹介文です。",
  body: `<section class="panel"><h2>紹介用文章</h2>${referralCopies[0] ? articleFrom(referralCopies[0]) : "<p class=\"muted\">紹介用文章のMDが見つかりません。</p>"}</section>`,
}));

pages.set("thank-you-copy.html", page({
  file: "thank-you-copy.html",
  title: "サンキューページ原稿",
  eyebrow: "集客素材",
  lead: "メール登録直後に表示し、LINEオープンチャット参加へ進めるページ本文です。",
  body: `<section class="panel article-panel"><h2>サンキューページ原稿</h2>${sourceDetailsList(list(`${acquisitionMaterialRoot}/05_サンキューページ原稿`))}</section>`}));

pages.set("value.html", page({
  file: "value.html",
  title: "価値提供の素材一覧",
  eyebrow: "制作物",
  lead: "価値提供フェーズのLINEオープンチャット、Day1〜Day5ライブ、課題、特典をまとめて確認します。",
  body: `${funnelSpotlightCard({
  title: "価値提供素材の対象箇所",
  note: "価値提供素材は、教育グループ内のDay1〜Day5、ライブ、課題、配信に使います。",
  focus: "content",
  label: "価値提供素材",
})}
<section class="panel"><h2>価値提供で作る素材</h2>${materialShelf(valueMaterialRows)}</section>
<section class="panel"><h2>素材の確認順</h2><p class="note">Day1着席後からDay5本編までを価値提供素材として確認します。Day5後の販売導線は販売素材へ分けます。</p>${materialFolderTable(valueMaterialRows)}</section>
<section class="panel"><h2>今回の価値提供構成</h2><div class="grid-3">
${card("5チャレ", "Challenge", "今回のサンプルはDay1〜Day5の5日間で、次ライブ Day2 を起点に設計する。", "live-scripts.html")}
${card("価値提供フェーズのLINEオープンチャット", "Community", "固定投稿、通常配信で、参加者の動きを止めない。", "line.html")}
${card("課題と特典", "Action", "各日の課題提出と特典案内で、学習ではなく実践へ進める。", "live-scripts.html")}
	</div></section>`}));

pages.set("value-mails.html", page({
  file: "value-mails.html",
  title: "価値提供中メール",
  eyebrow: "価値提供素材",
  lead: "今回の価値提供本編は価値提供フェーズのLINEオープンチャットとライブで担うため、メールは判断MDだけ確認します。",
  body: `<section class="panel article-panel"><h2>価値提供中メール</h2>${sourceDetailsList(list(`${valueMaterialRoot}/04_価値提供中メール`))}</section>`}));

pages.set("head.html", page({
  file: "head.html",
  title: "LPヘッドデザイン指示書",
  eyebrow: "制作物",
  lead: "LPのファーストビューで何を見せるか、指示書と参考サンプルをセットで渡せる形にします。",
  body: `<section class="panel article-panel"><h2>LPヘッドデザイン指示書</h2>${sourceDetailsList(list(`${acquisitionMaterialRoot}/02_LPヘッドデザイン指示書`))}</section>`}));

pages.set("line.html", readerPage({
  file: "line.html",
  title: "価値提供フェーズのLINEオープンチャット",
  eyebrow: "制作物",
  lead: "価値提供フェーズのLINEオープンチャットを、固定投稿と通常配信に分けて確認します。",
  sidebar: lineSidebar(),
  body: linePageBody()}));

for (const note of fixedNotes) {
  pages.set(note.file, readerPage({
    file: note.file,
    title: note.title,
    eyebrow: "価値提供LINE固定投稿",
    lead: "価値提供フェーズのLINEオープンチャットの固定投稿素材です。",
    sidebar: lineSidebar(note.file),
    body: singleMaterialBody(note, "固定投稿")}));
}

for (const spot of plannedSpots) {
  pages.set(spot.file, readerPage({
    file: spot.file,
    title: spot.title,
    eyebrow: "価値提供LINE通常配信",
    lead: `${spot.phase} / ${spotTiming(spot)}`,
    sidebar: lineSidebar(spot.file),
    body: singleMaterialBody(spot, spot.phase, spotTiming(spot))}));
}

pages.set("script-opening.html", page({
  file: "script-opening.html",
  title: "オプト前VSL台本",
  eyebrow: "制作物",
  lead: "LP上で登録前に見せる動画台本です。今回の案件ではオプト前VSLのみを制作対象にします。",
  body: `<section class="panel article-panel"><h2>オプト前VSL台本</h2>${sourceDetailsList(list(`${acquisitionMaterialRoot}/03_オプト前VSL台本`))}</section>`}));

pages.set("live-scripts.html", page({
  file: "live-scripts.html",
  title: "Day1〜Day5 ライブ台本",
  eyebrow: "制作物",
  lead: "5日間チャレンジの各ライブ台本を、目的、コア論点、課題、スライド指示書に分けて確認します。",
  body: `${funnelSpotlightCard({
  title: "ライブ台本の対象箇所",
  note: "ライブ台本は、教育グループ内のDay1〜Day5を進めるための素材です。",
  focus: "content",
  label: "Day1〜Day5",
})}
<section class="panel article-panel"><h2>Day1〜Day5ライブ台本</h2>${sourceDetailsList(list(`${valueMaterialRoot}/02_Day1〜Day5ライブ台本`))}</section>
<section class="panel article-panel"><h2>課題・特典</h2><p class="note">課題や回答シートは点数が多いため、ここでは一覧と短い抜粋だけを表示します。</p>${sourceSummaryList(list(`${valueMaterialRoot}/03_課題・特典`))}</section>
`}));

pages.set("sales-page.html", page({
  file: "sales-page.html",
  title: "販売の素材一覧",
  eyebrow: "制作物",
  lead: "販売導線LINE、販売メルマガ、販売期LINE、セールスレター、購入完了ページを一覧で確認します。",
  body: `${funnelSpotlightCard({
  title: "販売素材の対象箇所",
  note: "販売素材は、販売ページ、成約、商品提供へつなぐ導線に使います。",
  focus: "sales",
  label: "販売素材",
})}
<section class="panel"><h2>販売で作る素材</h2>${materialShelf(salesMaterialRows)}</section>
<section class="panel"><h2>素材の確認順</h2><p class="note">Day5後に販売へ接続するメッセージ、セールスレター、販売期配信、購入完了ページの順で確認します。</p>${materialFolderTable(salesMaterialRows)}</section>`}));

pages.set("sales-mails.html", readerPage({
  file: "sales-mails.html",
  title: "販売メルマガ",
  eyebrow: "販売素材",
  lead: "Day5後から販売終了までに送る販売期メルマガを、配信順に確認します。",
  sidebar: mailAssetSidebar({
    title: "販売メルマガ",
    indexFile: "sales-mails.html",
    activeFile: "sales-mails.html",
    rows: salesMails,
    parentHref: "sales-page.html",
    parentLabel: "販売素材一覧",
    sectionLabel: "販売メルマガ",
  }),
  body: mailAssetIndexBody({
    title: "販売メルマガ一覧",
    lead: "販売開始、価格不安、締切、終了案内など、販売期に送るメール群です。",
    rows: salesMails,
    label: "販売素材",
    overview: salesMailOverview,
  }),
}));

for (const mail of salesMails) {
  pages.set(mail.assetFile, readerPage({
    file: mail.assetFile,
    title: mail.title,
    eyebrow: "販売メルマガ",
    lead: mailTiming(mail),
    sidebar: mailAssetSidebar({
      title: "販売メルマガ",
      indexFile: "sales-mails.html",
      activeFile: mail.assetFile,
      rows: salesMails,
      parentHref: "sales-page.html",
      parentLabel: "販売素材一覧",
      sectionLabel: "販売メルマガ",
    }),
    body: singleMailBody(mail),
  }));
}

pages.set("sales-letter.html", page({
  file: "sales-letter.html",
  title: "セールスレター原稿",
  eyebrow: "販売素材",
  lead: "販売ページに掲載するセールスレター原稿です。",
  body: `<section class="panel article-panel"><h2>セールスレター原稿</h2>${sourceDetailsList(salesLetters)}</section>`}));

pages.set("sales-oc.html", readerPage({
  file: "sales-oc.html",
  title: "販売導線LINE",
  eyebrow: "販売素材",
  lead: "Day5後に販売へ接続するLINEメッセージを確認します。",
  sidebar: mailAssetSidebar({
    title: "販売導線LINE",
    indexFile: "sales-oc.html",
    activeFile: "sales-oc.html",
    rows: salesOcMessages,
    parentHref: "sales-page.html",
    parentLabel: "販売素材一覧",
    sectionLabel: "販売導線LINE",
  }),
  body: mailAssetIndexBody({
    title: "販売導線LINE一覧",
    lead: "Day5後に公式LINEや販売ページへ接続するためのLINEメッセージです。",
    rows: salesOcMessages,
    label: "販売素材",
    overview: salesOcOverview,
  }),
}));

for (const mail of salesOcMessages) {
  pages.set(mail.assetFile, readerPage({
    file: mail.assetFile,
    title: mail.title,
    eyebrow: "販売導線LINE",
    lead: mailTiming(mail),
    sidebar: mailAssetSidebar({
      title: "販売導線LINE",
      indexFile: "sales-oc.html",
      activeFile: mail.assetFile,
      rows: salesOcMessages,
      parentHref: "sales-page.html",
      parentLabel: "販売素材一覧",
      sectionLabel: "販売導線LINE",
    }),
    body: singleMailBody(mail),
  }));
}

pages.set("sales-line.html", readerPage({
  file: "sales-line.html",
  title: "販売期LINE",
  eyebrow: "販売素材",
  lead: "販売開始から締切までに送るLINE文面を確認します。",
  sidebar: mailAssetSidebar({
    title: "販売期LINE",
    indexFile: "sales-line.html",
    activeFile: "sales-line.html",
    rows: salesOfficialLines,
    parentHref: "sales-page.html",
    parentLabel: "販売素材一覧",
    sectionLabel: "販売期LINE",
  }),
  body: mailAssetIndexBody({
    title: "販売期LINE一覧",
    lead: "販売開始、質問回答、実績共有、締切案内など、販売期に送るLINE文面です。",
    rows: salesOfficialLines,
    label: "販売素材",
  }),
}));

for (const mail of salesOfficialLines) {
  pages.set(mail.assetFile, readerPage({
    file: mail.assetFile,
    title: mail.title,
    eyebrow: "販売期LINE",
    lead: mailTiming(mail),
    sidebar: mailAssetSidebar({
      title: "販売期LINE",
      indexFile: "sales-line.html",
      activeFile: mail.assetFile,
      rows: salesOfficialLines,
      parentHref: "sales-page.html",
      parentLabel: "販売素材一覧",
      sectionLabel: "販売期LINE",
    }),
    body: singleMailBody(mail),
  }));
}

pages.set("sales-head.html", page({
  file: "sales-head.html",
  title: "セールスページヘッド指示書",
  eyebrow: "販売素材",
  lead: "販売ページのファーストビューに必要なコピー、画像方向、CTAの指示書です。",
  body: `<section class="panel article-panel"><h2>セールスページヘッド指示書</h2>${sourceDetailsList(salesHeadDocs)}</section>`}));

pages.set("purchase-complete.html", page({
  file: "purchase-complete.html",
  title: "購入完了ページ原稿",
  eyebrow: "販売素材",
  lead: "決済後に表示する購入完了ページの原稿です。",
  body: `<section class="panel article-panel"><h2>購入完了ページ原稿</h2>${sourceDetailsList(purchaseCompleteDocs)}</section>`}));

const allPages = [
  ...pages,
  ["portal.css", css],
];

const dynamicPagePatterns = [
  /^optin-after-mail-\d+\.html$/,
  /^traffic-mail-\d+\.html$/,
  /^line-fixed-\d+\.html$/,
  /^line-normal-\d+\.html$/,
  /^sales-mail-\d+\.html$/,
  /^sales-oc-\d+\.html$/,
  /^sales-line-\d+\.html$/,
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  for (const entry of fs.readdirSync(dir)) {
    const shouldDeleteGeneratedPage = dynamicPagePatterns.some((pattern) => pattern.test(entry));
    const shouldDeletePublicSourceMd = dir === publicDir && entry.endsWith(".md");
    if (!shouldDeleteGeneratedPage && !shouldDeletePublicSourceMd) continue;
    fs.unlinkSync(path.join(dir, entry));
  }
  for (const [file, content] of allPages) {
    const normalized = file.endsWith(".html") ? normalizeOutputTerms(content) : content;
    const output = normalized.endsWith("\n") ? normalized : `${normalized}\n`;
    fs.writeFileSync(path.join(dir, file), output);
  }
  fs.mkdirSync(path.join(dir, funnelPatternAssetDir), { recursive: true });
  for (const row of funnelPatternRows) {
    if (fs.existsSync(row.source)) {
      fs.copyFileSync(row.source, path.join(dir, row.image));
    }
  }
  fs.mkdirSync(path.join(dir, funnelPartAssetDir), { recursive: true });
  for (const [, , , image, source] of funnelPartRows) {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(dir, image));
    }
  }
}

console.log(`Generated ${pages.size} HTML pages and portal.css`);
console.log(`Public: ${publicDir}`);
console.log(`Mirror: ${mirrorDir}`);
