(function () {
  const data = window.masudaVisualReportData;
  const materialData = window.masudaMaterialItems || {};
  const app = document.getElementById("app");
  const slug = document.body.dataset.stage || "home";
  const params = new URLSearchParams(window.location.search);
  const inVisualDir = window.location.pathname.includes("/visual/");
  const rootPrefix = inVisualDir ? "../" : "";
  const visualPrefix = inVisualDir ? "" : "visual/";

  const esc = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const SOURCE_FULL_LIMIT = 500;
  const SOURCE_CONDITIONAL_FULL_LIMIT = 1200;
  const SOURCE_LONG_LIMIT = 2000;
  const SOURCE_VISIBLE_OFFSET_LIMIT = 500;
  const SOURCE_TEXT_FULL_PREFIX = /^(メール|LINE)\//;

  const stageUrl = (stage) => `${visualPrefix}${stage.slug}.html`;
  const findingUrl = (stage, finding) => `${visualPrefix}finding.html?stage=${encodeURIComponent(stage.slug)}&finding=${encodeURIComponent(finding.stableId)}`;
  const materialsUrl = (stage = null, item = null) => {
    const base = `${visualPrefix}materials.html`;
    if (!stage) return base;
    const query = new URLSearchParams({ stage: stage.slug });
    if (item) query.set("item", item.stableId);
    return `${base}?${query.toString()}`;
  };
  const homeUrl = () => `${rootPrefix}visual-report.html`;
  const textUrl = () => `${rootPrefix}${data.textReport}`;
  const indexUrl = () => `${rootPrefix}${data.indexReport}`;
  const characterUrl = () => data.character ? `${rootPrefix}${data.character}` : "";
  const priorityLabel = (priority) => ({ high: "優先度: 高", medium: "優先度: 中", low: "優先度: 低" }[priority] || "優先度");
  const shouldShowLayer2Speech = (stage) => ["stepmail", "line-step"].includes(stage.slug);
  const sourceKindLabel = (stage) => {
    if (stage.kind === "image") return "キャプチャ表示";
    if ((stage.source || "").includes("LINE")) return "LINE本文抜粋";
    if ((stage.source || "").includes("書き起こし")) return "書き起こし抜粋";
    if ((stage.source || "").includes("Day")) return "配信本文抜粋";
    return "代表箇所";
  };
  const numberedStages = (() => {
    let count = 0;
    return data.stages.map((stage, stageIndex) => {
      const findings = (stage.findings || []).map((finding, findingIndex) => {
        count += 1;
        return {
          ...finding,
          displayId: String(count),
          stableId: `${stage.slug}-${finding.id || findingIndex + 1}`,
          anchorId: `${stage.slug}-${finding.id || findingIndex + 1}`,
        };
      });
      const pins = (stage.pins || []).map((pin, pinIndex) => ({
        ...pin,
        displayId: findings[pinIndex]?.displayId || pin.id,
        anchorId: findings[pinIndex]?.anchorId || pin.id,
        finding: findings[pinIndex],
      }));
      const materialItems = (materialData[stage.slug] || stage.materialItems || []).map((item, itemIndex) => {
        const finding = findings.find((candidate) => candidate.sourceFile === item.sourceFile);
        return {
          ...item,
          sequence: item.sequence || itemIndex + 1,
          stableId: `${stage.slug}-${item.id || itemIndex + 1}`,
          anchorId: `${stage.slug}-${item.id || itemIndex + 1}`,
          finding,
        };
      });
      return {
        ...stage,
        sequence: stageIndex + 1,
        findings,
        pins,
        materialItems,
      };
    });
  })();

  function tanakaSpeech(text, label = "田中祐一の全体総評") {
    if (!text || !data.character) return "";
    return `
      <section class="tanaka-card">
        <div class="tanaka-portrait">
          <img src="${esc(characterUrl())}" alt="田中祐一アニメキャラクター">
        </div>
        <div class="speech">
          <span>${esc(label)}</span>
          <p>${esc(text)}</p>
        </div>
      </section>
    `;
  }

  function renderSourceContext(finding) {
    const highlight = finding.highlight || finding.before || finding.excerpt || finding.issue;
    const display = buildSourceDisplay(finding, highlight);
    if (!display.highlight && !display.before && !display.after) return "";
    const sourceHtml = [
      display.before ? `<span class="context-fade">${esc(display.before)}</span>` : "",
      display.highlight ? renderHighlightedSource(display.highlight, finding.displayId) : "",
      display.after ? `<span class="context-fade">${esc(display.after)}</span>` : "",
    ].join("");
    return `
      <div class="source-context ${esc(display.mode)}" aria-label="指摘対象の周辺文脈">${sourceHtml}</div>
      ${display.fullText ? `
        <details class="source-fulltext">
          <summary>全文を開く（${esc(display.lengthLabel)}）</summary>
          <div>${esc(display.fullText)}</div>
        </details>
      ` : ""}
    `;
  }

  function buildSourceDisplay(finding, highlight) {
    const contextBefore = finding.contextBefore || "";
    const contextAfter = finding.contextAfter || "";
    const fullText = finding.fullText || finding.sourceText || finding.transcriptText || "";
    const fullLength = countSourceChars(fullText);
    const match = findSourceMatch(fullText, highlight);
    const exactIndex = match ? match.start : -1;
    const matchedHighlight = match ? match.highlight : highlight;
    const highlightOffset = exactIndex >= 0 ? countSourceChars(fullText.slice(0, exactIndex)) : Number.POSITIVE_INFINITY;
    const forceFullSource = SOURCE_TEXT_FULL_PREFIX.test(finding.sourceFile || "");
    const canShowFullText = exactIndex >= 0 && (
      forceFullSource ||
      fullLength <= SOURCE_FULL_LIMIT ||
      (fullLength <= SOURCE_CONDITIONAL_FULL_LIMIT && highlightOffset <= SOURCE_VISIBLE_OFFSET_LIMIT)
    );

    if (canShowFullText) {
      return {
        mode: "full-source",
        before: fullText.slice(0, exactIndex),
        highlight: matchedHighlight,
        after: fullText.slice(match.end),
        fullText: "",
        lengthLabel: `${fullLength}文字`,
      };
    }

    if (exactIndex >= 0) {
      const radius = fullLength >= SOURCE_LONG_LIMIT ? 260 : 340;
      const beforeStart = Math.max(0, exactIndex - radius);
      const afterEnd = Math.min(fullText.length, match.end + radius);
      return {
        mode: "context-source",
        before: `${beforeStart > 0 ? "...\n" : ""}${fullText.slice(beforeStart, exactIndex)}`,
        highlight: matchedHighlight,
        after: `${fullText.slice(match.end, afterEnd)}${afterEnd < fullText.length ? "\n..." : ""}`,
        fullText: fullLength > SOURCE_FULL_LIMIT ? fullText : "",
        lengthLabel: `${fullLength}文字`,
      };
    }

    return {
      mode: "context-source",
      before: contextBefore,
      highlight,
      after: contextAfter,
      fullText: "",
      lengthLabel: "",
    };
  }

  function countSourceChars(value) {
    return String(value || "").replace(/\s+/g, "").length;
  }

  function renderHighlightedSource(text, displayId) {
    let markerRendered = false;
    return String(text || "").split(/(\n+)/).map((part) => {
      if (!part) return "";
      if (/^\n+$/.test(part)) return esc(part);
      const marker = markerRendered ? "" : `<span class="source-marker">${esc(displayId || "")}</span>`;
      markerRendered = true;
      return `<mark>${marker}${esc(part)}</mark>`;
    }).join("");
  }

  function findSourceMatch(fullText, highlight) {
    if (!fullText || !highlight) return null;
    const exactIndex = fullText.indexOf(highlight);
    if (exactIndex >= 0) {
      return {
        start: exactIndex,
        end: exactIndex + highlight.length,
        highlight,
      };
    }

    const haystack = compactWithMap(fullText);
    const needle = compactWithMap(highlight).text;
    if (!needle) return null;
    const compactIndex = haystack.text.indexOf(needle);
    if (compactIndex < 0) return null;
    const start = haystack.map[compactIndex];
    const end = haystack.map[compactIndex + needle.length - 1] + 1;
    return {
      start,
      end,
      highlight: fullText.slice(start, end),
    };
  }

  function compactWithMap(value) {
    const text = [];
    const map = [];
    Array.from(String(value || "")).forEach((char, index) => {
      if (/[\s\u200B\uFEFF]/.test(char)) return;
      text.push(char);
      map.push(index);
    });
    return {
      text: text.join(""),
      map,
    };
  }

  function renderSourceActions(stage, item = null) {
    return `
      <div class="source-actions">
        ${stage.url ? `<a class="btn mini" href="${esc(stage.url)}" target="_blank" rel="noreferrer">元スプレッドシートを開く</a>` : ""}
        <a class="btn mini" href="${esc(materialsUrl(stage, item))}">素材集で開く</a>
      </div>
    `;
  }

  function renderGlobalSide(activeSlug) {
    const nav = numberedStages.map((stage) => `
      <a class="navlink ${activeSlug === stage.slug ? "active" : ""}" href="${esc(stageUrl(stage))}">
        <span class="nav-layer">第2層</span>${esc(stage.no)}. ${esc(stage.title)}
      </a>
    `).join("");

    return `
      <p class="brand">増田 W3EV<br>5日チャレ<br>ビジュアルレポート</p>
      <small class="side-note">第1層 全体 → 第2層 素材 → 第3層 個別指摘</small>
      <a class="navlink ${activeSlug === "home" ? "active" : ""}" href="${esc(homeUrl())}">
        <span class="nav-layer">第1層</span>全体インデックス
      </a>
      <div class="side-group">${nav}</div>
      <div class="side-links" aria-label="関連リンク">
        <a class="navlink" href="${esc(materialsUrl())}">素材集</a>
        <a class="navlink" href="${esc(textUrl())}">テキストレポート</a>
        <a class="navlink" href="${esc(indexUrl())}">関連レポート一覧</a>
      </div>
    `;
  }

  function renderMaterialSideLink(stage, item, activeMaterial = null) {
    const finding = item.finding;
    const active = activeMaterial?.stableId === item.stableId || activeMaterial?.sourceFile === item.sourceFile;
    return `
      <a class="feedback-link material-side-link ${active ? "active" : ""} ${finding ? "has-feedback" : "no-feedback"}" href="${esc(materialsUrl(stage, item))}">
        <span>${esc(materialLabel(item))}<em>${finding ? `指摘 ${finding.displayId}` : "素材のみ"}</em></span>
        <strong>${esc(item.title || findingSubject(finding || item))}</strong>
      </a>
    `;
  }

  function renderFindingSide(stage, activeFinding) {
    const activeMaterial = stage.materialItems.find((item) => item.finding?.stableId === activeFinding?.stableId);
    const nav = stage.materialItems.length
      ? stage.materialItems.map((item) => renderMaterialSideLink(stage, item, activeMaterial || activeFinding)).join("")
      : stage.findings.map((finding) => `
        <a class="feedback-link ${activeFinding?.stableId === finding.stableId ? "active" : ""}" href="${esc(findingUrl(stage, finding))}">
          <span>${esc(finding.displayId)}. ${esc(finding.target)}</span>
          <strong>${esc(findingSubject(finding))}</strong>
        </a>
      `).join("");

    return `
      <p class="brand">増田 W3EV<br>${esc(stage.title)}<br>第3層</p>
      <a class="back-link" href="${esc(stageUrl(stage))}">上の階層に戻る</a>
      <small class="side-note">第3層: 時系列素材と指摘状態</small>
      <div class="side-group finding-only">${nav}</div>
      <div class="side-links" aria-label="関連リンク">
        <a class="navlink" href="${esc(homeUrl())}">全体インデックス</a>
        <a class="navlink" href="${esc(materialsUrl(stage))}">素材集</a>
        <a class="navlink" href="${esc(textUrl())}">テキストレポート</a>
      </div>
    `;
  }

  function renderStageFindingSide(stage) {
    const nav = stage.materialItems.length
      ? stage.materialItems.map((item) => renderMaterialSideLink(stage, item)).join("")
      : stage.findings.map((finding) => `
        <a class="feedback-link" href="${esc(findingUrl(stage, finding))}">
          <span>${esc(finding.displayId)}. ${esc(finding.target)}</span>
          <strong>${esc(findingSubject(finding))}</strong>
        </a>
      `).join("");

    return `
      <p class="brand">増田 W3EV<br>${esc(stage.title)}<br>第2層</p>
      <a class="back-link" href="${esc(homeUrl())}">第1層に戻る</a>
      <small class="side-note">全素材を時系列に表示。指摘ありだけ状態表示します。</small>
      <div class="side-group finding-only">${nav}</div>
      <div class="side-links" aria-label="関連リンク">
        <a class="navlink" href="${esc(materialsUrl(stage))}">素材集</a>
        <a class="navlink" href="${esc(textUrl())}">テキストレポート</a>
        <a class="navlink" href="${esc(indexUrl())}">関連レポート一覧</a>
      </div>
    `;
  }

  function findingSubject(finding) {
    if (finding.navTitle) return finding.navTitle;
    const sourceFile = finding.sourceFile || "";
    if (sourceFile) {
      const filename = sourceFile.split("/").pop().replace(/\.md$/, "");
      return filename
        .replace(/_/g, " / ")
        .replace(/\s+/g, " ")
        .trim();
    }
    if (finding.time && finding.target) return `${finding.time} / ${finding.target}`;
    return finding.target || finding.title;
  }

  function materialLabel(item) {
    return [item.day, item.delivery].filter(Boolean).join(" / ") || `素材 ${item.sequence}`;
  }

  function stageLayerCount(stage) {
    if (stage.materialItems.length) {
      return `素材 ${stage.materialItems.length} / 指摘 ${stage.findings.length}`;
    }
    return stage.findings.length > 0
      ? `指摘 ${stage.findings[0].displayId}-${stage.findings[stage.findings.length - 1].displayId}`
      : "未設定";
  }

  function stageOverview(stage) {
    if (stage.overview) return stage.overview;
    const current = stage.mockLines?.length
      ? stage.mockLines.join(" / ")
      : `${stage.title}の素材単位で、全体の流れと主要な確認点を整理しています。`;
    return {
      current,
      issue: "個別指摘を先に読むと、全体の中でどの役割を持つ素材なのかが見えにくくなります。",
      solution: "第2層では全体像だけを確認し、個別の該当箇所と改善案は左サイドバーの第3層レポートで確認します。"
    };
  }

  function renderLayout(content, activeSlug, options = {}) {
    const side = options.sidebar === "findings" && options.stage
      ? renderFindingSide(options.stage, options.activeFinding)
      : options.sidebar === "stage-findings" && options.stage
        ? renderStageFindingSide(options.stage)
      : renderGlobalSide(activeSlug);

    app.innerHTML = `
      <div class="layout">
        <aside class="side">
          <details class="side-drawer">
            <summary>素材一覧を開く</summary>
            <div class="side-drawer-panel">${side}</div>
          </details>
          <div class="side-desktop">${side}</div>
        </aside>
        <main class="main">
          <div class="wrap">${content}</div>
        </main>
      </div>
    `;
  }

  function renderToolbar(extra = "", options = {}) {
    const homeButton = options.showHomeLink === false
      ? ""
      : `<a class="btn" href="${esc(homeUrl())}">ビジュアル全体像</a>`;
    return `
      <div class="toolbar">
        <a class="btn primary" href="${esc(textUrl())}">テキストレポートを開く</a>
        ${homeButton}
        ${extra}
      </div>
    `;
  }

  function renderHome() {
    const flow = numberedStages.map((stage) => `
      <a class="flow-node" href="${esc(stageUrl(stage))}">
        <span class="num">${esc(stage.no)}</span>
        <strong>${esc(stage.title)}</strong>
        <span class="muted">${esc(stage.subtitle)}</span>
      </a>
    `).join("");

    const stageCards = numberedStages.map((stage) => {
      const high = stage.findings.filter((finding) => finding.priority === "high").length;
      const medium = stage.findings.filter((finding) => finding.priority === "medium").length;
      const low = stage.findings.filter((finding) => finding.priority === "low").length;
      return `
        <a class="card clickable" href="${esc(stageUrl(stage))}">
          <small>第2層: ${esc(stage.no)}</small>
          <h3>${esc(stage.title)}</h3>
          <p>${esc(stage.subtitle)}</p>
          <div class="chip-row">
            <span class="chip high">高 ${high}</span>
            <span class="chip medium">中 ${medium}</span>
            <span class="chip low">低 ${low}</span>
            <span class="chip">第3層 ${esc(stageLayerCount(stage))}</span>
            ${stage.kind === "mock" ? '<span class="chip">代表箇所</span>' : ''}
          </div>
        </a>
      `;
    }).join("");

    const questions = data.questions.map((question) => `
      <div class="card">
        <h3>${esc(question.title)}</h3>
        <p>${esc(question.body)}</p>
      </div>
    `).join("");

    const assumedFlow = data.assumedFlow.map((item, index) => `
      <span class="chip">${String(index + 1).padStart(2, "0")} ${esc(item)}</span>
    `).join("");

    const definitions = `
      <div class="definition-grid">
        ${data.layerModel.map((layer) => `
          <div class="card">
            <small>${esc(layer.label)}</small>
            <h3>${esc(layer.title)}</h3>
            <p>${esc(layer.body)}</p>
          </div>
        `).join("")}
      </div>
    `;

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">Visual Feedback / Production Structure Prototype</p>
        <h1>${esc(data.title)}</h1>
        <p class="lead">${esc(data.subtitle)}</p>
        ${renderToolbar(`<a class="btn" href="${esc(materialsUrl())}">素材集を開く</a>`, { showHomeLink: false })}
      </header>
      ${tanakaSpeech(data.overallSpeech)}

      <section class="panel soft">
        <h2>用語と出力先</h2>
        <p>テキストレポートは、MD分析結果をHTMLで読めるようにしたものです。ビジュアルレポートは、キャプチャ画像・動画代表フレーム・スライド・メール本文などの該当箇所に番号を振り、右側で「現状」「問題点・考察」「解決策案」を対応させるものです。</p>
        <div class="rule-list">
          <p><strong>番号ルール:</strong> ${esc(data.numberingPolicy)}</p>
          <p><strong>参照元ルール:</strong> ${esc(data.sourcePolicy)}</p>
          <p><strong>抜粋ルール:</strong> 500文字以内は全文、500〜1,200文字は指摘箇所が最初の1画面に見える場合のみ全文、1,200文字以上は前後文脈を基本にします。2,000文字以上は前後100〜250文字程度に抑え、全文は折りたたみます。</p>
        </div>
      </section>

      <section class="section">
        <h2>3階層ナビゲーション</h2>
        ${definitions}
      </section>

      <section class="section">
        <h2>田中祐一が考える実際のファネルの流れ（仮説）</h2>
        <div class="panel">
          <div class="chip-row">${assumedFlow}</div>
        </div>
        <p class="muted">この仮説を正本として固定する前に、実運用の配信順・動画順・LP遷移順と照合する必要があります。</p>
      </section>

      <section class="section">
        <h2>全体フローから各URLへ</h2>
        <div class="flow">${flow}</div>
      </section>

      <section class="section">
        <h2>ステージ別レポート</h2>
        <div class="stage-grid">${stageCards}</div>
      </section>

      <section class="section">
        <h2>追い上げ追加に対応するルール</h2>
        <ol class="accumulation">
          ${data.accumulation.map((item, index) => `<li><span>${index + 1}</span>${esc(item)}</li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <h2>確認したいこと</h2>
        <div class="question-grid">${questions}</div>
      </section>
    `, "home");
  }

  function renderVisual(stage, focusedFinding = null) {
    if (stage.kind === "image") {
      const pins = stage.pins.map((pin) => `
        <a class="pin ${focusedFinding && focusedFinding.anchorId === pin.anchorId ? "selected" : ""}" style="--x:${esc(pin.x)};--y:${esc(pin.y)}" href="${pin.finding ? `#finding-${esc(pin.finding.anchorId)}` : "#"}">${esc(pin.displayId)}</a>
      `).join("");
      return `
        <div class="visual visual-image">
          <div class="image-canvas">
            <img src="${esc(rootPrefix + stage.image)}" alt="${esc(stage.title)}のキャプチャ">
            ${pins}
          </div>
          <p class="visual-caption">${esc(stage.caption)}</p>
        </div>
      `;
    }

    const sourceFindings = focusedFinding ? [focusedFinding] : stage.findings;
    const lineItems = focusedFinding ? "" : sourceFindings.map((finding) => `
      <details class="transcript-line" ${finding.priority === "high" ? "open" : ""}>
        <summary>
          <span class="inline-num">${esc(finding.displayId)}</span>
          <span class="line-main">
            <span class="line-meta">${esc(finding.time || finding.target)} / ${esc(finding.target)}</span>
            <span class="line-title">${esc(finding.title)}</span>
            <span class="line-excerpt">${esc(finding.excerpt || finding.issue)}</span>
          </span>
        </summary>
        <div class="line-detail">
          ${finding.time ? `<p><strong>位置:</strong> ${esc(finding.time)}</p>` : ""}
          ${renderSourceContext(finding)}
          ${finding.sourceFile ? `<p><strong>対応する素材:</strong> ${esc(finding.sourceFile)}</p>` : ""}
        </div>
      </details>
    `).join("");
    const sourceOverview = !focusedFinding && stage.mockLines?.length
      ? `
        <div class="source-overview">
          <strong>第2層の全体像</strong>
          <ul>
            ${stage.mockLines.map((line) => `<li>${esc(line)}</li>`).join("")}
          </ul>
        </div>
      `
      : "";
    const focusedSource = focusedFinding
      ? `
        <div class="source-doc">
          <div class="source-head">
            <span>第3層: 指摘対象</span>
            <strong>${esc(focusedFinding.time || focusedFinding.target)}</strong>
          </div>
          ${renderSourceContext(focusedFinding)}
          <p><strong>対応する素材:</strong> ${esc(focusedFinding.sourceFile || stage.source)}</p>
          ${renderSourceActions(stage)}
        </div>
      `
      : "";
    return `
      <div class="visual">
        <div class="mock-screen">
          <div class="screen-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <p class="mock-kicker">${focusedFinding ? "第3層の該当箇所" : esc(sourceKindLabel(stage))}</p>
          ${sourceOverview}
          ${focusedSource}
          ${lineItems}
        </div>
        <p class="visual-caption">${esc(stage.caption)}</p>
      </div>
    `;
  }

  function renderFindingBody(finding) {
    return `
      <dl>
        <div>
          <dt>現状</dt>
          <dd>${esc(finding.issue)}</dd>
        </div>
        <div>
          <dt>問題点・考察</dt>
          <dd>${esc(finding.consideration)}</dd>
        </div>
        <div>
          <dt>解決策案</dt>
          <dd>${esc(finding.proposal)}</dd>
        </div>
        <div>
          <dt>テキストレポート対応</dt>
          <dd>${esc(finding.textPairing)}</dd>
        </div>
      </dl>
    `;
  }

  function renderFindingHead(finding, options = {}) {
    return `
        <div class="finding-head">
          <span class="num">${esc(finding.displayId)}</span>
          <div>
            ${options.compact ? "" : `
              <div class="chip-row">
                <span class="chip ${esc(finding.priority)}">${esc(priorityLabel(finding.priority))}</span>
                <span class="chip">${esc(finding.target)}</span>
                <span class="chip stable">固定ID: ${esc(finding.stableId)}</span>
              </div>
            `}
            <h3>${esc(finding.title)}</h3>
          </div>
        </div>
    `;
  }

  function renderFinding(stage, finding, options = {}) {
    if (options.accordion) {
      return `
        <details class="finding finding-accordion" id="finding-${esc(finding.anchorId)}">
          <summary>
            ${renderFindingHead(finding, { compact: true })}
          </summary>
          <div class="finding-content">
            ${renderFindingBody(finding)}
          </div>
        </details>
      `;
    }

    return `
      <article class="finding" id="finding-${esc(finding.anchorId)}">
        ${renderFindingHead(finding)}
        ${renderFindingBody(finding)}
      </article>
    `;
  }

  function renderDetail(stage) {
    const overview = stageOverview(stage);
    const reportLinks = stage.materialItems.length
      ? stage.materialItems.map((item) => `
        <a class="report-link ${item.finding ? "has-feedback" : "no-feedback"}" href="${esc(materialsUrl(stage, item))}">
          <span class="num ${item.finding ? "" : "ghost-num"}">${esc(item.finding?.displayId || String(item.sequence).padStart(2, "0"))}</span>
          <div>
            <small>第3層 / ${esc(materialLabel(item))} / ${item.finding ? esc(priorityLabel(item.finding.priority)) : "素材のみ"}</small>
            <strong>${esc(item.title)}</strong>
            <span>${item.finding ? "個別フィードバックあり" : "提出素材を確認"}</span>
          </div>
        </a>
      `).join("")
      : stage.findings.map((finding) => `
        <a class="report-link" href="${esc(findingUrl(stage, finding))}">
          <span class="num">${esc(finding.displayId)}</span>
          <div>
            <small>第3層 / ${esc(priorityLabel(finding.priority))}</small>
            <strong>${esc(findingSubject(finding))}</strong>
            <span>${esc(finding.target)} の個別フィードバックを開く</span>
          </div>
        </a>
      `).join("");
    const sourceItems = [
      { label: "素材名", value: stage.source },
      { label: "参照元素材URL", value: stage.url, href: stage.url },
      { label: "提出素材HTML", value: "素材集を開く", href: materialsUrl(stage) },
      { label: "テキストレポート", value: data.textReport, href: textUrl() },
    ].map((item) => `
      <li>
        <strong>${esc(item.label)}:</strong>
        ${item.href ? `<a href="${esc(item.href)}" target="_blank" rel="noreferrer">${esc(item.value)}</a>` : esc(item.value)}
      </li>
    `).join("");
    const pointRange = stageLayerCount(stage);

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">第2層 / 素材別レポート / ${esc(stage.no)}</p>
        <h1>${esc(stage.title)}</h1>
        <p class="lead">${esc(stage.subtitle)}</p>
        ${renderToolbar(`<a class="btn" href="${esc(stage.url)}" target="_blank" rel="noreferrer">素材URLを開く</a><a class="btn" href="${esc(materialsUrl(stage))}">素材集を開く</a>`)}
      </header>
      ${shouldShowLayer2Speech(stage) ? tanakaSpeech(stage.speech || data.layer2Speech, "第2層の見方") : ""}

      <section class="panel soft">
        <h2>第2層の全体レポート</h2>
        <p>このページでは、${esc(stage.title)} 全体の流れだけを確認します。時系列素材は全件を第3層に並べ、指摘ありの素材だけ状態表示します。個別メール・個別素材の該当箇所と改善案は、左サイドバーまたは下の一覧から確認します。</p>
        <div class="meta-strip">
          <span>第1層: 全体インデックス</span>
          <span>第2層: ${esc(stage.title)}</span>
          <span>第3層: ${esc(pointRange)}</span>
        </div>
        <div class="overview-grid">
          <article class="overview-card">
            <small>1. 現状の全体像</small>
            <p>${esc(overview.current)}</p>
          </article>
          <article class="overview-card">
            <small>2. 考察課題</small>
            <p>${esc(overview.issue)}</p>
          </article>
          <article class="overview-card">
            <small>3. 解決策</small>
            <p>${esc(overview.solution)}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <h2>第3層 素材一覧</h2>
        <p class="muted">時系列で流れる素材は、指摘あり/なしを問わず全件を並べます。指摘ありは右側にフィードバック、指摘なしは提出素材の確認ページとして開きます。</p>
        <div class="report-link-list">
          ${reportLinks}
        </div>
      </section>

      <section class="section">
        <h2>素材と対応</h2>
        <div class="panel">
          <ul class="source-list">${sourceItems}</ul>
        </div>
      </section>
    `, stage.slug, { sidebar: "stage-findings", stage });
  }

  function renderFindingDetail(stage, finding) {
    const index = stage.findings.findIndex((item) => item.stableId === finding.stableId);
    const prev = stage.findings[index - 1];
    const next = stage.findings[index + 1];
    const siblings = stage.findings.map((item) => `
      <a class="${item.stableId === finding.stableId ? "active" : ""}" href="${esc(findingUrl(stage, item))}">
        <span class="nav-layer">第3層</span>${esc(item.displayId)}. ${esc(findingSubject(item))}
      </a>
    `).join("");
    const sourceItems = [
      { label: "第2層素材", value: stage.title, href: stageUrl(stage) },
      { label: "固定ID", value: finding.stableId },
      { label: "参照元素材URL", value: stage.url, href: stage.url },
      { label: "テキストレポート対応", value: finding.textPairing, href: textUrl() },
    ].map((item) => `
      <li>
        <strong>${esc(item.label)}:</strong>
        ${item.href ? `<a href="${esc(item.href)}" target="${item.href.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">${esc(item.value)}</a>` : esc(item.value)}
      </li>
    `).join("");
    const nextPrev = `
      <div class="detail-nav">
        ${prev ? `<a class="btn" href="${esc(findingUrl(stage, prev))}">前の指摘 ${esc(prev.displayId)}</a>` : '<span></span>'}
        <a class="btn" href="${esc(stageUrl(stage))}">第2層に戻る</a>
        ${next ? `<a class="btn" href="${esc(findingUrl(stage, next))}">次の指摘 ${esc(next.displayId)}</a>` : '<span></span>'}
      </div>
    `;

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">第3層 / 個別指摘 / ${esc(finding.displayId)}</p>
        <h1>${esc(finding.title)}</h1>
        <p class="lead">${esc(stage.title)} の中の、1つの指摘箇所だけを固定表示しています。</p>
        ${renderToolbar(`<a class="btn" href="${esc(stageUrl(stage))}">素材別レポートへ戻る</a><a class="btn" href="${esc(materialsUrl(stage))}">素材集を開く</a><a class="btn" href="${esc(stage.url)}" target="_blank" rel="noreferrer">素材URLを開く</a>`)}
      </header>

      <section class="panel soft">
        <h2>3層の現在地</h2>
        <div class="meta-strip">
          <span>第1層: 全体インデックス</span>
          <span>第2層: ${esc(stage.no)}. ${esc(stage.title)}</span>
          <span>第3層: ${esc(finding.displayId)}. ${esc(finding.target)}</span>
        </div>
        <div class="target-nav">${siblings}</div>
      </section>

      <section class="section">
        <h2>該当箇所とフィードバック</h2>
        <div class="report-grid">
          ${renderVisual(stage, finding)}
          <div>${renderFinding(stage, finding, { hideAction: true })}</div>
        </div>
        ${nextPrev}
      </section>

      <section class="section">
        <h2>素材と対応</h2>
        <div class="panel">
          <ul class="source-list">${sourceItems}</ul>
        </div>
      </section>
    `, stage.slug, { sidebar: "findings", stage, activeFinding: finding });
  }

  function renderMaterialSourceCard(stage, item, finding = null) {
    const sourceFinding = finding
      ? { ...finding, sourceText: item.sourceText || finding.sourceText }
      : null;
    return `
      <div class="visual material-visual">
        <div class="mock-screen">
          <div class="screen-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <p class="mock-kicker">提出素材</p>
          <div class="source-doc">
            <div class="source-head">
              <span>${esc(item.phase || stage.title)}</span>
              <strong>${esc(materialLabel(item))} / ${esc(item.title)}</strong>
            </div>
            ${sourceFinding ? renderSourceContext(sourceFinding) : `<div class="source-context full-source">${esc(item.sourceText || "（本文なし）")}</div>`}
            <p><strong>参照ファイル:</strong> ${esc(item.sourceFile)}</p>
            ${renderSourceActions(stage, item)}
          </div>
        </div>
        <p class="visual-caption">第3層: 提出素材の本文。指摘がある場合は本文内に番号付きで網掛けします。</p>
      </div>
    `;
  }

  function renderNoFeedbackCard(item) {
    return `
      <article class="finding no-feedback-card">
        <div class="finding-head">
          <span class="num ghost-num">${esc(String(item.sequence).padStart(2, "0"))}</span>
          <div>
            <div class="chip-row">
              <span class="chip stable">素材のみ</span>
              <span class="chip">${esc(materialLabel(item))}</span>
            </div>
            <h3>この素材は現時点では個別指摘なし</h3>
          </div>
        </div>
        <dl>
          <div>
            <dt>現状</dt>
            <dd>時系列の提出素材として保持しています。</dd>
          </div>
          <div>
            <dt>確認ポイント</dt>
            <dd>前後の配信との接続、CTA、説明会への橋渡しを確認するための素材ページです。</dd>
          </div>
          <div>
            <dt>次の扱い</dt>
            <dd>必要になった時点で、この素材に個別フィードバックを追加します。</dd>
          </div>
        </dl>
      </article>
    `;
  }

  function renderMaterialDetail(stage, item) {
    const finding = item.finding;
    const index = stage.materialItems.findIndex((candidate) => candidate.stableId === item.stableId);
    const prev = stage.materialItems[index - 1];
    const next = stage.materialItems[index + 1];
    const nextPrev = `
      <div class="detail-nav">
        ${prev ? `<a class="btn" href="${esc(materialsUrl(stage, prev))}">前の素材</a>` : '<span></span>'}
        <a class="btn" href="${esc(stageUrl(stage))}">第2層に戻る</a>
        ${next ? `<a class="btn" href="${esc(materialsUrl(stage, next))}">次の素材</a>` : '<span></span>'}
      </div>
    `;

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">第3層 / 素材 / ${esc(materialLabel(item))}</p>
        <h1>${esc(item.title)}</h1>
        <p class="lead">${esc(stage.title)} の時系列素材です。${finding ? "この素材には個別フィードバックがあります。" : "この素材は現時点では個別指摘なしです。"}</p>
        ${renderToolbar(`<a class="btn" href="${esc(stageUrl(stage))}">素材別レポートへ戻る</a><a class="btn" href="${esc(materialsUrl(stage))}">素材集へ戻る</a>`)}
      </header>

      <section class="panel soft">
        <h2>3層の現在地</h2>
        <div class="meta-strip">
          <span>第1層: 全体インデックス</span>
          <span>第2層: ${esc(stage.no)}. ${esc(stage.title)}</span>
          <span>第3層: ${esc(materialLabel(item))}</span>
          <span>${finding ? `指摘あり: ${esc(finding.displayId)}` : "素材のみ"}</span>
        </div>
      </section>

      <section class="section">
        <h2>提出素材とフィードバック</h2>
        <div class="report-grid">
          ${renderMaterialSourceCard(stage, item, finding)}
          <div>${finding ? renderFinding(stage, finding, { hideAction: true }) : renderNoFeedbackCard(item)}</div>
        </div>
        ${nextPrev}
      </section>
    `, stage.slug, { sidebar: "findings", stage, activeFinding: finding || item });
  }

  function renderMaterialsIndex() {
    const stageFilter = params.get("stage");
    const stages = numberedStages.filter((stage) => stage.materialItems.length && (!stageFilter || stage.slug === stageFilter));
    const groups = stages.map((stage) => `
      <section class="section">
        <h2>${esc(stage.no)}. ${esc(stage.title)}</h2>
        <p class="muted">${esc(stage.materialItems.length)}件の提出素材 / ${esc(stage.findings.length)}件の個別指摘</p>
        <div class="report-link-list material-index-list">
          ${stage.materialItems.map((item) => `
            <a class="report-link ${item.finding ? "has-feedback" : "no-feedback"}" href="${esc(materialsUrl(stage, item))}">
              <span class="num ${item.finding ? "" : "ghost-num"}">${esc(item.finding?.displayId || String(item.sequence).padStart(2, "0"))}</span>
              <div>
                <small>${esc(materialLabel(item))} / ${item.finding ? "指摘あり" : "素材のみ"}</small>
                <strong>${esc(item.title)}</strong>
                <span>${esc(item.phase || "")}</span>
              </div>
            </a>
          `).join("")}
        </div>
      </section>
    `).join("");

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">提出素材HTML</p>
        <h1>増田 W3EV 5日チャレ 素材集</h1>
        <p class="lead">メールとLINEの提出素材を、時系列でそのまま確認するためのHTMLです。ビジュアルフィードバックで迷ったら、ここから元素材へ戻ります。</p>
        ${renderToolbar(`<a class="btn" href="${esc(homeUrl())}">ビジュアルレポートへ戻る</a>`, { showHomeLink: false })}
      </header>
      ${groups || `<section class="panel"><p>表示できる素材がありません。</p></section>`}
    `, "materials");
  }

  if (slug === "home") {
    renderHome();
    return;
  }

  if (slug === "finding") {
    const stage = numberedStages.find((item) => item.slug === params.get("stage"));
    const finding = stage?.findings.find((item) => item.stableId === params.get("finding") || item.anchorId === params.get("finding"));
    if (stage && finding) {
      renderFindingDetail(stage, finding);
      return;
    }
    renderLayout(`
      <header class="hero">
        <h1>第3層の指摘が見つかりません</h1>
        <p class="lead">指定された素材または指摘IDは未定義です。</p>
        ${renderToolbar()}
      </header>
    `, "home");
    return;
  }

  if (slug === "materials") {
    const stage = numberedStages.find((item) => item.slug === params.get("stage"));
    const material = stage?.materialItems.find((item) => item.stableId === params.get("item") || item.id === params.get("item"));
    if (stage && material) {
      renderMaterialDetail(stage, material);
      return;
    }
    renderMaterialsIndex();
    return;
  }

  const stage = numberedStages.find((item) => item.slug === slug);
  if (!stage) {
    renderLayout(`
      <header class="hero">
        <h1>レポートが見つかりません</h1>
        <p class="lead">指定されたビジュアルレポートURLは未定義です。</p>
        ${renderToolbar()}
      </header>
    `, "home");
    return;
  }

  renderDetail(stage);
})();
