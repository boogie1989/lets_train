// Global theme state. Writes [data-theme] on <html> so every CSS token
// (and therefore every screen + phone mock) re-themes live. Persisted.
import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'lt-theme-v3'
const ThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggle: () => {} })

function readInitial() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  }
  return 'dark'
}

function applyTheme(t) {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = t
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitial)

  // persist + cover the initial mount
  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  // set the attribute synchronously so consumers that read getComputedStyle
  // on the next render (e.g. the Theme page's live labels) never lag a click
  const setTheme = (t) => { applyTheme(t); setThemeState(t) }
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
