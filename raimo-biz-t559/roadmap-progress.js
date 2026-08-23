document.documentElement.classList.add('v3-js')

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.roadmap-v3')
  if (!root) return

  const setExpanded = (phase, expanded) => {
    phase.dataset.expanded = String(expanded)
    const button = phase.querySelector('.phase-toggle')
    if (button) button.setAttribute('aria-expanded', String(expanded))
  }

  root.querySelectorAll('.roadmap-phase').forEach((phase) => {
    const button = phase.querySelector('.phase-toggle')
    if (!button) return
    button.addEventListener('click', () => {
      setExpanded(phase, phase.dataset.expanded !== 'true')
    })
  })

  root.querySelectorAll('.rail a').forEach((link) => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href')
      const phase = targetId?.startsWith('#') ? document.getElementById(targetId.slice(1)) : null
      if (phase) setExpanded(phase, true)
    })
  })

  if (window.location.hash) {
    const phase = document.getElementById(window.location.hash.slice(1))
    if (phase?.classList.contains('roadmap-phase')) setExpanded(phase, true)
  }
})
