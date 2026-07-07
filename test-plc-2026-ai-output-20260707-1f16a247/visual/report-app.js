
(function(){
  const data = window.masudaVisualReportData || {};
  const materialData = window.masudaMaterialItems || { items: [], fetchReport: [] };
  const app = document.getElementById("app");
  const slug = document.body.dataset.stage || "home";
  const inVisualDir = window.location.pathname.includes("/visual/");
  const root = inVisualDir ? "../" : "";
  const visual = inVisualDir ? "" : "visual/";
  const esc = (v) => String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const stageUrl = (stage) => visual + stage.slug + ".html";
  function nav(active){
    const stages = (data.stages || []).map(stage => '<a class="navlink '+(active===stage.slug?'active':'')+'" href="'+esc(stageUrl(stage))+'">'+esc(stage.no)+'. '+esc(stage.title)+'</a>').join("");
    return '<aside class="side"><p class="brand">'+esc(data.title || "田中祐一AI 添削レポート")+'</p><span class="side-note">独立HTML成果物</span><div class="nav-section">レポート</div><a class="navlink '+(active==="home"?'active':'')+'" href="'+root+'visual-report.html">ビジュアルレポート</a><a class="navlink" href="'+root+'text-report.html">テキストレポート</a><a class="navlink '+(active==="materials"?'active':'')+'" href="'+visual+'materials.html">原本素材集</a><a class="navlink" href="'+root+'index.html">ポータル</a><div class="nav-section">素材</div>'+stages+'</aside>';
  }
  function shell(active, body){ app.innerHTML = '<div class="layout">'+nav(active)+'<main class="main"><div class="wrap">'+body+'</div></main></div>'; }
  function renderHome(){
    const stages = data.stages || [];
    shell("home", '<p class="eyebrow">VISUAL REPORT</p><h1>'+esc(data.title || "ビジュアルレポート")+'</h1><p class="lead">'+esc(data.subtitle || "")+'</p><div class="toolbar"><a class="btn primary" href="'+root+'text-report.html">テキストレポート</a><a class="btn" href="'+visual+'materials.html">原本素材集</a></div><section class="section"><h2>全体レポート</h2><p>'+esc(data.overallSpeech || "素材別の該当箇所と番号付きフィードバックを確認します。")+'</p></section><section class="section"><h2>素材別レポート</h2>'+stages.map(stage => '<a class="btn" href="'+esc(stageUrl(stage))+'">'+esc(stage.no)+'. '+esc(stage.title)+'</a>').join(" ")+'</section>');
  }
  function renderStage(stage){
    const source = stage.kind === "image" && stage.image ? '<div class="capture"><img src="'+root+esc(stage.image)+'" alt="'+esc(stage.caption || stage.title)+'">'+(stage.pins||[]).map(pin => '<span class="pin" style="left:'+esc(pin.x)+';top:'+esc(pin.y)+'">'+esc(pin.id)+'</span>').join("")+'</div>' : '<div class="mock-source">'+esc((stage.mockLines || []).join("\n"))+'</div>';
    const findings = (stage.findings || []).map(f => '<details class="finding" open><summary><span class="num">'+esc(f.id)+'</span><span>'+esc(f.title || f.target)+'</span></summary><div class="finding-body"><span class="badge">優先度 '+esc(f.priority || "medium")+'</span><p><strong>見る場所:</strong> '+esc(f.target || "")+'</p><p><strong>だからこう見える:</strong> '+esc(f.issue || "")+'</p><p><strong>次に直すなら:</strong> '+esc(f.proposal || "")+'</p><p><strong>Before:</strong> '+esc(f.before || "")+'</p><p><strong>After:</strong> '+esc(f.after || "")+'</p></div></details>').join("");
    shell(stage.slug, '<p class="eyebrow">VISUAL MATERIAL</p><h1>'+esc(stage.title)+'</h1><p class="lead">'+esc(stage.subtitle || "")+'</p><div class="toolbar"><a class="btn" href="'+visual+'materials.html">原本素材集</a><a class="btn" href="'+root+'text-report.html">テキストレポート</a></div><div class="stage-grid"><section class="card"><h2>該当素材</h2>'+source+'<p class="lead">'+esc(stage.caption || "")+'</p></section><section class="card"><h2>番号付きフィードバック</h2>'+findings+'</section></div>');
  }
  function renderMaterials(){
    const items = materialData.items || [];
    shell("materials", '<p class="eyebrow">SOURCE MATERIALS</p><h1>原本素材集</h1><p class="lead">受け取った素材のMD正本です。ここには分析や改善案を混ぜません。</p><section class="section"><h2>素材一覧</h2>'+items.map((item, idx) => '<article class="source-item"><span class="badge">'+esc(item.kind)+'</span>'+(item.unavailable?'<span class="badge">要アップロード</span>':'')+'<h3>'+esc(String(idx+1).padStart(2,"0"))+'. '+esc(item.title)+'</h3>'+(item.sourceUrl?'<p><a href="'+esc(item.sourceUrl)+'">原本URL</a></p>':'')+(item.uploadRequest?'<p><strong>追加提出:</strong> '+esc(item.uploadRequest)+'</p>':'')+'<details open><summary>MD本文</summary><pre>'+esc(item.markdown)+'</pre></details></article>').join("")+'</section>');
  }
  if (slug === "materials") renderMaterials();
  else if (slug === "home") renderHome();
  else {
    const stage = (data.stages || []).find(item => item.slug === slug);
    if (stage) renderStage(stage); else renderHome();
  }
})();
