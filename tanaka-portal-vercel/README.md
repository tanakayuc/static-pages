# PLCのAIポータル 更新ルール

このフォルダは `https://tanaka-portal.vercel.app/` の静的ページです。

## 正本

- GitHub正本: `tanakayuc/static-pages`
- 対象ディレクトリ: `tanaka-portal-vercel/`
- 本番URL: `https://tanaka-portal.vercel.app/`
- Vercelプロジェクト: `tanaka-portal`

このポータルの原本は、必ずこのGitHubディレクトリに残します。
Vercel本番だけに存在するHTMLや、ローカルだけに存在するHTMLを正本にしてはいけません。

## 2026-06-11 復元事故の原因メモ

5月13日に配布されていたポータルは、Vercelの過去デプロイ成果物には残っていましたが、現在確認できる `tanaka-portal-vercel/` のGit履歴では6月10日以前の原本を確認できませんでした。
Vercel側の当時デプロイはGitHub連携ではなくCLIデプロイ由来だったため、GitHubにpushした内容と本番HTMLの対応が崩れた可能性が高いです。

その結果、6月11日の更新で `templates` / `skills` / `rules` のリンクは復旧したものの、内容が薄い新規ページに差し替わる退行が発生しました。
同日、Vercelの5月13日デプロイ成果物から3ページを復元し、GitHubへコミット済みです。

## 運用ルール

- 更新前に、必ず `tanaka-portal-vercel/` の該当HTMLを読む。
- 既存ページを作り直す場合は、旧ページの情報量・見出し・リンク数を比較してから差し替える。
- `templates.html` / `skills.html` / `rules.html` は、薄い仮ページで上書きしてはいけない。
- CLIでVercelへ緊急デプロイした場合も、同じ内容を必ずGitHubへcommit + pushする。
- 本番反映報告では、コミットIDだけでなく、本番URLの200確認と旧表示が消えている確認を行う。

## 内部リンクのルール

- `vercel.json` で `cleanUrls: true` を使っているため、`/templates/` は `templates.html` に対応します。
- 新しい内部リンク `/example/` を追加する場合は、必ず `example.html` か `example/index.html` も追加します。
- 外部リンクは `https://...` で明示します。

## 更新後の必須チェック

ポータルを更新したら、デプロイ前に必ず以下を実行します。

```bash
node scripts/check-tanaka-portal-links.mjs tanaka-portal-vercel
node scripts/check-tanaka-portal-content.mjs tanaka-portal-vercel
```

リンクチェックが通らない場合、Vercel本番で `404: NOT_FOUND` が出る可能性があります。
コンテンツチェックが通らない場合、今回のように「リンクはあるが中身が薄いページへ退行した」可能性があります。

## 本番確認

デプロイ後は、変更したURLを `curl -I -L` で確認し、最終的に `200` が返ることを確認します。
さらに、主要ページの必須文言が本番HTMLに存在することを確認します。

```bash
curl -I -L https://tanaka-portal.vercel.app/templates/
curl -I -L https://tanaka-portal.vercel.app/skills/
curl -I -L https://tanaka-portal.vercel.app/rules/
curl -L https://tanaka-portal.vercel.app/skills/ | rg "28個のスキルノート|LP・ファネル制作|添削・フィードバック"
curl -L https://tanaka-portal.vercel.app/templates/ | rg "テンプレート集 ─ 最優先|5日間チャレンジ型"
curl -L https://tanaka-portal.vercel.app/rules/ | rg "ルール集 ─ 基盤|設計思想|AI連携・出力"
```
