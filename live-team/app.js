/* AI社員チーム ライブ表示：status.json を定期取得し、実データの出来事だけを光の粒・吹き出し・かんばん・ログで表示する */
(() => {
  'use strict';
  const POLL_MS = 15000;
  const SEG_MS = 900;
  const COLORS = {
    'COO': '#42e1a3', '動画担当': '#51b8ff', '議事録担当': '#b48bff', '調査担当': '#ffcc75',
    '家のMac': '#8fb1d0', 'Codex': '#6fd3c8', 'Claude Code': '#e9a77c', 'Mac処理': '#9fb4c8', 'あなた': '#e8f0f8'
  };
  const RED = '#ff7a8a';
  const EDGES = [
    ['動画担当', 'COO'], ['議事録担当', 'COO'], ['調査担当', 'COO'], ['COO', '家のMac'],
    ['家のMac', 'Codex'], ['家のMac', 'Claude Code'], ['家のMac', 'Mac処理']
  ];
  const WORKERS = ['Codex', 'Claude Code', 'Mac処理'];

  const $ = (s, r = document) => r.querySelector(s);
  const flow = $('#flow'), canvas = $('#wires'), ctx = canvas.getContext('2d'), bubbles = $('#bubbles');
  const nodes = {};
  document.querySelectorAll('.node').forEach(n => { nodes[n.dataset.role] = n; });

  const fmtClock = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fmtHM = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: false });
  const clock = iso => iso ? fmtClock.format(new Date(iso)) : '--:--:--';
  const hm = iso => iso ? fmtHM.format(new Date(iso)) : '--:--';
  const dur = s => {
    if (s == null) return '';
    s = Math.max(0, Math.round(s));
    if (s < 60) return s + '秒';
    if (s < 3600) return Math.floor(s / 60) + '分' + (s % 60 ? (s % 60) + '秒' : '');
    return Math.floor(s / 3600) + '時間' + Math.floor((s % 3600) / 60) + '分';
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let data = null, seen = new Set(), first = true, nextPollAt = 0;
  const evQueue = [];
  const particles = [];
  let busy = {};

  /* ---------- 図形 ---------- */
  let W = 0, H = 0, DPR = 1, geo = {};
  function layout() {
    const r = flow.getBoundingClientRect();
    DPR = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    geo = {};
    for (const [a, b] of EDGES) {
      const ra = nodes[a].getBoundingClientRect(), rb = nodes[b].getBoundingClientRect();
      const up = ra.top < rb.top ? [ra, rb] : [rb, ra];
      const p0 = { x: up[0].left + up[0].width / 2 - r.left, y: up[0].bottom - r.top };
      const p3 = { x: up[1].left + up[1].width / 2 - r.left, y: up[1].top - r.top };
      const dy = (p3.y - p0.y) * 0.55;
      const seg = { p0, p1: { x: p0.x, y: p0.y + dy }, p2: { x: p3.x, y: p3.y - dy }, p3, top: ra.top < rb.top ? a : b };
      geo[a + '|' + b] = seg; geo[b + '|' + a] = seg;
    }
  }
  function bez(s, t) {
    const u = 1 - t;
    return {
      x: u * u * u * s.p0.x + 3 * u * u * t * s.p1.x + 3 * u * t * t * s.p2.x + t * t * t * s.p3.x,
      y: u * u * u * s.p0.y + 3 * u * u * t * s.p1.y + 3 * u * t * t * s.p2.y + t * t * t * s.p3.y
    };
  }
  // from→to の向きで 0..1 の位置を返す
  function along(from, to, t) {
    const s = geo[from + '|' + to];
    if (!s) return null;
    return bez(s, s.top === from ? t : 1 - t);
  }

  function edgeActive(a, b) {
    if (WORKERS.includes(a) && b === '家のMac') return busy[a];
    if (WORKERS.includes(b) && a === '家のMac') return busy[b];
    if ((a === 'COO' && b === '家のMac') || (b === 'COO' && a === '家のMac')) return WORKERS.some(w => busy[w]);
    return false;
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    for (const [a, b] of EDGES) {
      const s = geo[a + '|' + b]; if (!s) continue;
      ctx.beginPath(); ctx.moveTo(s.p0.x, s.p0.y); ctx.bezierCurveTo(s.p1.x, s.p1.y, s.p2.x, s.p2.y, s.p3.x, s.p3.y);
      ctx.lineWidth = 2; ctx.strokeStyle = '#273a4f'; ctx.setLineDash([]); ctx.stroke();
      if (edgeActive(a, b)) {
        const w = WORKERS.includes(a) ? a : WORKERS.includes(b) ? b : 'COO';
        ctx.lineWidth = 2; ctx.strokeStyle = COLORS[w] + '66'; ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -(now / 60) % 16; ctx.stroke(); ctx.setLineDash([]);
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const el = now - p.t0;
      const segIdx = Math.floor(el / p.segMs);
      if (segIdx >= p.route.length - 1) { arrive(p, p.route[p.route.length - 1]); particles.splice(i, 1); continue; }
      if (segIdx !== p.seg) {
        if (p.seg >= 0) flash(p.route[p.seg + 1], p.color);
        p.seg = segIdx;
        if (p.label) showBubble(p, segIdx);
      }
      const t = (el - segIdx * p.segMs) / p.segMs;
      const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pos = along(p.route[segIdx], p.route[segIdx + 1], e);
      if (!pos) { particles.splice(i, 1); continue; }
      p.trail.push(pos); if (p.trail.length > 14) p.trail.shift();
      for (let k = 0; k < p.trail.length; k++) {
        const q = p.trail[k], a = (k + 1) / p.trail.length;
        ctx.beginPath(); ctx.arc(q.x, q.y, p.r * a * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(a * 90).toString(16).padStart(2, '0'); ctx.fill();
      }
      ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = p.small ? 8 : 16;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, p.r * 0.45, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  function flash(role, color) {
    const n = nodes[role]; if (!n) return;
    n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash');
    clearTimeout(n._ft); n._ft = setTimeout(() => n.classList.remove('flash'), 1200);
  }
  function arrive(p, role) { flash(role, p.color); }

  const VERB = { '受付': 'を依頼', '依頼': 'をお願いします', '完了報告': '終わりました', '失敗報告': '要確認です' };
  function showBubble(p, segIdx) {
    const a = p.route[segIdx], b = p.route[segIdx + 1];
    const pos = along(a, b, 0.5); if (!pos) return;
    const d = document.createElement('div');
    d.className = 'bubble';
    d.style.setProperty('--c', p.color);
    let text;
    if (p.ev.action === 'セッション開始') text = `<b>${esc(b)}</b> 作業セッション開始`;
    else if (p.ev.action === 'セッション終了') text = `<b>${esc(a)}</b> セッション終了`;
    else text = `<b>${esc(a)}</b> → ${esc(b)}「${esc(p.ev.category)}」${VERB[p.ev.action] || ''}`;
    d.innerHTML = text;
    // 画面外へはみ出さないよう位置を寄せる
    const x = Math.min(Math.max(pos.x, 110), W - 110);
    // 同じ場所に重ならないよう、表示中の吹き出しの数だけ上下にずらす
    const k = bubbles.children.length % 3;
    d.style.left = x + 'px'; d.style.top = (pos.y + (k === 1 ? -30 : k === 2 ? 30 : 0)) + 'px';
    bubbles.appendChild(d);
    setTimeout(() => d.remove(), 2700);
  }

  function spawn(ev, opts = {}) {
    const route = ev.route || [];
    if (route.length < 2) { // 1点の出来事（フォルダ更新・保留）は光らせるだけ
      flash(route[0] || '家のMac');
      if (opts.label !== false) pointBubble(ev);
      return;
    }
    const failed = ev.action === '失敗報告';
    const colorRole = ev.action === '完了報告' || ev.action === '失敗報告' ? route[route.length - 1] : route[0];
    let color = failed ? RED : (COLORS[ev.action.startsWith('セッション') ? (WORKERS.includes(route[0]) ? route[0] : route[1]) : colorRole] || '#9fd');
    particles.push({ ev, route, color, t0: performance.now(), seg: -1, segMs: opts.segMs || SEG_MS, trail: [], r: opts.small ? 3.5 : 6, small: !!opts.small, label: opts.label !== false });
  }
  function pointBubble(ev) {
    const n = nodes[ev.route[0] || '家のMac']; if (!n) return;
    const r = n.getBoundingClientRect(), fr = flow.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'bubble';
    d.style.setProperty('--c', COLORS['家のMac']);
    d.innerHTML = ev.action === '保留' ? '<b>家のMac</b> 空きメモリ待ちで保留' : `<b>作業フォルダ更新</b>「${esc(ev.category)}」`;
    d.style.left = Math.min(Math.max(r.left - fr.left + r.width / 2, 110), W - 110) + 'px';
    d.style.top = (r.top - fr.top - 14) + 'px';
    bubbles.appendChild(d); setTimeout(() => d.remove(), 2700);
  }

  /* ---------- 出来事の順番再生 ---------- */
  let lastPlay = 0;
  function pump() {
    const now = performance.now();
    const gap = evQueue.length > 6 ? 650 : 1500;
    if (evQueue.length && now - lastPlay > gap) {
      const ev = evQueue.shift();
      spawn(ev); addLog(ev, true); lastPlay = now;
    }
  }
  setInterval(pump, 200);

  // 実行中の担当には、作業中である間だけ小さな粒を往復させる（busy 状態＝実データ）
  let hbFlip = false;
  setInterval(() => {
    hbFlip = !hbFlip;
    for (const w of WORKERS) if (busy[w]) spawn({ route: hbFlip ? ['家のMac', w] : [w, '家のMac'], action: '', category: '' }, { small: true, label: false, segMs: 1400 });
  }, 3200);

  /* ---------- ログ ---------- */
  const logBox = $('#log');
  const logInner = document.createElement('div'); logInner.className = 'inner'; logBox.appendChild(logInner);
  function logText(ev) {
    const r = ev.route || [];
    const who = r.length >= 2 ? `<span class="who" style="color:${COLORS[r[0]] || '#ccd'}">${esc(r[0])}</span> → ${esc(r[r.length - 1])}` : `<span class="who" style="color:${COLORS['家のMac']}">${esc(r[0] || '家のMac')}</span>`;
    let what;
    switch (ev.action) {
      case '受付': what = `受付「${esc(ev.category)}」`; break;
      case '依頼': what = `依頼「${esc(ev.category)}」`; break;
      case '完了報告': what = `完了「${esc(ev.category)}」`; break;
      case '失敗報告': what = `<span style="color:${RED}">要確認「${esc(ev.category)}」</span>`; break;
      case 'セッション開始': what = '作業セッション開始'; break;
      case 'セッション終了': what = 'セッション終了'; break;
      case '作業中': what = `作業フォルダ更新「${esc(ev.category)}」`; break;
      case '保留': what = '空きメモリ待ちで保留'; break;
      default: what = esc(ev.action);
    }
    return `<span class="tm">${clock(ev.at)}</span>${who}　${what}<span class="id">#${esc(ev.id.slice(0, 4))}</span>`;
  }
  function addLog(ev, fresh) {
    const d = document.createElement('div');
    d.className = 'ln' + (fresh ? ' fresh' : '');
    d.innerHTML = logText(ev);
    d.dataset.at = ev.at || '';
    // 時刻順に差し込む（遅れて届いた記録も正しい位置へ）
    const later = Array.from(logInner.children).find(x => x.dataset.at > d.dataset.at);
    logInner.insertBefore(d, later || null);
    while (logInner.children.length > 40) logInner.firstChild.remove();
  }

  /* ---------- かんばん（FLIPで列間を移動） ---------- */
  const cardEls = new Map();
  const SMALL = window.matchMedia('(max-width:640px)').matches;
  const N = SMALL ? 3 : 4;
  const LIMIT = { '待ち': N, '実行中': N, '確認': N, '完了': N };
  function cardHTML(j) {
    let tm, bar = '';
    if (j.state === '待ち') tm = `受付 ${hm(j.queued_at)}`;
    else if (j.state === '実行中') {
      const el = j.started_at ? (Date.now() - new Date(j.started_at).getTime()) / 1000 : j.elapsed_s;
      tm = `開始 ${hm(j.started_at)}<br>経過 ${dur(el)}`;
      bar = j.progress == null ? '<div class="bar indet"><i></i></div>' : `<div class="bar"><i style="width:${j.progress}%"></i></div>`;
    } else tm = `終了 ${hm(j.ended_at)}${j.duration_s != null ? '<br>所要 ' + dur(j.duration_s) : ''}`;
    const bad = j.result === '失敗' ? ' <span class="bad">要確認</span>' : '';
    return `<div class="t">${esc(j.category)}${bad}<small>#${esc(j.id.slice(0, 4))}</small></div>` +
      `<div class="w">${esc(j.requester)} →<br>${esc(j.worker)}</div><div class="tm">${tm}</div>${bar}`;
  }
  function renderKanban(jobs) {
    const before = new Map();
    cardEls.forEach((el, id) => before.set(id, el.getBoundingClientRect()));
    const keep = new Set();
    document.querySelectorAll('#kanban .col').forEach(col => {
      const st = col.dataset.col;
      const list = jobs.filter(j => j.state === st);
      col.querySelector('h3 em').textContent = list.length;
      const box = col.querySelector('.cards');
      const frag = document.createDocumentFragment();
      list.slice(0, LIMIT[st]).forEach(j => {
        let el = cardEls.get(j.id);
        const isNew = !el;
        if (!el) { el = document.createElement('div'); cardEls.set(j.id, el); }
        el.className = 'card' + (isNew && !first ? ' new' : '');
        el.style.setProperty('--c', j.result === '失敗' ? RED : (COLORS[j.requester] || '#8ab'));
        el.innerHTML = cardHTML(j); el._job = j;
        keep.add(j.id); frag.appendChild(el);
      });
      box.innerHTML = '';
      box.appendChild(frag);
      if (!list.length) box.insertAdjacentHTML('beforeend', '<div class="empty">なし</div>');
      if (list.length > LIMIT[st]) box.insertAdjacentHTML('beforeend', `<div class="more">ほか ${list.length - LIMIT[st]}件</div>`);
    });
    cardEls.forEach((el, id) => { if (!keep.has(id)) cardEls.delete(id); });
    cardEls.forEach((el, id) => {
      const b = before.get(id); if (!b) return;
      const a = el.getBoundingClientRect();
      const dx = b.left - a.left, dy = b.top - a.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.style.transition = 'none'; el.style.transform = `translate(${dx}px,${dy}px)`;
      el.style.zIndex = 10; el.style.position = 'relative';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = 'transform 1.1s cubic-bezier(.2,.8,.2,1)'; el.style.transform = '';
        setTimeout(() => { el.style.zIndex = ''; }, 1200);
      }));
    });
  }
  setInterval(() => { cardEls.forEach(el => { if (el._job && el._job.state === '実行中') el.querySelector('.tm').innerHTML = cardHTML(el._job).match(/<div class="tm">(.*?)<\/div>/)[1]; }); }, 1000);

  /* ---------- 数値・ノード ---------- */
  function setStat(id, v) {
    const el = document.getElementById(id);
    if (el.textContent !== String(v)) { el.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  function renderNodes(d) {
    busy = {};
    for (const w of d.workers || []) {
      busy[w.role] = w.state === '作業中';
      const n = nodes[w.role]; if (!n) continue;
      n.classList.toggle('busy', busy[w.role]);
      n.querySelector('.st').innerHTML = `実行中 ${w.running_jobs}・完了 ${w.done_24h}<br>作業セッション ${w.active_sessions}`;
      const run = (d.jobs || []).find(j => j.worker === w.role && j.state === '実行中');
      const bar = n.querySelector('.bar'), i = bar.querySelector('i');
      if (run && run.progress != null) { bar.classList.remove('indet'); i.style.width = run.progress + '%'; }
      else if (busy[w.role]) { bar.classList.add('indet'); i.style.width = ''; }
      else { bar.classList.remove('indet'); i.style.width = '0'; }
    }
    for (const a of d.agents || []) {
      const n = nodes[a.role]; if (!n) continue;
      n.querySelector('.st').textContent = `待ち ${a.waiting}・実行中 ${a.running}・確認 ${a.review}`;
      n.classList.toggle('busy', a.running > 0);
    }
    const s = d.summary || {};
    nodes['家のMac'].querySelector('.st').textContent = `待ち ${s.waiting}件・実行中 ${s.running}件・更新中フォルダ ${s.active_folders}`;
    nodes['家のMac'].classList.toggle('busy', s.running > 0);
  }

  function render(d) {
    $('#updated').textContent = clock(d.generated_at);
    const s = d.summary;
    setStat('s-waiting', s.waiting); setStat('s-running', s.running); setStat('s-review', s.review);
    setStat('s-done', s.done); setStat('s-sessions', s.active_sessions); setStat('s-folders', s.active_folders);
    renderNodes(d);
    renderKanban(d.jobs || []);
    const evs = d.events || [];
    if (first) {
      // 初回：過去の記録はログに並べ、直近の数件だけを順に光の粒で再生する
      const replay = evs.filter(e => !e.action.startsWith('セッション')).slice(-5);
      const replayIds = new Set(replay.map(e => e.id));
      evs.forEach(e => { seen.add(e.id); if (!replayIds.has(e.id)) addLog(e, false); });
      replay.forEach(e => evQueue.push(e));
      first = false;
    } else {
      evs.forEach(e => { if (!seen.has(e.id)) { seen.add(e.id); evQueue.push(e); } });
    }
  }

  function liveState() {
    const live = $('#live'), txt = $('#live-text');
    if (!data) return;
    const age = (Date.now() - new Date(data.generated_at).getTime()) / 1000;
    const lim = Math.max(120, (data.interval_s || 30) * 4);
    live.className = 'live' + (age > lim ? ' stale' : '');
    txt.textContent = age > lim ? '更新が止まっています' : 'LIVE';
    const left = Math.max(0, Math.round((nextPollAt - Date.now()) / 1000));
    $('#next').textContent = `データ生成から ${dur(age)}・次の確認まで ${left}秒`;
  }
  setInterval(liveState, 1000);

  async function poll() {
    nextPollAt = Date.now() + POLL_MS;
    try {
      const res = await fetch('status.json?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      data = d; render(d); liveState();
    } catch (e) {
      $('#live').className = 'live wait'; $('#live-text').textContent = '再接続中';
    }
  }

  window.addEventListener('resize', () => { layout(); });
  layout();
  requestAnimationFrame(draw);
  poll();
  setInterval(poll, POLL_MS);
})();
