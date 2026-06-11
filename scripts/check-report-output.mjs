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
    if (!byHref.has(item.href)) {
      byHref.set(item.href, item);
    } else {
      byHref.set(item.href, { ...byHref.get(item.href), ...item });
    }
  }
  return [...byHref.values()];
}

function renderVisualStage(stageSlug, search = "") {
  const app = { innerHTML: "" };
  const context = {
    window: {
      location: {
        pathname: `/static-pages/report/visual/${stageSlug}.html`,
        search,
      },
    },
    document: {
      body: { dataset: { stage: stageSlug } },
      getElementById(id) {
        return id === "app" ? app : null;
      },
    },
    URLSearchParams,
    console,
  };

  try {
    vm.createContext(context);
    for (const file of ["visual/report-data.js", "visual/materials-data.js", "visual/report-app.js"]) {
      vm.runInContext(read(file), context, { filename: file, timeout: 1000 });
    }
  } catch (error) {
    fail(`visual report can render ${stageSlug} (${error.message})`);
    return { html: "", side: "" };
  }

  const side = app.innerHTML.match(/<aside class="side">([\s\S]*?)<\/aside>/)?.[1] || "";
  return { html: app.innerHTML, side };
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
  assert(fs.existsSync(path.join(repoRoot, "REPORT_OUTPUT_ARCHITECTURE.md")), "REPORT_OUTPUT_ARCHITECTURE.md exists");

  for (const file of ["index.html", "visual-report.html", "text-report.html", "visual/materials.html"]) {
    assert(exists(file), `${file} exists`);
    checkNoForbiddenTerms(file);
  }

  const textReport = read("text-report.html");
  assert(
    /<aside class="(sidebar|side)"/.test(textReport),
    "text-report.html has a sidebar",
  );
  assert(textReport.includes('href="visual-report.html"'), "text-report.html links to visual-report.html");
  assert(textReport.includes('href="visual/materials.html"'), "text-report.html links to visual/materials.html");
  assert(
    textReport.includes("ファネルレポートポータル") &&
      textReport.includes("ビジュアルレポート") &&
      textReport.includes("原本素材集"),
    "text-report.html links the report portal, visual report, and source materials",
  );
  assert(textReport.includes('id="priority-summary"'), "text-report.html has priority summary section");
  assert(textReport.includes("優先度 高") && textReport.includes("優先度 中") && textReport.includes("優先度 小"), "text-report.html classifies priority as high/medium/small");
  assert(!textReport.includes(">大</td>") && !textReport.includes("優先度: 低"), "text-report.html has no old priority wording");
  const materialVisualHrefPattern =
    /href="visual\/(optin-lp|thanks|stepmail|line-step|live-day[0-9]|consult-lp|seminar-lp|openchat)\.html/g;
  const materialVisualHrefs = [...textReport.matchAll(materialVisualHrefPattern)].map((match) => match[0]);
  assert(
    materialVisualHrefs.length === 0,
    "text-report.html material nav does not jump to visual material pages",
  );
  if (materialVisualHrefs.length > 0) {
    console.error(`  found: ${[...new Set(materialVisualHrefs)].join(", ")}`);
  }

  const materials = read("visual/materials.html");
  const reportApp = read("visual/report-app.js");
  const homeRender = renderVisualStage("home");
  assert(homeRender.html.includes("指摘件数と優先度内訳"), "visual report home shows priority breakdown");
  assert(homeRender.html.includes("優先度 高") && homeRender.html.includes("優先度 中") && homeRender.html.includes("優先度 小"), "visual report home uses high/medium/small priority labels");
  assert(reportApp.includes("function sidebarModeForStage"), "visual report sidebars are gated by stage depth");
  assert(
    !reportApp.includes('{ sidebar: "stage-findings", stage }') &&
      !reportApp.includes('{ sidebar: "findings", stage'),
    "visual report does not force finding sidebar on all stage pages",
  );
  assert(!reportApp.includes("参照元素材URL"), "visual report avoids duplicate source URL labels");
  const optinRender = renderVisualStage("optin-lp");
  assert(
    optinRender.side.includes("ファネルレポートポータル") &&
      optinRender.side.includes("ビジュアルレポート") &&
      optinRender.side.includes("原本素材集"),
    "optin visual sidebar keeps the top-level report nav",
  );
  assert(optinRender.side.includes("Live 5"), "optin visual sidebar can navigate to other first-level materials");
  assert(!optinRender.side.includes("ファーストビュー"), "optin visual sidebar does not duplicate right-side feedback items");
  assert(!optinRender.html.includes("素材集を開く"), "optin visual header does not duplicate source/material links");
  assert(optinRender.html.includes("優先度 高の指摘") && optinRender.html.includes("優先度 中の指摘") && optinRender.html.includes("優先度 小の指摘"), "optin visual feedback is grouped by high/medium/small priority");
  const stepmailRender = renderVisualStage("stepmail");
  assert(
    stepmailRender.side.includes("ファネル一覧へ戻る") &&
      stepmailRender.side.includes("全体所感"),
    "stepmail visual sidebar keeps the second-level material nav",
  );
  assert(
    stepmailRender.side.includes("Day01") || stepmailRender.side.includes("指摘 8"),
    "stepmail visual sidebar lists second-level mail materials",
  );
  assert(materials.includes("原本素材集"), "materials.html is labeled as source materials");
  assert(materials.includes("取得済み素材一覧"), "materials.html exposes the acquired source list near the top");
  assert(materials.includes("URL・保存済み原本対応表"), "materials.html has URL/source mapping table");
  assert(materials.includes("summary-card"), "materials.html has category summary cards");
  assert(materials.includes("quickGroups"), "materials.html renders quick source groups");
  const requiredMaterialNavItems = [
    "オプトインLP",
    "サンキューページ",
    "ステップメール",
    "ステップLINE",
    "ライブ1",
    "ライブ2",
    "ライブ3",
    "ライブ4",
    "ライブ5",
    "個別説明会ページ",
  ];
  const missingMaterialNavItems = requiredMaterialNavItems.filter((item) => !materials.includes(item));
  assert(
    missingMaterialNavItems.length === 0,
    "materials.html sidebar follows the visual report material flow",
  );
  if (missingMaterialNavItems.length > 0) {
    console.error(`  missing nav item(s): ${missingMaterialNavItems.join(", ")}`);
  }

  const sourceData = loadSourceMaterials();
  assert(Boolean(sourceData), "visual/source-materials.js exports source material data");

  const sourceFiles = collectSourceFiles(sourceData);
  assert(sourceFiles.length > 0, "source material data contains linked files");

  const sidebarSourcePaths = [...materials.matchAll(/data-source-path="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((sourcePath) => !sourcePath.includes("${") && !sourcePath.includes("' +"));
  const sourceFilePaths = new Set(sourceFiles.map((file) => file.path));
  const missingSidebarSourcePaths = sidebarSourcePaths.filter((sourcePath) => !sourceFilePaths.has(sourcePath));
  assert(
    missingSidebarSourcePaths.length === 0,
    "materials.html sidebar source links point to existing source files",
  );
  if (missingSidebarSourcePaths.length > 0) {
    console.error(`  missing source path(s): ${missingSidebarSourcePaths.join(", ")}`);
  }

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
