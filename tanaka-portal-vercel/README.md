# PLCのAIポータル 更新ルール

このフォルダは `https://tanaka-portal.vercel.app/` の静的ページです。

## 内部リンクのルール

- `vercel.json` で `cleanUrls: true` を使っているため、`/templates/` は `templates.html` に対応します。
- 新しい内部リンク `/example/` を追加する場合は、必ず `example.html` か `example/index.html` も追加します。
- 外部リンクは `https://...` で明示します。

## 更新後の必須チェック

ポータルを更新したら、デプロイ前に必ず以下を実行します。

```bash
node scripts/check-tanaka-portal-links.mjs tanaka-portal-vercel
```

このチェックが通らない場合、Vercel本番で `404: NOT_FOUND` が出る可能性があります。

## 本番確認

デプロイ後は、変更したURLを `curl -I -L` で確認し、最終的に `200` が返ることを確認します。

```bash
curl -I -L https://tanaka-portal.vercel.app/templates/
curl -I -L https://tanaka-portal.vercel.app/skills/
curl -I -L https://tanaka-portal.vercel.app/rules/
```
