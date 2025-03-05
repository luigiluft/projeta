
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Validamos que o valor do tema é válido (dark, light ou system)
  const getSystemTheme = () => {
    const storedTheme = localStorage.getItem("theme")
    // Verificar se o tema armazenado é válido
    if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
      return storedTheme
    }
    // Se não for válido, retornar o padrão
    return "system"
  }

  return (
    <NextThemesProvider
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
