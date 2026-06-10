#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import vm from "node:vm";

const args = process.argv.slice(2);
const reportArg = args.find((arg) => !arg.startsWith("--"));
const publicBase = valueAfter("--public-base");
const checkAllPublic = args.includes("--all-public");

if (!reportArg) {
  console.error(
    "Usage: node scripts/check-report-output.mjs <report-dir> [--public-base https://example/path] [--all-public]",
  );
  process.exit(2);
}

const repoRoot = process.cwd();
const reportDir = path.resolve(repoRoot, reportArg);
const failures = [];
const passes = [];

const forbiddenTerms = [
  /田中祐一[ー―−-]?OS/g,
  /ナレッジOS/g,
  /TanakaKnowledgeOS/g,
  /TANAKA YUICHI OS/g,
];

function valueAfter(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return "";
  return args[index + 1] || "";
}

function pass(message) {
  passes.push(message);
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(reportDir, relativePath));
}

function read(relativePath) {
  const filePath = path.join(reportDir, relativePath);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function checkNoForbiddenTerms(relativePath) {
  const text = read(relativePath);
  if (!text) return;
  const found = forbiddenTerms.flatMap((pattern) => text.match(pattern) || []);
  assert(found.length === 0, `${relativePath} has no old Tanaka OS branding`);
  if (found.length > 0) {
    console.error(`  found: ${[...new Set(found)].join(", ")}`);
  }
}

function loadSourceMaterials() {
  const sourceScript = read("visual/source-materials.js");
  if (!sourceScript) return null;

  const context = { window: {} };
  try {
    vm.runInNewContext(sourceScript, context, {
      filename: "visual/source-materials.js",
      timeout: 1000,
    });
  } catch (error) {
    fail(`visual/source-materials.js can be evaluated (${error.message})`);
    return null;
  }

  return context.window.MASUDA_SOURCE_MATERIALS || null;
}

function normalizeHref(href) {
  return href
    .split("/")
    .map((part) => decodeURIComponent(part))
    .join(path.sep);
}

function collectSourceFiles(data) {
  if (!data) return [];
  const items = [];
  for (const groupName of ["primary", "files"]) {
    const group = data[groupName];
    if (!Array.isArray(group)) continue;
    for (const item of group) {
      if (item && item.href) items.push(item);
    }
  }

  const byHref = new Map();
  for (const item of items) {
    if (!byHref.has(item.href)) byHref.set(item.href, item);
  }
  return [...byHref.values()];
}

function summarizeCategories(files) {
  const counts = new Map();
  for (const file of files) {
    const category = file.category || file.kind || "未分類";
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  return counts;
}

function selectPublicSamples(files) {
  if (checkAllPublic) return files;

  const samples = [];
  const seen = new Set();
  for (const file of files) {
    const category = file.category || file.kind || "未分類";
    if (seen.has(category)) continue;
    seen.add(category);
    samples.push(file);
  }
  return samples;
}

function getStatus(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(url, { timeout: 15000 }, (response) => {
      response.resume();
      resolve(response.statusCode || 0);
    });
    request.on("timeout", () => {
      request.destroy();
      resolve(0);
    });
    request.on("error", () => resolve(0));
  });
}

async function checkPublicUrl(label, url) {
  let status = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    status = await getStatus(url);
    if (status >= 200 && status < 400) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  assert(status >= 200 && status < 400, `${label} public URL returns ${status}: ${url}`);
}

async function main() {
  assert(fs.existsSync(reportDir), `${reportArg} directory exists`);

  for (const file of ["visual-report.html", "text-report.html", "visual/materials.html"]) {
    assert(exists(file), `${file} exists`);
    checkNoForbiddenTerms(file);
  }

  const textReport = read("text-report.html");
  assert(textReport.includes('<aside class="sidebar"'), "text-report.html has a sidebar");
  assert(textReport.includes('href="visual-report.html"'), "text-report.html links to visual-report.html");
  assert(textReport.includes('href="visual/materials.html"'), "text-report.html links to visual/materials.html");
  assert(textReport.includes("これが今回のレポートです"), "text-report.html declares the 3-piece report set");

  const materials = read("visual/materials.html");
  assert(materials.includes("原本素材集"), "materials.html is labeled as source materials");
  assert(materials.includes("取得済み素材一覧"), "materials.html exposes the acquired source list near the top");
  assert(materials.includes("URL・保存済み原本対応表"), "materials.html has URL/source mapping table");
  assert(materials.includes("summary-card"), "materials.html has category summary cards");
  assert(materials.includes("quickGroups"), "materials.html renders quick source groups");

  const sourceData = loadSourceMaterials();
  assert(Boolean(sourceData), "visual/source-materials.js exports source material data");

  const sourceFiles = collectSourceFiles(sourceData);
  assert(sourceFiles.length > 0, "source material data contains linked files");

  const missingLocalFiles = sourceFiles.filter((file) => {
    const localPath = path.join(reportDir, "visual", normalizeHref(file.href));
    return !fs.existsSync(localPath);
  });

  assert(missingLocalFiles.length === 0, `all ${sourceFiles.length} source material hrefs exist locally`);
  if (missingLocalFiles.length > 0) {
    for (const file of missingLocalFiles.slice(0, 10)) {
      console.error(`  missing: ${file.href}`);
    }
  }

  const categoryCounts = summarizeCategories(sourceFiles);
  console.log("Source material categories:");
  for (const [category, count] of [...categoryCounts.entries()].sort((a, b) => a[0].localeCompare(b[0], "ja"))) {
    console.log(`  - ${category}: ${count}`);
  }

  if (publicBase) {
    const base = publicBase.replace(/\/$/, "");
    await checkPublicUrl("visual-report.html", `${base}/visual-report.html?check=${Date.now()}`);
    await checkPublicUrl("text-report.html", `${base}/text-report.html?check=${Date.now()}`);
    await checkPublicUrl("visual/materials.html", `${base}/visual/materials.html?check=${Date.now()}`);

    const samples = selectPublicSamples(sourceFiles);
    console.log(`Checking ${samples.length} public source material sample(s)...`);
    for (const sample of samples) {
      await checkPublicUrl(sample.title || sample.href, `${base}/visual/${sample.href}`);
    }
  }

  console.log("");
  console.log(`Checklist result: ${failures.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Passed: ${passes.length}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
