(function () {
  const data = window.pigmarionVisualReportData;
  const app = document.getElementById("app");
  const layer = document.body.dataset.layer || "home";
  const params = new URLSearchParams(window.location.search);
  const inVisualDir = window.location.pathname.includes("/visual/");
  const root = inVisualDir ? "../" : "";
  const visual = inVisualDir ? "" : "visual/";

  const esc = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const homeUrl = () => `${root}visual-report.html`;
  const stepmailUrl = () => `${visual}stepmail.html`;
  const findingUrl = (item) => `${visual}finding.html?step=${encodeURIComponent(item.step)}`;
  const textIndexUrl = () => `${root}${data.textIndex}`;
  const characterUrl = () => `${root}${data.character}`;
  const priorityClass = (priority) => priority === "高" ? "high" : priority === "中" ? "medium" : "low";

  function tanakaSpeech(text, label = "田中祐一の全体総評") {
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

  function shell(content, activeStep = "") {
    const feedbackNav = data.findings.map((item) => `
      <a class="feedback-link ${activeStep === item.step ? "active" : ""}" href="${esc(findingUrl(item))}">
        <span>${esc(item.no)}</span>
        <strong>${esc(item.title)}</strong>
      </a>
    `).join("");
    app.innerHTML = `
      <div class="layout">
        <aside class="side">
          <p class="brand">ピグマリオン<br>Visual Report</p>
          <a class="back-link" href="${esc(stepmailUrl())}">上の階層に戻る</a>
          <small>第3層: フィードバックがある通だけ</small>
          <nav>${feedbackNav}</nav>
        </aside>
        <main class="main">${content}</main>
      </div>
    `;
  }

  function home() {
    const phaseCards = data.phases.map((phase) => `
      <article class="phase-card">
        <span>${esc(phase.range)}</span>
        <h3>${esc(phase.title)}</h3>
        <p><strong>役割:</strong> ${esc(phase.role)}</p>
        <p><strong>見るポイント:</strong> ${esc(phase.issue)}</p>
      </article>
    `).join("");
    const targetCards = data.findings.map((item) => `
      <a class="target-card" href="${esc(findingUrl(item))}">
        <span>${esc(item.no)} / ${esc(item.phase)}</span>
        <strong>${esc(item.title)}</strong>
      </a>
    `).join("");

    shell(`
      <header class="hero">
        <p class="eyebrow">第1層 / ファネル全体像</p>
        <h1>${esc(data.title)}</h1>
        <p class="lead">${esc(data.subtitle)}</p>
        <div class="toolbar">
          <a class="btn primary" href="${esc(stepmailUrl())}">第2層: ステップメール全体へ</a>
          <a class="btn" href="${esc(textIndexUrl())}">元のテキスト一覧</a>
        </div>
      </header>
      ${tanakaSpeech(data.overallSpeech)}
      <section class="section">
        <h2>3層構造</h2>
        <div class="layer-grid">
          <div><span>第1層</span><strong>ファネル全体像</strong><p>全27通の流れと、どこにフィードバックを蓄積するかを見る。</p></div>
          <div><span>第2層</span><strong>ステップメール全体</strong><p>フェーズ総評、追加素材、追い上げ更新の受け皿を見る。</p></div>
          <div><span>第3層</span><strong>個別フィードバック</strong><p>左に本文抜粋、右に具体フィードバックを1通単位で見る。</p></div>
        </div>
      </section>
      <section class="section">
        <h2>フェーズ別の全体像</h2>
        <div class="phase-grid">${phaseCards}</div>
      </section>
      <section class="section">
        <h2>フィードバック対象ステップ</h2>
        <div class="target-grid">${targetCards}</div>
      </section>
    `);
  }

  function stepmail() {
    const phaseRows = data.phases.map((phase) => `
      <article class="phase-row">
        <div><span>${esc(phase.range)}</span><h3>${esc(phase.title)}</h3></div>
        <p>${esc(phase.issue)}</p>
      </article>
    `).join("");
    const accumulation = data.accumulation.map((item, index) => `
      <li><span>${index + 1}</span>${esc(item)}</li>
    `).join("");
    const targetRows = data.findings.map((item) => `
      <a class="wide-link" href="${esc(findingUrl(item))}">
        <span class="step-pill">${esc(item.no)}</span>
        <span>
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.phase)} / 優先度 ${esc(item.priority)}</small>
        </span>
      </a>
    `).join("");

    shell(`
      <header class="hero">
        <p class="eyebrow">第2層 / ステップメール全体</p>
        <h1>ステップメール全体フィードバック</h1>
        <p class="lead">第2層では、全体の流れ、フェーズ別の詰まり、あとから追加される素材の受け皿を見ます。</p>
        <div class="toolbar">
          <a class="btn" href="${esc(homeUrl())}">第1層へ戻る</a>
          <a class="btn primary" href="${esc(findingUrl(data.findings[0]))}">第3層の最初の指摘へ</a>
        </div>
      </header>
      ${tanakaSpeech(data.stepmailSpeech)}
      <section class="section">
        <h2>フェーズ総評</h2>
        <div class="phase-list">${phaseRows}</div>
      </section>
      <section class="section">
        <h2>第3層に入るフィードバック</h2>
        <div class="wide-list">${targetRows}</div>
      </section>
      <section class="section">
        <h2>追い上げ追加に対応するルール</h2>
        <ol class="accumulation">${accumulation}</ol>
      </section>
    `);
  }

  function finding() {
    const step = params.get("step") || data.findings[0].step;
    const item = data.findings.find((finding) => finding.step === step) || data.findings[0];
    const index = data.findings.findIndex((finding) => finding.step === item.step);
    const prev = data.findings[index - 1];
    const next = data.findings[index + 1];
    shell(`
      <header class="hero compact">
        <p class="eyebrow">第3層 / ${esc(item.no)} / ${esc(item.phase)}</p>
        <h1>${esc(item.title)}</h1>
        <div class="toolbar">
          <a class="btn" href="${esc(stepmailUrl())}">上の階層に戻る</a>
          <a class="btn" href="${esc(root + item.file)}">元メールを開く</a>
        </div>
      </header>
      ${tanakaSpeech(item.tanaka, "田中祐一君のひとこと")}
      <section class="compare">
        <article class="quote-panel">
          <span class="panel-label">左側: 本文切り抜き</span>
          <h2>${esc(item.quoteTitle)}</h2>
          <blockquote>${esc(item.quote)}</blockquote>
        </article>
        <article class="feedback-panel">
          <div class="chip-row">
            <span class="chip ${priorityClass(item.priority)}">優先度 ${esc(item.priority)}</span>
            <span class="chip">${esc(item.no)}</span>
          </div>
          <h2>具体フィードバック</h2>
          <dl>
            <div><dt>現状の課題</dt><dd>${esc(item.issue)}</dd></div>
            <div><dt>考察</dt><dd>${esc(item.consideration)}</dd></div>
            <div><dt>田中祐一の案</dt><dd>${esc(item.proposal)}</dd></div>
          </dl>
        </article>
      </section>
      <nav class="prev-next">
        ${prev ? `<a class="btn" href="${esc(findingUrl(prev))}">前: ${esc(prev.no)}</a>` : "<span></span>"}
        ${next ? `<a class="btn primary" href="${esc(findingUrl(next))}">次: ${esc(next.no)}</a>` : "<span></span>"}
      </nav>
    `, item.step);
  }

  if (layer === "home") home();
  if (layer === "stepmail") stepmail();
  if (layer === "finding") finding();
})();
