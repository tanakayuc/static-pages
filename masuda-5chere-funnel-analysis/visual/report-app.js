(function () {
  const data = window.masudaVisualReportData;
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

  const stageUrl = (stage) => `${visualPrefix}${stage.slug}.html`;
  const findingUrl = (stage, finding) => `${visualPrefix}finding.html?stage=${encodeURIComponent(stage.slug)}&finding=${encodeURIComponent(finding.stableId)}`;
  const homeUrl = () => `${rootPrefix}visual-report.html`;
  const textUrl = () => `${rootPrefix}${data.textReport}`;
  const indexUrl = () => `${rootPrefix}${data.indexReport}`;
  const priorityLabel = (priority) => ({ high: "優先度: 高", medium: "優先度: 中", low: "優先度: 低" }[priority] || "優先度");
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
      return {
        ...stage,
        sequence: stageIndex + 1,
        findings,
        pins,
      };
    });
  })();

  function renderLayout(content, activeSlug) {
    const nav = numberedStages.map((stage) => `
      <a class="navlink ${activeSlug === stage.slug ? "active" : ""}" href="${esc(stageUrl(stage))}">
        <span class="nav-layer">第2層</span>${esc(stage.no)}. ${esc(stage.title)}
      </a>
    `).join("");

    app.innerHTML = `
      <div class="layout">
        <aside class="side">
          <p class="brand">増田 W3EV<br>5日チャレ<br>ビジュアルレポート</p>
          <small class="side-note">第1層 全体 → 第2層 素材 → 第3層 個別指摘</small>
          <a class="navlink ${activeSlug === "home" ? "active" : ""}" href="${esc(homeUrl())}">
            <span class="nav-layer">第1層</span>全体インデックス
          </a>
          <div class="side-group">${nav}</div>
          <div class="side-links" aria-label="関連リンク">
            <a class="navlink" href="${esc(textUrl())}">テキストレポート</a>
            <a class="navlink" href="${esc(indexUrl())}">関連レポート一覧</a>
          </div>
        </aside>
        <main class="main">
          <div class="wrap">${content}</div>
        </main>
      </div>
    `;
  }

  function renderToolbar(extra = "") {
    return `
      <div class="toolbar">
        <a class="btn primary" href="${esc(textUrl())}">テキストレポートを開く</a>
        <a class="btn" href="${esc(homeUrl())}">ビジュアル全体像</a>
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
      const pointRange = stage.findings.length > 0
        ? `${stage.findings[0].displayId}-${stage.findings[stage.findings.length - 1].displayId}`
        : "未設定";
      return `
        <a class="card clickable" href="${esc(stageUrl(stage))}">
          <small>第2層: ${esc(stage.no)}</small>
          <h3>${esc(stage.title)}</h3>
          <p>${esc(stage.subtitle)}</p>
          <div class="chip-row">
            <span class="chip high">高 ${high}</span>
            <span class="chip medium">中 ${medium}</span>
            <span class="chip low">低 ${low}</span>
            <span class="chip">第3層 ${esc(pointRange)}</span>
            ${stage.kind === "mock" ? '<span class="chip pending">実体取得待ち</span>' : ''}
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
        ${renderToolbar()}
      </header>

      <section class="panel soft">
        <h2>用語と出力先</h2>
        <p>テキストレポートは、MD分析結果をHTMLで読めるようにしたものです。ビジュアルレポートは、キャプチャ画像・動画代表フレーム・スライド・メール本文などの該当箇所に番号を振り、「現状の課題」「考察」「田中祐一の案」を対応させるものです。</p>
        <div class="rule-list">
          <p><strong>番号ルール:</strong> ${esc(data.numberingPolicy)}</p>
          <p><strong>参照元ルール:</strong> ${esc(data.sourcePolicy)}</p>
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
        <h2>確認したいこと</h2>
        <div class="question-grid">${questions}</div>
      </section>
    `, "home");
  }

  function renderVisual(stage, focusedFinding = null) {
    if (stage.kind === "image") {
      const pins = stage.pins.map((pin) => `
        <a class="pin ${focusedFinding && focusedFinding.anchorId === pin.anchorId ? "selected" : ""}" style="--x:${esc(pin.x)};--y:${esc(pin.y)}" href="${pin.finding ? esc(findingUrl(stage, pin.finding)) : "#"}">${esc(pin.displayId)}</a>
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
    const lineItems = sourceFindings.map((finding) => `
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
          <p><strong>該当箇所:</strong> ${esc(finding.excerpt || finding.issue)}</p>
          <p><strong>見る観点:</strong> ${esc(finding.consideration)}</p>
          <p><a class="mini-link" href="${esc(findingUrl(stage, finding))}">第3層の個別指摘URLで開く</a></p>
        </div>
      </details>
    `).join("");
    return `
      <div class="visual">
        <div class="mock-screen">
          <div class="screen-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <div class="pending-note">
            <strong>実体取得待ち</strong>
            <span>この素材はまだキャプチャ・原文全文・代表フレームを第3層として固定していません。以下は現時点の代表箇所指定です。</span>
          </div>
          <p class="mock-kicker">${focusedFinding ? "第3層の該当箇所" : esc(sourceKindLabel(stage))}</p>
          ${lineItems}
        </div>
        <p class="visual-caption">${esc(stage.caption)}</p>
      </div>
    `;
  }

  function renderFinding(stage, finding, options = {}) {
    return `
      <article class="finding" id="finding-${esc(finding.anchorId)}">
        <div class="finding-head">
          <span class="num">${esc(finding.displayId)}</span>
          <div>
            <div class="chip-row">
              <span class="chip ${esc(finding.priority)}">${esc(priorityLabel(finding.priority))}</span>
              <span class="chip">${esc(finding.target)}</span>
              <span class="chip stable">固定ID: ${esc(finding.stableId)}</span>
            </div>
            <h3>${esc(finding.title)}</h3>
            ${options.hideAction ? "" : `
              <div class="finding-actions">
                <a class="btn mini" href="${esc(findingUrl(stage, finding))}">第3層で開く</a>
              </div>
            `}
          </div>
        </div>
        <dl>
          <div>
            <dt>現状の課題</dt>
            <dd>${esc(finding.issue)}</dd>
          </div>
          <div>
            <dt>考察</dt>
            <dd>${esc(finding.consideration)}</dd>
          </div>
          <div>
            <dt>田中祐一の案</dt>
            <dd>${esc(finding.proposal)}</dd>
          </div>
          <div>
            <dt>テキストレポート対応</dt>
            <dd>${esc(finding.textPairing)}</dd>
          </div>
        </dl>
      </article>
    `;
  }

  function renderDetail(stage) {
    const findingNav = stage.findings.map((finding) => `
      <a href="${esc(findingUrl(stage, finding))}"><span class="nav-layer">第3層</span>${esc(finding.displayId)}. ${esc(finding.target)}</a>
    `).join("");
    const findings = stage.findings.map((finding) => renderFinding(stage, finding)).join("");
    const sourceItems = [
      { label: "素材名", value: stage.source },
      { label: "参照元素材URL", value: stage.url, href: stage.url },
      { label: "テキストレポート", value: data.textReport, href: textUrl() },
    ].map((item) => `
      <li>
        <strong>${esc(item.label)}:</strong>
        ${item.href ? `<a href="${esc(item.href)}" target="_blank" rel="noreferrer">${esc(item.value)}</a>` : esc(item.value)}
      </li>
    `).join("");
    const pointRange = stage.findings.length > 0
      ? `${stage.findings[0].displayId}-${stage.findings[stage.findings.length - 1].displayId}`
      : "未設定";

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">第2層 / 素材別レポート / ${esc(stage.no)}</p>
        <h1>${esc(stage.title)}</h1>
        <p class="lead">${esc(stage.subtitle)}</p>
        ${renderToolbar(`<a class="btn" href="${esc(stage.url)}" target="_blank" rel="noreferrer">素材URLを開く</a>`)}
      </header>

      <section class="panel soft">
        <h2>このページの役割</h2>
        <p>第2層の素材別レポートです。左側のキャプチャまたは代表画面の番号と、右側のフィードバック番号が対応しています。各指摘は、テキストレポート側と内容が変わらないように「現状の課題」「考察」「田中祐一の案」を分けています。</p>
        <div class="meta-strip">
          <span>第1層: 全体インデックス</span>
          <span>第2層: ${esc(stage.title)}</span>
          <span>第3層: 個別指摘URL ${esc(pointRange)}</span>
        </div>
        <div class="target-nav">${findingNav}</div>
      </section>

      <section class="section">
        <h2>Visual Feedback</h2>
        <div class="report-grid">
          ${renderVisual(stage)}
          <div>${findings}</div>
        </div>
      </section>

      <section class="section">
        <h2>素材と対応</h2>
        <div class="panel">
          <ul class="source-list">${sourceItems}</ul>
        </div>
      </section>
    `, stage.slug);
  }

  function renderFindingDetail(stage, finding) {
    const index = stage.findings.findIndex((item) => item.stableId === finding.stableId);
    const prev = stage.findings[index - 1];
    const next = stage.findings[index + 1];
    const siblings = stage.findings.map((item) => `
      <a class="${item.stableId === finding.stableId ? "active" : ""}" href="${esc(findingUrl(stage, item))}">
        <span class="nav-layer">第3層</span>${esc(item.displayId)}. ${esc(item.target)}
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
        ${renderToolbar(`<a class="btn" href="${esc(stageUrl(stage))}">素材別レポートへ戻る</a>`)}
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
    `, stage.slug);
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
