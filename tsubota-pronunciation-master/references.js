(() => {
  const disclosure = document.getElementById("references-details");
  if (!disclosure) return;

  const revealReference = (hash, scroll) => {
    if (!/^#ref-[1-4]$/.test(hash)) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    disclosure.open = true;
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  };

  document.querySelectorAll(".citation a").forEach((link) => {
    link.addEventListener("click", () => revealReference(link.hash, true));
  });
  window.addEventListener("hashchange", () => revealReference(location.hash, true));
  revealReference(location.hash, true);
})();
