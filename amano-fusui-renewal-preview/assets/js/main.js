/* 風水吉運 リニューアル案（ダミー）の動き
   音声・動画は一切再生しない。映像の雰囲気は静止画の切り替えで表現する。 */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- モーダル共通：背面を操作不可にし、Tab移動を中に閉じ込める ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const setBackground = (dialog, inert) => {
    [...document.body.children].forEach((el) => {
      if (el !== dialog && el.tagName !== "SCRIPT") el.inert = inert;
    });
  };
  const trapTab = (dialog, e) => {
    if (e.key !== "Tab") return;
    const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- 現在ページのナビ表示 ---------- */
  const here = (location.pathname.split("/").pop() || "index.html").replace(/\?.*$/, "");
  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.dataset.nav.split(" ").includes(here)) el.setAttribute("aria-current", "page");
  });

  /* ---------- PCのドロップダウン：Escで閉じる ---------- */
  document.querySelectorAll(".gnav__item").forEach((item) => {
    if (!item.querySelector(".dropdown")) return;
    const link = item.querySelector(".gnav__btn");
    link.setAttribute("aria-haspopup", "true");
    const sync = () => link.setAttribute("aria-expanded", String(item.matches(":hover, :focus-within") && !item.classList.contains("is-dismissed")));
    item.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      item.classList.add("is-dismissed");
      link.focus();
      sync();
    });
    item.addEventListener("mouseleave", () => { item.classList.remove("is-dismissed"); sync(); });
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) item.classList.remove("is-dismissed"); setTimeout(sync); });
    item.addEventListener("mouseenter", sync);
    item.addEventListener("focusin", sync);
  });

  /* ---------- サイドメニュー（スマホ） ---------- */
  const side = document.querySelector(".side-menu");
  const toggle = document.querySelector(".menu-toggle");
  if (side && toggle) {
    const open = (state) => {
      side.classList.toggle("is-open", state);
      side.setAttribute("aria-hidden", String(!state));
      toggle.setAttribute("aria-expanded", String(state));
      document.body.style.overflow = state ? "hidden" : "";
      setBackground(side, state);
      if (state) side.querySelector(".side-menu__close").focus();
      else toggle.focus();
    };
    side.setAttribute("aria-hidden", "true");
    toggle.addEventListener("click", () => open(true));
    side.querySelectorAll("[data-close], a").forEach((el) => el.addEventListener("click", () => open(false)));
    side.addEventListener("keydown", (e) => trapTab(side, e));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && side.classList.contains("is-open")) open(false); });
  }

  /* ---------- ヒーロー：映画のカット割り ---------- */
  const hero = document.querySelector(".hero");
  if (hero) {
    const slides = [...hero.querySelectorAll(".hero__slide")];
    const thumbs = [...hero.querySelectorAll(".hero__thumb")];
    const swaps = [...hero.querySelectorAll(".hero__swap")];
    const counter = hero.querySelector("[data-counter]");
    const pauseBtn = hero.querySelector(".hero__pause");
    const DURATION = 7000;
    let index = 0;
    let timer = null;
    let paused = reduceMotion;
    let remaining = DURATION;
    let startedAt = 0;

    hero.style.setProperty("--dur", `${DURATION}ms`);

    const render = (next) => {
      const prev = index;
      index = (next + slides.length) % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle("is-active", i === index);
        s.classList.toggle("is-leaving", i === prev && prev !== index);
        s.setAttribute("aria-hidden", String(i !== index));
      });
      thumbs.forEach((t, i) => {
        t.classList.remove("is-active");
        if (i === index) { void t.offsetWidth; t.classList.add("is-active"); }
        t.setAttribute("aria-current", String(i === index));
      });
      // 文字は少し遅れて差し替える
      const data = slides[index].dataset;
      swaps.forEach((el) => el.classList.add("is-out"));
      setTimeout(() => {
        swaps.forEach((el) => {
          el.textContent = data[el.dataset.swap] || "";
          el.classList.remove("is-out");
        });
      }, prev === index ? 0 : 450);
      if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      setTimeout(() => slides[prev] && slides[prev].classList.remove("is-leaving"), 1700);
    };

    const schedule = (ms) => {
      clearTimeout(timer);
      if (paused) return;
      startedAt = performance.now();
      remaining = ms;
      timer = setTimeout(() => { render(index + 1); schedule(DURATION); }, ms);
    };

    const setPaused = (state) => {
      paused = state;
      hero.classList.toggle("is-paused", state);
      if (pauseBtn) {
        pauseBtn.setAttribute("aria-label", state ? "スライドを再開" : "スライドを一時停止");
        pauseBtn.innerHTML = state
          ? '<svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z"/></svg>'
          : '<svg viewBox="0 0 10 10"><rect x="1.5" y="1" width="2.5" height="8"/><rect x="6" y="1" width="2.5" height="8"/></svg>';
      }
      if (state) {
        clearTimeout(timer);
        remaining = Math.max(400, remaining - (performance.now() - startedAt));
      } else {
        schedule(remaining);
      }
    };

    thumbs.forEach((t, i) => t.addEventListener("click", () => {
      if (i === index) return; // 表示中のカットを押しても、リングと背景の動きをずらさない
      render(i); remaining = DURATION; if (!paused) schedule(DURATION);
    }));
    if (pauseBtn) pauseBtn.addEventListener("click", () => setPaused(!paused));
    document.addEventListener("visibilitychange", () => {
      if (paused) return;
      if (document.hidden) {
        clearTimeout(timer);
        remaining = Math.max(400, remaining - (performance.now() - startedAt));
        hero.classList.add("is-paused");
      } else {
        hero.classList.remove("is-paused");
        schedule(remaining);
      }
    });

    render(0);
    setPaused(paused);
    if (!paused) schedule(DURATION);
  }

  /* ---------- スクロールで表示 ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- パララックス（空撮） ---------- */
  const parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      parallax.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
        el.style.transform = `translate3d(0, ${(p * -6).toFixed(2)}%, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  /* ---------- カルーセル ---------- */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel__track");
    const prev = root.querySelector("[data-prev]");
    const next = root.querySelector("[data-next]");
    if (!track || !prev || !next) return;
    const step = () => {
      const item = track.children[0];
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
    };
    const sync = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    const behavior = reduceMotion ? "auto" : "smooth";
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior }));
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    addEventListener("resize", sync);
    sync();
  });

  /* ---------- 映像モーダル（無音の静止画シーケンス。クリックした時だけ始まる） ---------- */
  const movie = document.querySelector(".movie");
  const openers = document.querySelectorAll("[data-movie-open]");
  if (movie && openers.length) {
    const frames = [...movie.querySelectorAll(".movie__frame")];
    const caption = movie.querySelector(".movie__caption");
    let captionTimer = null;
    const bar = movie.querySelector(".movie__progress");
    const FRAME = 2500; // data-dur が無いカットの表示時間
    let i = 0;
    let end = 0;
    let t = null;
    let lastFocus = null;
    const dur = (n) => Number(frames[n].dataset.dur || FRAME);
    const elapsed = (n) => frames.slice(0, n).reduce((sum, _, k) => sum + dur(k), 0);
    let start = 0;
    const progress = (n) => ((elapsed(n) - elapsed(start)) / (elapsed(end + 1) - elapsed(start))) * 100;
    const show = (n) => {
      frames.forEach((f, k) => f.classList.toggle("is-active", k === n));
      const text = frames[n].dataset.caption;
      if (text !== undefined) {
        caption.classList.add("is-out");
        clearTimeout(captionTimer);
        captionTimer = setTimeout(() => { caption.textContent = text; caption.classList.remove("is-out"); }, 380);
      }
      bar.style.transition = "none";
      bar.style.width = `${progress(n)}%`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${dur(n)}ms linear`;
        bar.style.width = `${progress(n + 1)}%`;
      }));
    };
    const close = () => {
      clearTimeout(t);
      movie.classList.remove("is-open");
      movie.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setBackground(movie, false);
      clearTimeout(captionTimer);
      caption.textContent = "";
      caption.classList.remove("is-out");
      if (lastFocus) lastFocus.focus();
    };
    const nextBtn = movie.querySelector(".movie__next");
    const step = () => {
      i += 1;
      if (i > end) { close(); return; }
      if (reduceMotion) show(i); else loop();
    };
    const loop = () => {
      show(i);
      if (reduceMotion) return;
      t = setTimeout(step, dur(i));
    };
    openers.forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      lastFocus = btn;
      i = Math.min(frames.length - 1, Number(btn.dataset.start || 0));
      start = i;
      end = Math.min(frames.length - 1, Number(btn.dataset.end || frames.length - 1));
      movie.classList.add("is-open");
      movie.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setBackground(movie, true);
      movie.querySelector(".movie__close").focus();
      loop();
    }));
    movie.querySelector(".movie__close").addEventListener("click", close);
    nextBtn.addEventListener("click", () => { clearTimeout(t); step(); });
    movie.addEventListener("keydown", (e) => trapTab(movie, e));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && movie.classList.contains("is-open")) close(); });
  }

  /* ---------- お問い合わせフォーム（ダミー：送信しない） ---------- */
  const form = document.querySelector("[data-form]");
  if (form) {
    const result = document.querySelector("[data-result]");
    // スクリプトが動いた時だけ確認ボタンを有効にする（未読込時に送信されないように）
    form.querySelector("button[type=submit]").disabled = false;
    const rules = {
      name: (v) => v.trim().length > 0 || "お名前を入力してください。",
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "メールアドレスの形式を確認してください（例: name@example.com）。",
      topic: (v) => v !== "" || "ご相談の種類を選んでください。",
      message: (v) => v.trim().length >= 10 || "ご相談内容を10文字以上で書いてください。",
      agree: (_, el) => el.checked || "個人情報の取り扱いへの同意が必要です。",
    };
    const check = (el) => {
      const rule = rules[el.name];
      if (!rule) return true;
      const ok = rule(el.value, el);
      const field = el.closest(".field");
      field.classList.toggle("is-invalid", ok !== true);
      el.setAttribute("aria-invalid", String(ok !== true));
      field.querySelector(".error").textContent = ok === true ? "" : ok;
      return ok === true;
    };
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("blur", () => check(el));
      el.addEventListener("change", () => check(el));
      // エラー表示中は入力のたびに確かめ直し、直った時点で消す（クリック直前のレイアウトのずれを防ぐ）
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) check(el); });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll("input, select, textarea")].filter((el) => rules[el.name]);
      const results = fields.map(check);
      if (results.includes(false)) {
        const first = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
        if (first) first.focus();
        return;
      }
      const data = new FormData(form);
      result.querySelector("[data-echo-name]").textContent = data.get("name");
      result.querySelector("[data-echo-topic]").textContent = data.get("topic");
      result.querySelector("[data-echo-email]").textContent = data.get("email");
      result.querySelector("[data-echo-house]").textContent = data.get("house") || "（未選択）";
      result.querySelector("[data-echo-message]").textContent = data.get("message");
      form.hidden = true;
      result.hidden = false;
      result.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      result.querySelector("h2").focus();
    });
    const again = document.querySelector("[data-again]");
    // 戻っても入力内容は消さない
    if (again) again.addEventListener("click", () => { result.hidden = true; form.hidden = false; form.querySelector("input, select, textarea").focus(); });
  }

  /* ---------- 特徴カードの図 ---------- */
  const SVG = "http://www.w3.org/2000/svg";
  document.querySelectorAll("[data-ticks]").forEach((svg) => {
    const total = 60;
    for (let k = 0; k < total; k += 1) {
      const a = (k / total) * Math.PI * 2 - Math.PI / 2;
      const line = document.createElementNS(SVG, "line");
      line.setAttribute("x1", 85 + Math.cos(a) * 72);
      line.setAttribute("y1", 85 + Math.sin(a) * 72);
      line.setAttribute("x2", 85 + Math.cos(a) * 82);
      line.setAttribute("y2", 85 + Math.sin(a) * 82);
      line.setAttribute("class", k < 3 ? "gauge__tick on" : "gauge__tick");
      svg.appendChild(line);
    }
  });
  // 日本地図（ドット）。# が陸地、* が鑑定の多い地域
  const JAPAN = [
    "...............##..",
    "..............####.",
    ".............###*##",
    "..............####.",
    "...............#...",
    "..............##...",
    "..............##...",
    ".............###...",
    "............##*....",
    "...........####....",
    ".........##*#*.....",
    ".......######......",
    ".....###*##........",
    "...##*##...........",
    "..##..###..........",
    "..##...............",
    "..#................",
    "...................",
    "*..................",
  ];
  document.querySelectorAll("[data-japan]").forEach((svg) => {
    JAPAN.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("cx", 5 + x * 10);
      c.setAttribute("cy", 5 + y * 10);
      c.setAttribute("r", ch === "*" ? 4 : 3.4);
      if (ch === "*") c.setAttribute("class", "hot");
      svg.appendChild(c);
    }));
  });
})();
