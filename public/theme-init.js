;(() => {
  try {
    const stored = localStorage.getItem('qrcs.theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme =
      stored === 'light' || stored === 'dark' ? stored : systemDark ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  } catch {
    document.documentElement.dataset.theme = 'light'
  }
})()
