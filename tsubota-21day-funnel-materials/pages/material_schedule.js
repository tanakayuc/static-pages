(() => {
  const cycle = 15 * 60 * 1000;
  const update = () => {
    const now = Date.now();
    const next = Math.ceil((now + 1000) / cycle) * cycle;
    const seconds = Math.max(1, Math.ceil((next - now) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = String(seconds % 60).padStart(2, '0');
    const display = `${hours}時間 ${minutes}分 ${sec}秒`;
    for (const id of ['next-seminar-countdown', 'repeat-seminar-countdown']) {
      const node = document.getElementById(id);
      if (node) node.textContent = display;
    }
    const start = document.getElementById('next-seminar-time');
    if (start) start.textContent = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(next);
    for (const id of ['next-seminar-start', 'repeat-seminar-start', 'next-seminar-broadcast']) {
      const node = document.getElementById(id);
      if (node) node.hidden = false;
    }
    for (const node of document.querySelectorAll('[data-seminar-countdown]')) node.textContent = display;
    for (const node of document.querySelectorAll('[data-seminar-timer]')) node.hidden = false;
    const h = document.querySelector('[data-countdown-hours]');
    const m = document.querySelector('[data-countdown-minutes]');
    const s = document.querySelector('[data-countdown-seconds]');
    if (h) h.textContent = String(hours);
    if (m) m.textContent = String(minutes);
    if (s) s.textContent = sec;
  };
  update();
  setInterval(update, 1000);
})();
