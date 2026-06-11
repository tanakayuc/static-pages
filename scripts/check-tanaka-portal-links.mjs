#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const portalDirArg = args[0] || "tanaka-portal-vercel";
const repoRoot = process.cwd();
const portalDir = path.resolve(repoRoot, portalDirArg);
const failures = [];
const checked = [];

if (!fs.existsSync(portalDir)) {
  console.error(`Portal directory not found: ${portalDir}`);
  process.exit(2);
}

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.name === ".vercel") continue;
    if (entry.isDirectory()) {
      walkHtmlFiles(entryPath, files);
    } else if (entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }
  return files;
}

function hrefsFrom(html) {
  const matches = html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g);
  return [...matches].map((match) => match[1]);
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|javascript:|data:)/.test(url);
}

function stripHashAndQuery(url) {
  return url.split("#")[0].split("?")[0];
}

function candidatesFor(link, fromFile) {
  const cleanLink = stripHashAndQuery(link);
  if (!cleanLink || cleanLink.startsWith("#")) return [];

  if (cleanLink.startsWith("/")) {
    const withoutLeadingSlash = cleanLink.replace(/^\/+/, "");
    if (!withoutLeadingSlash) return [path.join(portalDir, "index.html")];

    const normalized = withoutLeadingSlash.replace(/\/+$/, "");
    return [
      path.join(portalDir, normalized),
      path.join(portalDir, `${normalized}.html`),
      path.join(portalDir, normalized, "index.html"),
    ];
  }

  const fromDir = path.dirname(fromFile);
  return [
    path.resolve(fromDir, cleanLink),
    path.resolve(fromDir, `${cleanLink}.html`),
    path.resolve(fromDir, cleanLink, "index.html"),
  ];
}

function existsAny(paths) {
  return paths.some((candidate) => fs.existsSync(candidate));
}

for (const filePath of walkHtmlFiles(portalDir)) {
  const relativeFile = path.relative(repoRoot, filePath);
  const html = fs.readFileSync(filePath, "utf8");

  for (const link of hrefsFrom(html)) {
    if (isExternal(link) || link.startsWith("#")) continue;

    const candidates = candidatesFor(link, filePath);
    if (candidates.length === 0) continue;

    checked.push(`${relativeFile} -> ${link}`);
    if (!existsAny(candidates)) {
      failures.push(`${relativeFile} links to missing internal target: ${link}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Internal link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK: ${checked.length} internal links checked in ${portalDirArg}`);
