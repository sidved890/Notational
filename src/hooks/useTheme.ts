'use client'

import { useEffect, useState } from 'react'
import { applyTheme, loadTheme, saveTheme, ThemeId } from '@/lib/themes'

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>('parchment')

  useEffect(() => {
    setThemeState(loadTheme())
  }, [])

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  function setTheme(next: ThemeId) {
    setThemeState(next)
  }

  return { theme, setTheme }
}
