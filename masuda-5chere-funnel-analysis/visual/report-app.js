(function () {
  const data = window.masudaVisualReportData;
  const app = document.getElementById("app");
  const slug = document.body.dataset.stage || "home";
  const inVisualDir = window.location.pathname.includes("/visual/");
  const rootPrefix = inVisualDir ? "../" : "";
  const visualPrefix = inVisualDir ? "" : "visual/";

  const esc = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const stageUrl = (stage) => `${visualPrefix}${stage.slug}.html`;
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
          <small class="side-note">全体インデックス → 素材別URL → 指摘箇所</small>
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
            <span class="chip">指摘 ${esc(pointRange)}</span>
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

  function renderVisual(stage) {
    if (stage.kind === "image") {
      const pins = stage.pins.map((pin) => `
        <a class="pin" style="--x:${esc(pin.x)};--y:${esc(pin.y)}" href="#finding-${esc(pin.anchorId)}">${esc(pin.displayId)}</a>
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

    const lineItems = stage.findings.map((finding) => `
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
          <p class="mock-kicker">${esc(sourceKindLabel(stage))}</p>
          ${lineItems}
        </div>
        <p class="visual-caption">${esc(stage.caption)}</p>
      </div>
    `;
  }

  function renderFinding(finding) {
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
      <a href="#finding-${esc(finding.anchorId)}">${esc(finding.displayId)}. ${esc(finding.target)}</a>
    `).join("");
    const findings = stage.findings.map(renderFinding).join("");
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
          <span>第3層: 指摘 ${esc(pointRange)}</span>
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

  if (slug === "home") {
    renderHome();
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
