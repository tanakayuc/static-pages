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
      ["roadmap.html", "M", "工程表", "素材確認"],
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

const funnelSteps = [
  ["動画埋め込みLP", "オプトインLP本文、ヘッド指示、挨拶動画で登録動機を作る。"],
  ["サンキューページ", "登録直後にLINEオープンチャット参加へ誘導する。"],
  ["LINEオープンチャット", "固定ノート、事務連絡、Day1〜Day5の案内を集約する。"],
  ["Day1〜Day5配信", "ライブ、課題、Q&Aで価値提供と参加熱量を作る。"],
  ["公式LINE登録", "Day5で、レターを受け取りたい方だけを公式LINEへ移動させる。"],
  ["期間限定セールスレター", "公式LINE内で期限付きの販売ページを公開する。"],
];

const coreFunnelRows = [
  ["LP", "見込み客を登録へ動かす入口。動画、ヘッド、本文で参加理由を作る。", "lp.html"],
  ["サンキューページ", "登録直後に次アクションを示し、オープンチャット参加へ移動させる。", "lp.html"],
  ["オープンチャット", "参加者を受け止め、事務連絡、固定ノート、ライブ案内、課題、Q&Aを運用する。", "line.html"],
  ["Day1〜Day5コンテンツ", "5日間のライブ、課題、特典で価値提供と販売前の納得感を作る。", "live-scripts.html"],
  ["セールスレター販売", "個別説明会を挟まず、レターで本命商品を販売する。", "sales-page.html"],
];

const detailedAssetRows = [
  ["ヘッドデザイン指示", "LPとセールスページのファーストビュー制作指示。", "head.html"],
  ["挨拶動画", "登録直後に世界観と参加理由を伝える導入動画。", "script-opening.html"],
  ["オプトイン自動返信", "メール登録で止まった人をオープンチャットへ戻す。", "stepmail.html"],
  ["公式LINE登録誘導", "Day5後に、レター希望者を公式LINEへ移動させる。", "line.html"],
  ["販売期配信", "レター閲覧、締切、購入を促すメール/LINE。", "stepmail.html"],
  ["購入完了ページ", "決済後の案内、参加導線、次アクションを伝える。", "sales-page.html"],
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

const roadmapPhases = [
  {
    name: "1. 全体設計",
    summary: "何を売るか、どう売るか、どれくらい集めるかを仮決めし、制作判断の前提を置く。",
    items: [
      {
        name: "目的意識を明確にする",
        make: "この案件で作る最終成果物、売上目標、今回のプロモーションで達成したいことを1枚にまとめる。",
        input: "セールスレター、オプトインLP、既存の販売導線",
        output: "目的リスト",
        href: "visual-report.html",
      },
      {
        name: "販売したい商品を決める",
        make: "45日間実践コース、見るだけプラン、教材プランなど、販売する商品と価格帯を整理する。",
        input: "セールスページ、決済後導線、商品説明",
        output: "商品リスト（価格・期間付き）",
        href: "offer.html",
      },
      {
        name: "販売ファネルを決める",
        make: "オプトインLP、サンキュー、オープンチャット、Day1〜Day5、公式LINE、期間限定レターの流れを固定する。",
        input: "LP、サンキューページ、LINE導線、販売ページ",
        output: "ファネル種別と全体導線",
        href: "visual-report.html",
      },
      {
        name: "KPI仮設定",
        make: "登録数、参加率、課題提出、公式LINE移動、レター購入の見るべき数字を決める。",
        input: "販売価格、目標売上、過去の課題提出数",
        output: "KPI仮シミュレーション",
        href: "kpi.html",
      },
      {
        name: "既存素材確認",
        make: "LP、メール、LINE、ライブ台本、動画、販売ページ、MD原本の有無を棚卸しする。",
        input: "既存URL、MDファイル、動画URL",
        output: "既存素材リスト",
        href: "files.html",
      },
    ],
  },
  {
    name: "2. コンセプト設計",
    summary: "ターゲット、競合、自社の強みから、戦う場所と採用コンセプトを決める。",
    items: [
      {
        name: "事前情報収集",
        make: "講師プロフィール、実績、プロモーション背景、今回使う言葉の前提を整理する。",
        input: "LP掲載プロフィール、セールスレター、既存紹介文",
        output: "プロフィールシート",
        href: "profile.html",
      },
      {
        name: "ターゲットシート作成",
        make: "顔出しや発信が苦手で、自分の商品や強い実績がまだない会社員を具体化する。",
        input: "LPコピー、ライブ台本、販売ページの悩み訴求",
        output: "ターゲットシート",
        href: "concept.html",
      },
      {
        name: "ライバル情報の整理",
        make: "転職、スクール、副業、SNS起業など、見込み客が比較しそうな選択肢を並べる。",
        input: "競合リサーチ、既存LP、ターゲットの検索意図",
        output: "ライバル分析シート",
        href: "research.html",
      },
      {
        name: "空いている訴求の特定",
        make: "目立つ個人になる訴求ではなく、裏方で売上を支えるWebマーケター導線としてずらす。",
        input: "ライバル比較、3C分析、ターゲット感情",
        output: "空きポジション",
        href: "research.html",
      },
      {
        name: "ポジショニングの作成",
        make: "旧世界、新世界、真の原因、ベネフィット、ミッションを縦並びで整理する。",
        input: "ターゲット、ライバル、自社の強み",
        output: "コンセプトシート",
        href: "concept.html",
      },
      {
        name: "プロモーションコンセプト",
        make: "今回のキーワード「WEBマーケターへの道」を、LP、ライブ、レターで使える1行にする。",
        input: "コンセプトシート、コアシナリオ",
        output: "プロモコンセプト1行＋補強文",
        href: "head.html",
      },
      {
        name: "制作コンフィグ作成",
        make: "田中祐一AIとして避ける表現、判断軸、トーン、制作物ごとの優先順位をまとめる。",
        input: "田中祐一AIの判断軸、今回の案件素材",
        output: "制作コンフィグ",
        href: "config.html",
      },
    ],
  },
  {
    name: "3. オファー設計",
    summary: "何を提供するのか、それがいくらなのかを中心に、本命商品の条件を整理する。",
    items: [
      {
        name: "商品名",
        make: "販売する商品名とプラン名を、購入者が理解できる粒度で整理する。",
        input: "セールスページ、決済ページ、販売期配信",
        output: "商品名一覧",
        href: "offer.html",
      },
      {
        name: "提供内容",
        make: "45日間の実践環境、メインプログラム、サポート、教材、特典を分けて整理する。",
        input: "セールスレター、特典記載、購入後案内",
        output: "商品オファーシート",
        href: "offer.html",
      },
      {
        name: "サポート期間",
        make: "5日間チャレンジと45日間実践コースの期間、参加導線、実践の開始条件を整理する。",
        input: "LP、販売ページ、サンキューページ",
        output: "サポート設計",
        href: "offer.html",
      },
      {
        name: "特典/保証",
        make: "ナレハブ無料、PLC差額参加の権利、返金保証なしなど、購入条件として伝える要素を整理する。",
        input: "販売ページの特典/保証記載",
        output: "特典/保証シート",
        href: "offer.html",
      },
      {
        name: "価格と支払い方法",
        make: "各プランの税込価格、支払い方法、価格差の意味を整理する。",
        input: "決済ページ、セールスページ",
        output: "価格表",
        href: "offer.html",
      },
    ],
  },
  {
    name: "4. コンテンツ設計",
    summary: "チャレンジ全体の流れと、各日の教育テーマ、課題、特典、販売への接続を決める。",
    items: [
      {
        name: "お客様の声/実績素材整理",
        make: "課題提出数、実績、講師の過去ストーリーを、信頼形成に使える材料として整理する。",
        input: "Day別課題提出数、プロフィール、セールスレター",
        output: "お客様の声・実績素材リスト",
        href: "kpi.html",
      },
      {
        name: "全体カリキュラム",
        make: "5日間で見込み客の認識をどう変え、最後に45日間実践環境へ進ませるかを設計する。",
        input: "コンセプトシート、オファーシート、KPI",
        output: "全体カリキュラム",
        href: "live-scripts.html",
      },
      {
        name: "Day別テーマ",
        make: "Day1は全体像、Day2は左脳設計、Day3は右脳設計、Day4は実践、Day5は継続導線として整理する。",
        input: "既存ライブ台本、動画URL、チャレンジ設計",
        output: "Day別テーマ一覧",
        href: "live-scripts.html",
      },
      {
        name: "コアシナリオ",
        make: "旧世界から新世界へ移動する順番を、各日の教育テーマと販売導入に接続する。",
        input: "コンセプト、真の原因、パラダイムシフト材料",
        output: "コアシナリオシート",
        href: "concept.html",
      },
      {
        name: "ワーク/特典案",
        make: "各日の課題、提出特典、完走を促す動機づけを決める。",
        input: "Day別テーマ、既存課題、特典案",
        output: "ワーク/特典案リスト",
        href: "live-scripts.html",
      },
      {
        name: "スケジュール",
        make: "登録前、参加前、Day1〜Day5、Day5後、販売期の全体カレンダーを置く。",
        input: "ファネル全体、配信導線、販売期",
        output: "プロモ全体カレンダー",
        href: "roadmap.html",
      },
    ],
  },
  {
    name: "5. オプトイン開始セット",
    summary: "登録ページ、登録後ページ、挨拶動画、自動返信まで、入口で必要な素材を揃える。",
    items: [
      {
        name: "オプトインLP原稿",
        make: "誰に、何を約束し、なぜ今参加するのかをLP本文として整理する。",
        input: "コンセプト、プロフィール、ヘッド方向性",
        output: "オプトインLP原稿",
        href: "lp.html",
      },
      {
        name: "ヘッドデザイン指示",
        make: "ファーストビューで伝える約束、キーワード、デザイン方向を指示書にする。",
        input: "プロモーションコンセプト、LP本文",
        output: "ヘッドデザイン指示書",
        href: "head.html",
      },
      {
        name: "挨拶動画台本",
        make: "登録直後に、参加理由、世界観、次アクションを伝える動画台本を作る。",
        input: "LP、サンキューページ、参加導線",
        output: "挨拶動画台本",
        href: "script-opening.html",
      },
      {
        name: "サンキューページ原稿",
        make: "登録後にオープンチャット参加へ進めるための案内文を作る。",
        input: "サンキューページURL、オープンチャットURL",
        output: "サンキューページ原稿",
        href: "lp.html",
      },
      {
        name: "オプトイン自動返信",
        make: "メール登録だけで止まった人をオープンチャットへ戻す自動返信を作る。",
        input: "LP、サンキューページ、LINE導線",
        output: "自動返信メール",
        href: "stepmail.html",
      },
    ],
  },
  {
    name: "6. 配信導線",
    summary: "オープンチャット、メール、公式LINEを役割別に分け、参加と販売への移動を作る。",
    items: [
      {
        name: "オープンチャット全体ポータル",
        make: "参加者が最初に見る全体案内、ライブURL、課題、注意事項をまとめる。",
        input: "オープンチャットURL、Day別テーマ、課題",
        output: "全体ポータル文",
        href: "line.html",
      },
      {
        name: "オープンチャット固定投稿",
        make: "固定しておくべき参加ルール、ライブ案内、課題導線を整える。",
        input: "運用ルール、ライブ日程、課題フォーム",
        output: "固定投稿",
        href: "line.html",
      },
      {
        name: "通常配信",
        make: "Dayごとの案内、リマインド、課題提出、Q&A、未参加フォローを時系列に並べる。",
        input: "Day別スケジュール、ライブ台本、課題",
        output: "通常配信一覧",
        href: "line.html",
      },
      {
        name: "メルマガ件名と配信タイミング",
        make: "オプトイン後、ライブ前、販売期に送るメールを目的別に整理する。",
        input: "ステップメール、販売期配信",
        output: "メール配信一覧",
        href: "stepmail.html",
      },
      {
        name: "公式LINE登録誘導",
        make: "Day5後、レター希望者だけを公式LINEへ移動させる導線を作る。",
        input: "Day5台本、販売ページ、公式LINE URL",
        output: "公式LINE誘導文",
        href: "line.html",
      },
    ],
  },
  {
    name: "7. 台本制作",
    summary: "コンセプトを5日間の価値提供に変換し、Day5で販売導線へ接続する。",
    items: [
      {
        name: "Day1〜Day5ライブ台本",
        make: "各日の目的、教育テーマ、導入、メイン講義、課題、次回予告を整える。",
        input: "全体カリキュラム、Day別テーマ、既存台本",
        output: "Day1〜Day5ライブ台本",
        href: "live-scripts.html",
      },
      {
        name: "課題フォーム",
        make: "各日の課題提出先、提出内容、提出後の動機づけを整理する。",
        input: "ワーク/特典案、課題導線",
        output: "課題フォーム構成",
        href: "live-scripts.html",
      },
      {
        name: "提出特典",
        make: "課題提出者が受け取る特典や次アクションを明確にする。",
        input: "特典案、チャレンジ目的",
        output: "提出特典リスト",
        href: "live-scripts.html",
      },
      {
        name: "アーカイブ導線",
        make: "ライブ未参加者や復習者が動画へ戻れる導線を作る。",
        input: "動画URL、LINE配信、メール",
        output: "アーカイブ案内",
        href: "line.html",
      },
    ],
  },
  {
    name: "8. 販売導線",
    summary: "Day5後に公式LINEへ移動し、期間限定セールスレターで本命商品を販売する。",
    items: [
      {
        name: "販売前メッセージ",
        make: "レターを読む前に、誰に向けた案内なのか、なぜ今読むべきかを伝える。",
        input: "Day5台本、オファーシート、公式LINE",
        output: "販売前メッセージ",
        href: "line.html",
      },
      {
        name: "セールスレター",
        make: "問題提起、コンセプト、商品内容、価格、特典、保証、申込導線を1本にまとめる。",
        input: "コンセプト、オファー、プロフィール、実績素材",
        output: "セールスレター",
        href: "sales-page.html",
      },
      {
        name: "販売期メール/LINE",
        make: "公開、理由、事例、締切、最終案内の配信を目的別に整理する。",
        input: "販売ページ、締切、購入導線",
        output: "販売期配信一覧",
        href: "stepmail.html",
      },
      {
        name: "購入完了ページ",
        make: "決済後に必要な参加案内と次アクションをまとめる。",
        input: "購入後URL、運営連絡、参加導線",
        output: "購入完了ページ",
        href: "sales-page.html",
      },
    ],
  },
  {
    name: "9. 公開/改善",
    summary: "公開URL、MD原本、添削結果、差し替え履歴をまとめ、改善できる状態にする。",
    items: [
      {
        name: "公開URL台帳",
        make: "LP、サンキュー、オープンチャット、公式LINE、販売ページ、購入完了ページのURLをまとめる。",
        input: "公開済みURL",
        output: "公開URL台帳",
        href: "assets.html",
      },
      {
        name: "MD原本保存",
        make: "AIが再編集できるよう、各制作物のMD原本を一覧化する。",
        input: "MDファイル、HTML、元素材",
        output: "原本MD一覧",
        href: "files.html",
      },
      {
        name: "添削確認",
        make: "公開物と設計シートを見比べ、田中祐一AIの構成に合わない箇所を直す。",
        input: "公開ページ、フィードバック、設計シート",
        output: "添削レポート",
        href: "text-report.html",
      },
      {
        name: "差し替え履歴",
        make: "何を変更したか、どの公開URLへ反映したかを残す。",
        input: "Git差分、公開確認、修正メモ",
        output: "更新履歴",
        href: "files.html",
      },
    ],
  },
];

const contentVolumeRows = [
  ["動画/ライブ", "6本", "挨拶動画1本 + Day1〜Day5ライブ5本"],
  ["チャレンジ課題", "5本", "Day1〜Day5で課題あり。提出数をKPIとして見る。"],
  ["課題提出特典", "5点想定", "課題提出の動機づけと完走率を上げる。"],
  ["オプトイン開始セット", "5点", "LP本文、挨拶動画、ヘッド指示、サンキュー、自動返信メール。"],
  ["LINEオープンチャット", "固定3件 + 計画73件", "固定ノート、事務連絡、ライブ案内、課題、Q&A。"],
  ["販売導線", "レター1本 + 公式LINE8通", "Day5後に公式LINEへ移動し、期間限定レターを公開する。"],
];

const scheduleRows = [
  ["準備", "全体設計、コンセプト、オファー、コンテンツ設計を固める。"],
  ["オプトイン開始", "動画埋め込みLP、サンキュー、自動返信でLINEオープンチャットへ誘導する。"],
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
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="googlebot" content="noindex, nofollow, noarchive">
  <title>${esc(title)} | WEBマーケターへの道 制作ポータル</title>
  <link rel="stylesheet" href="portal.css?v=20260618-full-package">
</head>
<body class="${file === "index.html" ? "portal-home" : "report-page"}">
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

function inlineList(items) {
  return `<ul class="mini-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function status(label) {
  const cls = label.includes("要") ? "need" : label.includes("順次") ? "todo" : "";
  return `<span class="status ${cls}">${esc(label)}</span>`;
}

function source(relative) {
  return `<span class="source-path">${esc(relative)}</span>`;
}

function linkedAssetTable(rows) {
  return `<table class="asset-table"><thead><tr><th>素材</th><th>役割</th><th>確認ページ</th></tr></thead><tbody>${rows.map(([label, detail, href]) => `<tr><td><strong>${esc(label)}</strong></td><td>${esc(detail)}</td><td><a href="${esc(href)}">開く</a></td></tr>`).join("")}</tbody></table>`;
}

function roadmapJump(phases) {
  return `<nav class="jump-nav">${phases.map((phase, index) => `<a href="#phase-${index + 1}">${esc(phase.name)}</a>`).join("")}</nav>`;
}

function roadmapPhaseSection(phase, index) {
  return `<section class="panel roadmap-phase" id="phase-${index + 1}">
<h2>${esc(phase.name)}</h2>
<p class="note">${esc(phase.summary)}</p>
<table class="asset-table roadmap-table"><thead><tr><th>項目</th><th>作るもの</th><th>入力/確認</th><th>完成アウトプット</th><th>確認先</th></tr></thead><tbody>${phase.items.map((item) => `<tr><td><strong>${esc(item.name)}</strong></td><td>${esc(item.make)}</td><td>${esc(item.input)}</td><td>${esc(item.output)}</td><td><a href="${esc(item.href)}">開く</a></td></tr>`).join("")}</tbody></table>
</section>`;
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

const registrationMails = list("12_メルマガ/フェーズ1_ライブ前/メルマガ").map(parseMail);
const salesMails = list("12_メルマガ/フェーズ3_セールスプッシュ/メルマガ").map(parseMail);
const officialLines = list("12_メルマガ/フェーズ3_セールスプッシュ/公式LINE").filter((file) => !file.includes("00_")).map(parseMail);
const fixedNotes = list("11_オープンチャットメッセージ/固定ノート").map((relative) => ({ relative, title: titleOf(relative), excerpt: bodyExcerpt(relative, 280) }));
const spots = list("11_オープンチャットメッセージ/スポット配信").map(parseSpot);
const plannedSpots = spots.filter((item) => item.phase !== "実ログ");
const logOnlySpots = spots.filter((item) => item.phase === "実ログ");

const stepmailHierarchy = [
  {
    phase: "入口接続",
    timing: "登録直後〜1時間後",
    role: "LP登録だけで終わらせず、サンキューページとオープンチャット参加へ戻す。",
    check: "正式参加、ライブ日程、オープンチャット参加が明確か。",
    rows: registrationMails,
  },
  {
    phase: "価値提供接続",
    timing: "Day1〜Day5中",
    role: "ライブ、課題、アーカイブ、Q&Aはオープンチャット側で動かす。",
    check: "メールではなくLINE/オープンチャットで追走する前提を崩さない。",
    href: "line.html",
    rows: [],
  },
  {
    phase: "販売前リマインド",
    timing: "販売開始前日",
    role: "5日間の視聴期限を知らせ、Day5後の販売導線へ意識を戻す。",
    check: "セールスの前に、視聴すべき理由と残り時間が伝わるか。",
    rows: salesMails.slice(0, 1),
  },
  {
    phase: "販売開始",
    timing: "販売開始初日",
    role: "ブートキャンプ募集開始を伝え、公式LINE内のレターへ移動させる。",
    check: "募集開始、対象者、コース、CTAが一通で分かるか。",
    rows: salesMails.slice(1, 2),
  },
  {
    phase: "不安解消",
    timing: "販売開始初日夜",
    role: "高額投資の失敗経験に触れ、ノウハウではなく実践環境の価値へ戻す。",
    check: "価格不安、過去の失敗、行動できない不安を受け止めているか。",
    rows: salesMails.slice(2, 3),
  },
  {
    phase: "締切クロージング",
    timing: "販売終了当日",
    role: "残り16時間、残り3時間で、判断を先延ばしにしない理由を作る。",
    check: "締切、最後の案内、購入後の流れが混ざらず見えるか。",
    rows: salesMails.slice(3),
  },
];

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

function stepmailHierarchyTable(rows) {
  return `<table class="asset-table"><thead><tr><th>階層</th><th>タイミング</th><th>役割</th><th>確認すること</th><th>素材</th></tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${esc(row.phase)}</strong></td><td>${esc(row.timing)}</td><td>${esc(row.role)}</td><td>${esc(row.check)}</td><td>${row.rows.length ? `${row.rows.length}通` : row.href ? `<a href="${row.href}">LINE側で確認</a>` : "要確認"}</td></tr>`).join("")}</tbody></table>`;
}

function stepmailHierarchyDetails(rows) {
  return `<div class="full-source-list">${rows.map((row, index) => `<details ${index === 0 ? "open" : ""}><summary>${esc(row.phase)}｜${esc(row.timing)}</summary><div class="details-body"><p class="note">${esc(row.role)}</p>${row.rows.length ? mailTable(row.rows) : `<p>この階層はメール本文ではなく、<a href="${row.href}">LINE/オープンチャット配信管理</a>で追走します。メールページでは、役割だけを明示して導線を分けます。</p>`}</div></details>`).join("")}</div>`;
}

function stepmailPurposeId(index) {
  return `purpose-${String(index + 1).padStart(2, "0")}`;
}

function stepmailMailId(index) {
  return `mail-${String(index + 1).padStart(2, "0")}`;
}

function mailTiming(row) {
  return [row.day, row.time].filter(Boolean).join(" / ") || row.category || row.phase;
}

const stepmailMails = stepmailHierarchy.flatMap((group) => group.rows.map((mail) => ({ ...mail, purpose: group.phase })));

function stepmailSidebar() {
  const purposeLinks = stepmailHierarchy.map((row, index) => `<a class="stepmail-side-link" href="#${stepmailPurposeId(index)}"><span class="date">${esc(row.timing)}</span>${esc(row.phase)}</a>`).join("");
  const mailLinks = stepmailMails.map((mail, index) => `<a class="stepmail-side-link" href="#${stepmailMailId(index)}"><span class="date">${esc(mailTiming(mail))}</span>${esc(mail.title)}</a>`).join("");
  return `<aside class="stepmail-side">
<h3>ステップメール</h3>
<a class="stepmail-side-link top-link" href="index.html"><span class="date">Portal</span>トップに戻る</a>
<a class="stepmail-side-link top-link" href="#overview"><span class="date">Overview</span>全体像</a>
<div class="stepmail-side-section">目的別</div>
${purposeLinks}
<div class="stepmail-side-section">メール一覧</div>
${mailLinks}
</aside>`;
}

function stepmailPurposeSection(row, index) {
  const material = row.rows.length ? `${row.rows.length}通` : `<a href="${row.href}">LINE/オープンチャットで確認</a>`;
  return `<section id="${stepmailPurposeId(index)}" class="stepmail-block">
<p class="block-label">${esc(row.timing)}</p>
<h2>${esc(row.phase)}</h2>
<p>${esc(row.role)}</p>
<table class="asset-table compact-table"><tbody>
<tr><th>確認すること</th><td>${esc(row.check)}</td></tr>
<tr><th>素材</th><td>${material}</td></tr>
</tbody></table>
</section>`;
}

function stepmailMailArticle(mail, index) {
  return `<article id="${stepmailMailId(index)}" class="mail-entry">
<div class="mail-entry-head">
<span class="mail-number">${String(index + 1).padStart(2, "0")}</span>
<div>
<p class="block-label">${esc(mail.purpose)} / ${esc(mailTiming(mail))}</p>
<h3>${esc(mail.title)}</h3>
</div>
</div>
<p>${esc(mail.excerpt)}</p>
${mail.cta ? `<p class="cta-line">CTA: <a href="${esc(mail.cta)}">${esc(mail.cta)}</a></p>` : ""}
${source(mail.relative)}
</article>`;
}

function stepmailPageBody() {
  return `<section class="panel stepmail-shell">
${stepmailSidebar()}
<div class="stepmail-content">
<section id="overview" class="stepmail-block">
<p class="block-label">全体像</p>
<h2>ステップメール全体像</h2>
<p>このページは、増田さん案件のステップメールページと同じく、左側で目的別とメール一覧を追い、本文側で配信の役割と実素材を確認する構成です。</p>
<p>今回のWEBマーケターへの道では、メールは5日間の教育を全部担うのではなく、オプトイン直後の正式参加、販売前の再接続、販売開始、価格不安、締切クロージングを担当します。</p>
</section>
<section class="stepmail-block">
<p class="block-label">オプトイン自動返信メール / 販売期メルマガ</p>
<h2>目的別の全体像</h2>
${stepmailHierarchyTable(stepmailHierarchy).replace("<th>階層</th>", "<th>目的</th>")}
</section>
${stepmailHierarchy.map(stepmailPurposeSection).join("")}
<section class="stepmail-block">
<p class="block-label">配信順</p>
<h2>メール一覧</h2>
<div class="mail-entry-list">${stepmailMails.map(stepmailMailArticle).join("")}</div>
</section>
</div>
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

function lineSidebar() {
  const fixedLinks = fixedNotes.map((note, index) => `<a class="stepmail-side-link" href="#${lineFixedId(index)}"><span class="date">固定投稿</span>${esc(note.title)}</a>`).join("");
  const normalLinks = plannedSpots.map((spot, index) => `<a class="stepmail-side-link" href="#${lineSpotId(index)}"><span class="date">${esc(spotTiming(spot))}</span>${esc(spot.title)}</a>`).join("");
  return `<aside class="stepmail-side line-side">
<h3>LINE配信</h3>
<a class="stepmail-side-link top-link" href="index.html"><span class="date">Portal</span>トップに戻る</a>
<a class="stepmail-side-link top-link" href="#line-overview"><span class="date">Overview</span>全体ポータル</a>
<div class="stepmail-side-section">固定投稿</div>
${fixedLinks}
<div class="stepmail-side-section">通常配信</div>
${normalLinks}
</aside>`;
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
<p>${esc(note.excerpt)}</p>
${source(note.relative)}
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
<p>${esc(spot.excerpt)}</p>
${source(spot.relative)}
</article>`;
}

function linePageBody() {
  return `<section class="panel stepmail-shell line-shell">
${lineSidebar()}
<div class="stepmail-content">
<section id="line-overview" class="stepmail-block">
<p class="block-label">全体ポータル</p>
<h2>LINE全体ポータル</h2>
<p>LINEは、固定投稿で参加者の迷子を防ぎ、通常配信でライブ、課題、アーカイブ、販売期の案内を流します。Day5以降は、レター希望者を公式LINEへ移して販売導線を切り分けます。</p>
<table class="asset-table compact-table"><tbody>
<tr><th>固定投稿</th><td>${fixedNotes.length}件。ライブ参加、課題、特典、基本案内を常設する。</td></tr>
<tr><th>通常配信</th><td>${plannedSpots.length}件。ライブ前、価値提供中、販売期の計画配信。</td></tr>
<tr><th>実ログ</th><td>${logOnlySpots.length}件。実際の補足投稿やリアルタイム運用の記録。</td></tr>
<tr><th>公式LINE</th><td>${officialLines.length}通。販売ページURL、締切、質問回答、購入完了案内。</td></tr>
</tbody></table>
</section>
<section id="line-fixed" class="stepmail-block">
<p class="block-label">常設案内</p>
<h2>固定投稿</h2>
<p>参加者が毎回探す情報を固定投稿にまとめます。ライブ前後の案内、課題、特典、質問導線はここで迷わせないことが目的です。</p>
<div class="mail-entry-list">${fixedNotes.map(lineFixedArticle).join("")}</div>
</section>
<section id="line-normal" class="stepmail-block">
<p class="block-label">時系列</p>
<h2>通常配信</h2>
<p>通常配信は、ライブ前の期待値形成、価値提供中の参加維持、販売期のレター閲覧と締切案内に分けて確認します。</p>
<table class="asset-table compact-table"><thead><tr><th>フェーズ</th><th>件数</th><th>役割</th></tr></thead><tbody>
<tr><td>ライブ前</td><td>${phaseCounts["ライブ前"] || 0}件</td><td>参加前の期待値形成、概要説明、ライブ参加リマインド。</td></tr>
<tr><td>価値提供中</td><td>${phaseCounts["価値提供中"] || 0}件</td><td>ライブリンク、課題、アーカイブ、質問回答、特典案内。</td></tr>
<tr><td>販売期</td><td>${phaseCounts["販売期"] || 0}件</td><td>販売開始、質問回答、実績共有、締切、終了案内。</td></tr>
</tbody></table>
<h3 class="section-title">全スポット配信タイトル</h3>
<div class="mail-entry-list">${plannedSpots.map(lineSpotArticle).join("")}</div>
</section>
<section class="stepmail-block">
<p class="block-label">公式LINE</p>
<h2>販売期公式LINE</h2>
<p>Day5で公式LINE登録を促した後、公式LINE内で期間限定レター公開へつなげます。販売ページURL、締切、質問回答、購入完了案内を扱います。</p>
${mailTable(officialLines)}
</section>
</div>
</section>`;
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
.brand { display: grid; grid-template-columns: 46px 1fr; gap: 12px; align-items: center; margin-bottom: 24px; }
.brand-mark { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 8px; background: var(--main); color: #fff; font-weight: 850; }
.brand-title { margin: 0; font-size: 18px; line-height: 1.35; font-weight: 850; }
.brand-sub { display: block; margin-top: 2px; color: var(--muted); font-size: 12px; font-weight: 650; }
.nav-section { margin: 14px 0 5px; color: var(--muted); font-size: 11px; font-weight: 900; }
.nav-link { display: grid; grid-template-columns: 24px 1fr; gap: 8px; align-items: center; min-height: 34px; padding: 6px 8px; border-radius: 8px; color: #223449; font-size: 13px; font-weight: 760; }
.nav-link small { display: block; color: var(--muted); font-size: 10px; font-weight: 650; line-height: 1.35; }
.nav-link:hover, .nav-link.active { background: var(--soft); color: var(--sub); text-decoration: none; }
.nav-num { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 11px; font-weight: 850; }
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
.pills { display: flex; flex-wrap: wrap; gap: 7px; }
.pill { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 800; }
.jump-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.3rem; }
.jump-nav a { display: inline-flex; align-items: center; min-height: 36px; padding: 7px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: #2d6f61; font-size: 14px; font-weight: 850; text-decoration: none; }
.jump-nav a:hover { background: var(--soft); }
.asset-table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; font-size: .95rem; }
.asset-table th, .asset-table td { padding: 13px 12px; border-top: 1px solid var(--line); text-align: left; vertical-align: top; }
.asset-table th { background: linear-gradient(180deg, var(--main), var(--sub)); color: #fff; font-size: .86rem; font-weight: 800; border-top: 0; }
.asset-table td p { color: var(--muted); font-size: 13px; }
.roadmap-phase { scroll-margin-top: 18px; }
.roadmap-table th:nth-child(1) { width: 18%; }
.roadmap-table th:nth-child(2) { width: 32%; }
.roadmap-table th:nth-child(3) { width: 22%; }
.roadmap-table th:nth-child(4) { width: 18%; }
.roadmap-table th:nth-child(5) { width: 10%; }
.source-path { display: inline-block; margin-top: 6px; color: #607970; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; font-weight: 650; word-break: break-all; }
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
.stepmail-side h3 { margin: 0 0 .8rem; color: var(--ink); font-size: 1rem; }
.stepmail-side-section { margin: 1.15rem 0 .35rem; color: var(--sub); font-size: .72rem; font-weight: 900; letter-spacing: 0; }
.stepmail-side-link { display: block; padding: .58rem .55rem; border-radius: 8px; color: var(--ink); font-size: .82rem; line-height: 1.5; font-weight: 760; }
.stepmail-side-link:hover { background: var(--soft); color: var(--sub); text-decoration: none; }
.stepmail-side-link .date { display: block; color: var(--muted); font-size: .68rem; line-height: 1.35; font-weight: 760; }
.stepmail-side-link.top-link { color: var(--sub); }
.stepmail-content { min-width: 0; padding: 2.6rem 2.8rem 3rem 0; }
.stepmail-block { padding: 0 0 2.1rem; border-bottom: 1px solid var(--line); }
.stepmail-block + .stepmail-block { padding-top: 2rem; }
.stepmail-block p { max-width: 42em; color: #324b44; }
.block-label { margin: 0 0 .45rem; color: var(--sub); font-size: .78rem; font-weight: 900; }
.compact-table { margin-top: 1rem; font-size: .9rem; }
.compact-table th { width: 150px; background: var(--soft); color: var(--sub); }
.mail-entry-list { display: grid; gap: 0; }
.mail-entry { padding: 1.45rem 0; border-bottom: 1px dashed var(--line); }
.mail-entry:first-child { padding-top: .3rem; }
.mail-entry-head { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: .85rem; align-items: start; margin-bottom: .6rem; }
.mail-number { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; background: var(--soft); color: var(--sub); font-size: .82rem; font-weight: 900; }
.mail-entry h3 { margin: 0; color: var(--ink); font-size: 1.08rem; line-height: 1.55; }
.script-block { padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.script-block + .script-block { margin-top: 12px; }
.script-block .time { display: inline-flex; margin-bottom: 7px; padding: 3px 8px; border-radius: 999px; background: var(--soft); color: var(--sub); font-size: 12px; font-weight: 850; }
.funnel { display: grid; grid-template-columns: 1fr; gap: 0; }
.funnel-step { padding: .8rem 0 .8rem 1rem; border: 0; border-left: 4px solid var(--line); background: transparent; text-align: left; font-weight: 850; }
details { border: 1px solid var(--line); border-radius: 8px; background: #fff; overflow: hidden; }
details + details { margin-top: 10px; }
summary { cursor: pointer; padding: 14px 16px; color: var(--ink); font-weight: 850; }
details .details-body { padding: 0 16px 16px; }
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
}
@media (max-width: 900px) {
  html { font-size: 16.5px; }
  .layout { display: block; padding-left: 0; }
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
  .panel { padding: 1.6rem 1.3rem 2rem; border-radius: 14px; }
  .article-panel { padding: 1.6rem 1.3rem 2rem; }
  .stepmail-shell { display: block; padding: 0; }
  .stepmail-side { position: relative; top: auto; max-height: none; padding: 1.2rem; border-right: 0; border-bottom: 1px solid var(--line); }
  .stepmail-content { padding: 1.5rem 1.25rem 2rem; }
  .stepmail-block { padding-bottom: 1.6rem; }
  .stepmail-block + .stepmail-block { padding-top: 1.6rem; }
  .grid-2, .grid-3, .grid-4,
  .portal-home .grid-2, .portal-home .grid-3, .portal-home .grid-4 { grid-template-columns: 1fr; }
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
<div class="kpi"><span>制作工程</span><strong>9章</strong></div>
<div class="kpi"><span>設計シート</span><strong>5種</strong></div>
<div class="kpi"><span>配信原稿</span><strong>${registrationMails.length + salesMails.length + officialLines.length + spots.length + fixedNotes.length}件</strong></div>
<div class="kpi"><span>課題提出</span><strong>Day1 91件</strong></div>
</div></section>
<section class="panel"><h2>ポータルから確認できるもの</h2><div class="grid-3">
${card("工程表", "レポート", "細かな操作手順ではなく、各フェーズで何を作り、どんな成果物が揃うかを確認します。", "roadmap.html")}
${card("各種設計シート", "設計", "コンセプト、プロフィール、コンフィグ、リサーチ、オファーを制作物の前提として管理します。", "sheets.html")}
${card("制作物一覧", "制作", "LP、ヘッド、メール、LINE、挨拶動画、ライブ台本、セールスページを制作物として確認します。", "assets.html")}
</div></section>
<section class="panel"><h2>ワンステップ販売型の全体像</h2><div class="funnel">${coreFunnelRows.map(([label]) => `<div class="funnel-step">${esc(label)}</div>`).join("")}</div><p class="quote">全体設計では、LP、サンキューページ、オープンチャット、Day1〜Day5コンテンツ、期間限定セールスレター販売の5素材が揃っているかを確認します。詳細設計では、挨拶動画、自動返信、公式LINE移動、購入完了ページなどを追加して導線を厚くします。</p></section>
`}));

pages.set("visual-report.html", page({
  file: "visual-report.html",
  title: "全体構成レポート",
  eyebrow: "レポート",
  lead: "WEBマーケターへの道のファネル、教育設計、制作物パッケージを一枚で把握します。",
  body: `
<section class="panel"><h2>ワンステップ販売型の必須素材</h2><p class="note">全体設計では、細かな配信や制作手順よりも、この5素材がファネル内に組み込まれているかを確認します。</p>${linkedAssetTable(coreFunnelRows)}</section>
<section class="panel"><h2>制作ボリューム</h2><p class="note">第1章のKPIと第4章のコンテンツ設計をつなぐため、何本作るのか、チャレンジ項目があるのか、どこまで準備すれば公開できるのかをここで固定します。</p><table class="asset-table"><thead><tr><th>領域</th><th>本数/点数</th><th>内容</th></tr></thead><tbody>${contentVolumeRows.map(([area, count, detail]) => `<tr><td>${esc(area)}</td><td><strong>${esc(count)}</strong></td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table></section>
<section class="panel"><h2>全体スケジュール</h2><table class="asset-table"><thead><tr><th>タイミング</th><th>進めること</th></tr></thead><tbody>${scheduleRows.map(([timing, detail]) => `<tr><td>${esc(timing)}</td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table></section>
<section class="panel"><h2>詳細設計で追加された素材</h2><p class="note">全体設計の5素材をベースに、公開直前の運用で必要になる周辺素材を追加します。</p>${linkedAssetTable(detailedAssetRows)}</section>
<section class="panel"><h2>詳細設計後の導線</h2><div class="flow">${funnelSteps.map(([label, detail], index) => `<div class="flow-row"><strong>${index + 1}. ${esc(label)}</strong><p>${esc(detail)}</p>${status(index < 4 ? "原本あり" : "要確認")}</div>`).join("")}</div></section>
<section class="panel"><h2>教育設計</h2><div class="grid-2">${liveRows.map((row) => `<div class="card white"><span class="meta">${row.day}</span><h3>${esc(row.title)}</h3><p>${esc(row.purpose)}</p>${pills([row.core, `課題提出 ${row.count}`])}</div>`).join("")}</div></section>
<section class="panel"><h2>制作物パッケージ</h2><table class="asset-table"><thead><tr><th>区分</th><th>成果物</th><th>確認ページ</th></tr></thead><tbody>
<tr><td>設計</td><td>コンセプト、リサーチ、プロフィール、コンフィグ、オファー</td><td><a href="sheets.html">各種設計シート</a></td></tr>
<tr><td>集客</td><td>動画埋め込みオプトインLP、挨拶動画、サンキュー、自動返信メール、オープンチャット固定ノート</td><td><a href="lp.html">LP一覧</a> / <a href="stepmail.html">ステップメール</a></td></tr>
<tr><td>価値提供</td><td>Day1〜Day5ライブ台本、課題、特典、アーカイブ導線</td><td><a href="live-scripts.html">ライブ台本</a></td></tr>
<tr><td>販売</td><td>Day5公式LINE誘導、公式LINE内で期間限定公開するセールスレター、販売期メルマガ、購入完了ページ</td><td><a href="sales-page.html">セールスページ</a></td></tr>
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
  lead: "各章で何を作るのかを、入力、完成アウトプット、確認ページまで分解して確認します。",
  body: `<section class="panel"><h2>工程表の使い方</h2><p class="note">この工程表は、ワンステップ販売型ファネルを作るために必要な成果物を、章ごとではなく項目ごとに確認するためのものです。工程表の順番で素材を作り、前の章の成果物は後続のLP、配信、台本、販売導線で随時更新します。</p>${roadmapJump(roadmapPhases)}</section>
<section class="panel"><h2>ワンステップ販売型の必須素材</h2><p class="note">全体設計では、まず以下の5素材がファネル内に組み込まれているかを確認します。</p>${linkedAssetTable(coreFunnelRows)}</section>
<section class="panel flush"><h2>9章の詳細工程</h2></section>
${roadmapPhases.map((phase, index) => roadmapPhaseSection(phase, index)).join("")}
<section class="panel"><h2>全体スケジュール</h2><table class="asset-table"><thead><tr><th>タイミング</th><th>進めること</th></tr></thead><tbody>${scheduleRows.map(([timing, detail]) => `<tr><td>${esc(timing)}</td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table></section>
<section class="panel"><h2>制作ボリューム</h2><table class="asset-table"><thead><tr><th>領域</th><th>本数/点数</th><th>内容</th></tr></thead><tbody>${contentVolumeRows.map(([area, count, detail]) => `<tr><td>${esc(area)}</td><td><strong>${esc(count)}</strong></td><td>${esc(detail)}</td></tr>`).join("")}</tbody></table></section>`}));

pages.set("kpi.html", page({
  file: "kpi.html",
  title: "KPI設計",
  eyebrow: "レポート",
  lead: "動画埋め込みLPから公式LINE内の期間限定レターへ進む直販型チャレンジローンチの規模感を確認します。",
  body: `
<section class="panel"><h2>仮シミュレーション</h2><div class="grid-4">
<div class="kpi"><span>仮単価</span><strong>60,000円</strong></div>
<div class="kpi"><span>販売実績メモ</span><strong>30名</strong></div>
<div class="kpi"><span>仮売上</span><strong>180万円</strong></div>
<div class="kpi"><span>販売方式</span><strong>直販</strong></div>
</div><p class="quote">価格と実売上は正式確認が必要です。現状はオファーシート上の仮値として扱います。</p></section>
<section class="panel"><h2>参加行動の実績</h2><table class="asset-table"><thead><tr><th>課題</th><th>提出数</th><th>意味</th></tr></thead><tbody>${liveRows.map((row) => `<tr><td>${row.day}</td><td>${row.count}</td><td>${esc(row.task)}</td></tr>`).join("")}</tbody></table></section>
<section class="panel"><h2>見るべき数字</h2><div class="grid-3">${card("登録率", "入口", "オプトインLPごとの登録率と登録経路別の反応を見る。")}${card("ライブ参加/課題提出", "価値提供", "Dayごとの離脱と提出数を見る。Day1からDay5までの落ち方が重要。")}${card("公式LINEレター購入率", "販売", "Day5後に公式LINEへ移動した人が、期間限定レターから購入する率を見る。")}</div></section>
`}));

pages.set("sheets.html", page({
  file: "sheets.html",
  title: "各種設計シート",
  eyebrow: "設計シート",
  lead: "制作物の前提になるレポートとシートをまとめます。ここでの判断がLPや動画台本へ反映されます。",
  body: `<section class="panel"><h2>設計シート一覧</h2><div class="concept-sequence">
 ${conceptItem(1, "コンセプトシート", "Concept", "プロダクト理解、ターゲット仮止め、ライバル理解、3C分析、空きポジション、旧世界/新世界、真の原因、ベネフィット、ミッション、コアシナリオを整理する。", ["LPや台本へ展開できる素材集として扱う。"])}
 ${conceptItem(2, "リサーチシート", "Research", "ターゲットが見ているライバル、比較対象、取りこぼし、3C分析、空きポジション、ずらし方、ターゲット感情を整理する。", ["コンセプトの根拠になる市場・競合・顧客理解を置く。"])}
 ${conceptItem(3, "プロフィール", "Profile", "LP、ライブ冒頭、セールスページで信頼形成に使う田中祐一プロフィールを置く。")}
 ${conceptItem(4, "コンフィグ", "Config", "田中祐一AIが制作判断するときの視点、トーン、避ける表現、制作物ごとの優先順位を置く。")}
${conceptItem(5, "オファーシート", "Offer", "何を提供するのか、それがいくらなのかを中心に、本命商品として提示する条件を整理する。")}
 ${conceptItem(6, "ヘッドデザイン指示書", "Design", "LPとセールスページのファーストビューで、誰に何を約束するかを視覚化する。")}
 </div></section>`}));

pages.set("concept.html", page({
  file: "concept.html",
  title: "コンセプトシート",
  eyebrow: "設計シート",
  lead: "田中祐一AIのコンセプト設計フローに沿って、LPや台本へ展開できる素材集としてまとめます。",
  body: `
<section class="panel"><h2>田中祐一AIのコンセプト設計フロー</h2><p class="note">質問は一度で詰め切るのではなく、ざっくり掴んでから必要に応じて深掘りする。ここではLPや台本へ展開できる素材として整理します。</p><div class="concept-sequence">
${conceptItem(1, "プロダクト理解", "Product", "45日間WEBマーケター超実践ブートキャンプ。知識の受講ではなく、売上導線を理解し、最初の実践経験を作るための環境。", ["Day1〜Day5でD.E.C.O.D.E.の全体像を学び、販売後に45日間の実践へ接続する。"])}
${conceptItem(2, "ターゲット仮止め", "Customer", "顔出しや派手な発信が苦手で、自分の商品や強い実績をまだ持っていない地味で平凡な会社員。", ["副業や起業には関心があるが、自分がスターになる未来はしっくり来ていない。", "真面目さ、継続力、支援力、数字を見る力を持っている。"])}
${conceptItem(3, "ライバル理解", "Competitor", "比較対象はSNS起業、副業スクール、Web制作スクール、広告運用講座、AI副業系。多くは個人が目立つこと、単体スキルを身につけること、自分の商品を売ることに寄りやすい。")}
${conceptItem(4, "3C分析", "3C", "Customerは顔出しや商品作りに抵抗がある会社員。Competitorは華やかさや単体スキル訴求に寄る講座群。Companyはプロダクトローンチ、ファネル設計、全員で勝つ文化、累計売上100億円超の実績を持つ田中祐一。")}
${conceptItem(5, "空きポジション", "Positioning", "表に立つ起業家でも作業者型の単体スキル習得でもなく、社長の右腕としてプロモーション全体を支え、売上に関わる裏方Webマーケター。")}
${conceptItem(6, "自社の強み", "Company", "お金をかけないプロダクトローンチ、ファネル全体の設計、起業家やコンテンツホルダーの売上を伸ばしてきた現場経験、ギラギラしないチーム型の土壌。")}
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
${conceptItem(3, "Company", "自社", "プロダクトローンチ、ファネル設計、累計売上100億円超の実績、全員で勝つ文化、コンテンツホルダーの価値を世の中へ届ける現場経験。")}
</div></section>
<section class="panel"><h2>旧世界と新世界</h2><div class="concept-sequence">
${conceptItem(1, "旧世界", "Before", "自分がスターになり、SNSで目立ち、自分の商品やフォロワーを持たなければ始められない。単体スキルを積み上げても、売上までの全体構造が見えない。")}
${conceptItem(2, "新世界", "After", "社長の右腕として、裏方でプロモーションを支えながら売上に関われる。顔出しや自分の商品を前提にせず、ファネル全体を理解して実績を作れる。")}
</div></section>
`}));

pages.set("profile.html", page({
  file: "profile.html",
  title: "プロフィール",
  eyebrow: "設計シート",
  lead: "LP、ライブ冒頭、セールスページで信頼形成に使う田中祐一プロフィールです。",
  body: `<section class="panel article-panel"><div class="article">
${markdownToHtml(tanakaProfileMarkdown)}
</div></section>`}));

pages.set("config.html", page({
  file: "config.html",
  title: "コンフィグ",
  eyebrow: "設計シート",
  lead: "田中祐一AIが制作判断するときの視点、トーン、禁止表現をまとめます。",
  body: `<section class="panel article-panel"><div class="article">
${markdownToHtml(configMarkdown)}
</div></section>`}));

pages.set("research.html", page({
  file: "research.html",
  title: "リサーチシート",
  eyebrow: "設計シート",
  lead: "ターゲットが見ているライバル、取りこぼし、3C、空きポジションを整理し、コンセプトの根拠を確認します。",
  body: `<section class="panel"><h2>リサーチ目的</h2><p class="note">市場を広く眺めるだけではなく、見込み客が何と比較し、どこで諦め、どの空きポジションなら動けるかを確認します。</p></section>
<section class="panel"><h2>ターゲットが見ているライバル</h2><div class="concept-sequence">
${conceptItem(1, "SNS起業/インフルエンサー型", "Competitor", "自分の名前で売れる、華やかに見える。", ["取りこぼし: 顔出しや発信が苦手な会社員には重い。"])}
${conceptItem(2, "Web制作スクール", "Competitor", "スキルが明確で始めやすい。", ["取りこぼし: 時給型、作業者型に留まりやすく、売上全体の設計に入りにくい。"])}
${conceptItem(3, "広告運用講座", "Competitor", "数字に近く収益化のイメージを持ちやすい。", ["取りこぼし: コンセプト、教育、オファー、販売導線まで踏み込みにくい。"])}
${conceptItem(4, "AI副業系", "Competitor", "新しさと話題性がある。", ["取りこぼし: 実践環境や実績作りが曖昧になりやすい。"])}
</div></section>
<section class="panel"><h2>3C分析</h2><div class="concept-sequence">
${conceptItem(1, "Customer", "顧客", "顔出しや商品作りに抵抗があり、発信者として目立つことに違和感がある会社員。真面目さや支援力はあるが、売上に関わる経験がない。")}
${conceptItem(2, "Competitor", "競合", "個人が目立つ、単体スキルを習得する、短期収益化を見せる講座が多い。")}
${conceptItem(3, "Company", "自社", "売上導線、プロモーション全体、プロダクトローンチ、コンテンツホルダー支援、全員で勝つ文化を持つ。")}
</div></section>
<section class="panel"><h2>ライバルが取りこぼしている顧客</h2><div class="concept-sequence">
${conceptItem(1, "顔出しが苦手な人", "Gap", "発信者本人が目立つモデルに入りづらい。")}
${conceptItem(2, "自分の商品がない人", "Gap", "商品作りから始めるモデルだと止まりやすい。")}
${conceptItem(3, "単体スキルだけでは不安な人", "Gap", "Web制作、広告運用、AI活用を学んでも、売上全体にどうつながるかが見えない。")}
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
  body: `<section class="panel"><h2>1. 何を提供するのか</h2><table class="asset-table"><thead><tr><th>項目</th><th>内容</th><th>詳細</th></tr></thead><tbody>
<tr><td><strong>商品名</strong></td><td>45日間Webマーケター“超”実践ブートキャンプ</td><td>45日で売る流れを体感し、Webマーケターとして最初の成功体験を掴む実践プログラム。</td></tr>
<tr><td><strong>メインプログラム</strong></td><td>前半15日間 + 後半30日間のチーム戦</td><td>前半15日間でプロの思考OSをインストールし、後半30日間でチーム運用、顔出し不要のInstagramアカウント運用、note販売まで実践する。</td></tr>
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
  lead: "LP、配信、動画、課題、特典、販売素材を、制作物として確認します。",
  body: `<section class="panel"><h2>制作物カテゴリ</h2><div class="grid-3">
${sourceInventory().map(([label, count]) => card(label, `${count}件`, "原本MDとHTML確認ページをセットで管理します。")).join("")}
</div></section>
<section class="panel"><h2>制作物の入口</h2><table class="asset-table"><thead><tr><th>制作物</th><th>中身</th><th>確認</th></tr></thead><tbody>
<tr><td>オプトイン開始セット</td><td>動画埋め込みオプトインLP、挨拶動画台本、ヘッド指示、サンキューページ、オプトイン自動返信メール。</td><td><a href="lp.html">LP一覧</a></td></tr>
<tr><td>サンキューページ</td><td>登録直後にオープンチャット参加を正式登録として促すページ。公開URL: <a href="${urls.thanks}">${urls.thanks}</a></td><td><a href="lp.html">原稿を見る</a></td></tr>
<tr><td>LP/ページ</td><td>オプトインLP、サンキュー、公式LINE内で期間限定公開するセールスページ、購入完了ページ。</td><td><a href="lp.html">LP一覧</a></td></tr>
<tr><td>ヘッドデザイン</td><td>オプトインLPとセールスページのファーストビュー指示。</td><td><a href="head.html">ヘッド指示</a></td></tr>
<tr><td>メール/LINE</td><td>オプトイン自動返信、販売期メルマガ、LINEオープンチャット、Day5公式LINE誘導、販売期公式LINE。</td><td><a href="stepmail.html">メール</a> / <a href="line.html">LINE</a></td></tr>
<tr><td>動画/ライブ</td><td>挨拶動画、Day1〜Day5ライブ、課題、特典。</td><td><a href="script-opening.html">挨拶動画</a> / <a href="live-scripts.html">ライブ台本</a></td></tr>
<tr><td>販売</td><td>公式LINE内で期間限定公開するセールスレター、販売期配信、購入完了ページ。</td><td><a href="sales-page.html">セールスページ</a></td></tr>
</tbody></table></section>`}));

pages.set("lp.html", page({
  file: "lp.html",
  title: "LP一覧",
  eyebrow: "制作物",
  lead: "オプトイン開始に必要なLP本文、挨拶動画、ヘッド指示、サンキュー、自動返信メールをまとめて確認します。",
  body: `<section class="panel"><h2>ページ台帳</h2><table class="asset-table"><thead><tr><th>ページ</th><th>役割</th><th>URL</th><th>原本</th></tr></thead><tbody>
<tr><td>動画埋め込みオプトインLP</td><td>地味で平凡な会社員を5日間ライブへ登録させる入口。ページ内動画で期待値を作る。</td><td><a href="${urls.optin}">${urls.optin}</a></td><td>${source("02_オプトインLP/01_オプトページ_登録経路なし.md")}</td></tr>
<tr><td>動画視聴後LP</td><td>視聴後に登録意欲が高まった人向けの入口。</td><td><a href="${urls.optin}?ftid=b35oNFTBJXps">${urls.optin}?ftid=b35oNFTBJXps</a></td><td>${source("02_オプトインLP/02_オプトページ_動画視聴後LP.md")}</td></tr>
<tr><td>登録後サンキュー</td><td>オープンチャット参加を正式登録として促すページ。</td><td><a href="${urls.thanks}">${urls.thanks}</a></td><td>${source("03_サンキューページ/01_オプトイン後サンキューページ.md")}</td></tr>
<tr><td>期間限定セールスページ</td><td>Day5で公式LINEへ移動した人に、公式LINE内で期間限定公開する販売ページ。</td><td><a href="${urls.sales}">${urls.sales}</a></td><td>${source("06_セールス/01_セールスページ.md")}</td></tr>
<tr><td>購入完了ページ</td><td>決済後の案内と次アクションを伝えるページ。</td><td><a href="${urls.salesThanks}">${urls.salesThanks}</a></td><td>${source("06_セールス/02_購入完了サンキューページ.md")}</td></tr>
</tbody></table></section>
<section class="panel"><h2>オプトイン開始セット</h2><p class="note">自動返信まで完成すると、オプトインLPを公開してLINEオープンチャットへ参加させる最低限の導線が動かせます。</p><div class="grid-3">
${card("オプトインLP本文", "LP", "動画埋め込みLPの文章。登録理由と5日間の期待値を作る。", "lp.html")}
${card("挨拶動画台本", "Video", "LPまたはサンキューページで、参加前の自己認識を変える導入動画。", "script-opening.html")}
${card("ヘッダーデザイン指示書", "Design", "スマホで読めるファーストビューと画像生成・HTML制作の指示。", "head.html")}
${card("サンキューページ文章", "Thanks", "登録直後にオープンチャット参加へ移動させるページ本文。", "lp.html")}
${card("オプトイン自動返信メール", "Mail", "メール登録で止まった人を正式参加へ進める自動返信。", "stepmail.html")}
</div></section>
<section class="panel"><h2>オプトイン開始4点確認</h2><p class="note">LP公開時に最低限そろっているべき入口素材を、URL、原本、次アクションで確認します。</p><table class="asset-table"><thead><tr><th>素材</th><th>確認すること</th><th>原本/確認先</th></tr></thead><tbody>
<tr><td>オプトインLP</td><td>動画埋め込みLPの本文、ヘッド、登録CTAがつながっているか。</td><td>${source("02_オプトインLP/01_オプトページ_登録経路なし.md")}</td></tr>
<tr><td>サンキューページ</td><td>登録直後にオープンチャット参加へ移動できるか。</td><td>${source("03_サンキューページ/01_オプトイン後サンキューページ.md")}</td></tr>
<tr><td>挨拶動画</td><td>参加前の自己認識を変え、Day1へ期待値をつなぐか。</td><td><a href="script-opening.html">挨拶動画台本</a></td></tr>
<tr><td>オプトイン自動返信</td><td>メール登録で止まった人を、正式参加のオープンチャットへ戻せるか。</td><td>${registrationMails.map((mail) => source(mail.relative)).join("<br>")}</td></tr>
</tbody></table></section>
<section class="panel"><h2>オプトインLPのヘッド</h2><p class="quote">地味で平凡な会社員向け。才能・経験・顔出し不要の裏方起業のロードマップを公開。</p><p>登録導線はLINEオープンチャット参加までがセットです。メール登録だけで終わらせず、サンキューページと登録後メールで正式参加へ進めます。</p></section>
<section class="panel"><h2>登録直後メール実素材</h2><p class="note">LPとサンキューページだけで止まらないよう、登録直後と1時間後の自動返信まで同じ画面で確認します。</p>${mailTable(registrationMails)}</section>
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
  lead: "オプトイン自動返信と販売期メルマガを、目的別サイドバーと配信順で確認します。",
  body: stepmailPageBody()}));

pages.set("line.html", page({
  file: "line.html",
  title: "LINE/オープンチャット配信管理",
  eyebrow: "制作物",
  lead: "LINEオープンチャットを、全体ポータル、固定投稿、通常配信に分けて確認します。",
  body: linePageBody()}));

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
  lead: "公式LINE内で期間限定公開する販売ページを、公開URL、本文原稿、ヘッド指示、購入後導線に分けて確認します。",
  body: `<section class="panel"><h2>セールスページ情報</h2><p class="note">Day5でレター希望者を公式LINEへ誘導した後、公式LINE内で期間限定公開する販売ページです。制作物は混ぜずに、用途ごとに原本MDを分けて管理します。</p><table class="asset-table"><thead><tr><th>制作物</th><th>役割</th><th>確認先</th></tr></thead><tbody>
<tr><td>公開ページ</td><td>公式LINE内で案内する期間限定セールスページ。</td><td><a href="${urls.sales}">${urls.sales}</a></td></tr>
<tr><td>セールスレター本文</td><td>ページ全体の文章原稿。見出し、本文、CTAをここで管理する。</td><td>${source("06_セールス/01_セールスページ.md")}</td></tr>
<tr><td>ヘッド作成用プロンプト</td><td>ChatGPTや制作担当へ渡すファーストビュー制作指示。</td><td>${source("90_制作パッケージサンプル/06_ヘッドデザイン指示書.md")}</td></tr>
<tr><td>購入完了ページ</td><td>決済後の案内、次アクション、参加導線を伝えるページ。</td><td><a href="${urls.salesThanks}">${urls.salesThanks}</a></td></tr>
<tr><td>販売期配信</td><td>公開後に公式LINEとメールでレター閲覧、締切、購入を促す。</td><td><a href="line.html">LINE配信</a> / <a href="stepmail.html">ステップメール</a></td></tr>
</tbody></table></section>
<section class="panel"><h2>販売導線の素材対応</h2><div class="grid-4">
<div class="kpi"><span>セールスレター</span><strong>1本</strong></div>
<div class="kpi"><span>購入完了</span><strong>1ページ</strong></div>
<div class="kpi"><span>販売期メルマガ</span><strong>${salesMails.length}通</strong></div>
<div class="kpi"><span>公式LINE</span><strong>${officialLines.length}通</strong></div>
</div><p class="quote">販売ページ単体ではなく、Day5後の公式LINE登録、レター公開、販売期配信、購入完了案内までを一つの販売セットとして確認します。</p></section>
<section class="panel"><h2>ヘッド作成用プロンプト</h2><div class="copy-box">「実績がない」「顔出しは苦手」その真面目さが、あなたの可能性を止めているとしたら？\n\n45日間WEBマーケター超実践ブートキャンプ\n知識を増やすだけではなく、社長の右腕として売上に関わる最初の実践経験を作る45日間。</div></section>
<section class="panel"><h2>セールスレター全文</h2><p class="note">取得済みのセールスページ原本を、抜粋ではなくHTML上で読める本文として展開します。</p>
${sourceDetails("セールスページ原稿 本文", "06_セールス/01_セールスページ.md", 62000, true)}
</section>
<section class="panel"><h2>販売期メルマガ実素材</h2><p class="note">販売開始前日から締切直前まで、メールでレター閲覧と購入判断を促す配信です。</p>${mailTable(salesMails)}</section>
<section class="panel"><h2>販売期公式LINE実素材</h2><p class="note">公式LINE登録直後、販売開始、締切、終了案内までのメッセージを同じ販売ページ上でも確認できるようにします。</p>${mailTable(officialLines)}</section>
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
