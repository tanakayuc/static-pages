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

  function renderLayout(content, activeSlug) {
    const nav = data.stages.map((stage) => `
      <a class="navlink ${activeSlug === stage.slug ? "active" : ""}" href="${esc(stageUrl(stage))}">
        ${esc(stage.no)}. ${esc(stage.title)}
      </a>
    `).join("");

    app.innerHTML = `
      <div class="layout">
        <aside class="side">
          <p class="brand">増田 W3EV<br>5日チャレ<br>ビジュアルレポート</p>
          <small class="side-note">3階層 / 番号付きフィードバック</small>
          <a class="navlink ${activeSlug === "home" ? "active" : ""}" href="${esc(homeUrl())}">全体像</a>
          ${nav}
          <a class="navlink" href="${esc(textUrl())}">テキストレポート</a>
          <a class="navlink" href="${esc(indexUrl())}">関連レポート一覧</a>
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
        <a class="btn" href="${esc(indexUrl())}">関連レポート一覧</a>
        ${extra}
      </div>
    `;
  }

  function renderHome() {
    const flow = data.stages.map((stage) => `
      <a class="flow-node" href="${esc(stageUrl(stage))}">
        <span class="num">${esc(stage.no)}</span>
        <strong>${esc(stage.title)}</strong>
        <span class="muted">${esc(stage.subtitle)}</span>
      </a>
    `).join("");

    const stageCards = data.stages.map((stage) => {
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
        <div class="card">
          <small>Layer 1</small>
          <h3>全体像</h3>
          <p>実際のファネル順序、詰まり、優先度を横断して見る入口です。</p>
        </div>
        <div class="card">
          <small>Layer 2</small>
          <h3>各素材</h3>
          <p>LP、ステップ、オプチャ、Live、説明会導線ごとに個別URLへ分けます。</p>
        </div>
        <div class="card">
          <small>Layer 3</small>
          <h3>指摘箇所</h3>
          <p>キャプチャ、代表フレーム、メール本文、スライドページに番号を振ります。</p>
        </div>
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
        <span class="pin" style="--x:${esc(pin.x)};--y:${esc(pin.y)}">${esc(pin.id)}</span>
      `).join("");
      return `
        <div class="visual">
          <img src="${esc(rootPrefix + stage.image)}" alt="${esc(stage.title)}のキャプチャ">
          ${pins}
          <p class="visual-caption">${esc(stage.caption)}</p>
        </div>
      `;
    }

    const lines = stage.mockLines.map((line) => `<div class="mockline">${esc(line)}</div>`).join("");
    const pins = stage.pins.map((pin) => `
      <span class="pin" style="--x:${esc(pin.x)};--y:${esc(pin.y)}">${esc(pin.id)}</span>
    `).join("");
    return `
      <div class="visual">
        <div class="mock-screen">
          <div class="screen-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          ${lines}
          ${pins}
        </div>
        <p class="visual-caption">${esc(stage.caption)}</p>
      </div>
    `;
  }

  function renderFinding(finding) {
    return `
      <article class="finding" id="finding-${esc(finding.id)}">
        <div class="finding-head">
          <span class="num">${esc(finding.id)}</span>
          <div>
            <div class="chip-row">
              <span class="chip ${esc(finding.priority)}">${esc(priorityLabel(finding.priority))}</span>
              <span class="chip">${esc(finding.target)}</span>
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
      <a href="#finding-${esc(finding.id)}">${esc(finding.target)} / ${esc(finding.id)}</a>
    `).join("");
    const findings = stage.findings.map(renderFinding).join("");
    const sourceItems = [
      stage.source,
      stage.url,
      `静的テキストレポート: ${data.textReport}`
    ].map((item) => `<li>${esc(item)}</li>`).join("");

    renderLayout(`
      <header class="hero">
        <p class="eyebrow">Layer 2 / ${esc(stage.no)}</p>
        <h1>${esc(stage.title)}</h1>
        <p class="lead">${esc(stage.subtitle)}</p>
        ${renderToolbar(`<a class="btn" href="${esc(stage.url)}" target="_blank" rel="noreferrer">素材URLを開く</a>`)}
      </header>

      <section class="panel soft">
        <h2>このページの役割</h2>
        <p>第2層の素材別レポートです。左側のキャプチャまたは代表画面の番号と、右側のフィードバック番号が対応しています。各指摘は、テキストレポート側と内容が変わらないように「現状の課題」「考察」「田中祐一の案」を分けています。</p>
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

  const stage = data.stages.find((item) => item.slug === slug);
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
