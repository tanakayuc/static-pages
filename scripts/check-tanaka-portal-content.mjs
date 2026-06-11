#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const portalDirArg = process.argv[2] || "tanaka-portal-vercel";
const repoRoot = process.cwd();
const portalDir = path.resolve(repoRoot, portalDirArg);

const pages = [
  {
    file: "index.html",
    minBytes: 20000,
    required: ["PLCのAIポータル", "みんなのナレッジ"],
  },
  {
    file: "templates.html",
    minBytes: 30000,
    required: ["テンプレート集 ─ 最優先", "5日間チャレンジ型", "テンプレートを使いこなすために"],
  },
  {
    file: "skills.html",
    minBytes: 15000,
    required: ["28個のスキルノート", "LP・ファネル制作", "添削・フィードバック", "分析・リサーチ"],
  },
  {
    file: "rules.html",
    minBytes: 15000,
    required: ["ルール集 ─ 基盤", "設計思想", "AI連携・出力", "ファイル管理"],
  },
  {
    file: "knowledge.html",
    minBytes: 2500,
    required: ["みんなのナレッジ", "PLCのAIポータル"],
  },
];

if (!fs.existsSync(portalDir)) {
  console.error(`Portal directory not found: ${portalDir}`);
  process.exit(2);
}

const failures = [];

for (const page of pages) {
  const filePath = path.join(portalDir, page.file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${page.file}: missing`);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  const bytes = Buffer.byteLength(html, "utf8");

  if (bytes < page.minBytes) {
    failures.push(`${page.file}: too small (${bytes} bytes, expected >= ${page.minBytes})`);
  }

  for (const phrase of page.required) {
    if (!html.includes(phrase)) {
      failures.push(`${page.file}: missing required phrase "${phrase}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Tanaka portal content regression check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK: Tanaka portal content baseline checked in ${portalDirArg}`);
