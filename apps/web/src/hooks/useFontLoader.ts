import { useCallback, useRef } from "react"

import type { FontDefinition } from "@/data/fonts"

async function loadFontWeights(fontName: string) {
  if (!document.fonts) {
    return
  }

  await Promise.allSettled([
    document.fonts.load(`400 1rem "${fontName}"`),
    document.fonts.load(`700 1rem "${fontName}"`),
  ])
}

export function useFontLoader() {
  const loadedIdsRef = useRef<Set<string>>(new Set())
  const pendingLoadsRef = useRef<Map<string, Promise<void>>>(new Map())

  const loadFont = useCallback(async (font: FontDefinition) => {
    if (loadedIdsRef.current.has(font.id)) {
      await loadFontWeights(font.name)
      return
    }

    const pendingLoad = pendingLoadsRef.current.get(font.id)
    if (pendingLoad) {
      await pendingLoad
      return
    }

    const existingLink = document.head.querySelector<HTMLLinkElement>(
      `link[data-font-id="${font.id}"]`
    )

    if (existingLink?.sheet) {
      loadedIdsRef.current.add(font.id)
      await loadFontWeights(font.name)
      return
    }

    const link = existingLink ?? document.createElement("link")
    link.rel = "stylesheet"
    link.href = font.google_url
    link.dataset.fontId = font.id

    const loadPromise = new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        link.removeEventListener("load", onLoad)
        link.removeEventListener("error", onError)
      }

      const onLoad = async () => {
        cleanup()
        pendingLoadsRef.current.delete(font.id)
        loadedIdsRef.current.add(font.id)
        await loadFontWeights(font.name)
        resolve()
      }

      const onError = () => {
        cleanup()
        pendingLoadsRef.current.delete(font.id)
        reject(new Error(`Failed to load font stylesheet for ${font.name}`))
      }

      link.addEventListener("load", onLoad)
      link.addEventListener("error", onError)

      if (!existingLink) {
        document.head.append(link)
      }
    })

    pendingLoadsRef.current.set(font.id, loadPromise)
    await loadPromise
  }, [])

  return { loadFont }
}
