import { useCallback, useEffect, useState } from "react"

import type { FontDefinition, FontMerged } from "@/data/fonts"

const API = import.meta.env.VITE_FONTS_API_URL ?? "https://api.funts.amans.place"

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => String(item))
}

function makeGoogleFontUrl(fontName: string) {
  const family = fontName.trim().replace(/\s+/g, "+")
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`
}

function getNestedRecord(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const nested = (value as Record<string, unknown>)[key]
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return null
  }

  return nested as Record<string, unknown>
}

function getNestedString(value: unknown, keys: string[]) {
  let current: unknown = value

  for (const key of keys) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return null
    }

    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === "string" ? current : null
}

function toWeights(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const weights = value.map((item) => Number(item)).filter(Number.isFinite)
  return Array.from(new Set(weights)).sort((a, b) => a - b)
}

function parseFont(value: unknown): FontDefinition | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const item = value as Record<string, unknown>
  const id =
    typeof item.id === "string" || typeof item.id === "number" ? String(item.id) : null
  const name = typeof item.name === "string" ? item.name : null

  if (!id || !name) {
    return null
  }

  const row = item as FontMerged
  const tags = toStringArray(row.tags_json)
  const technical = getNestedRecord(row.font_json, "technical")
  const meta = getNestedRecord(row.font_json, "meta")
  const cssUrl = getNestedString(row.font_json, ["meta", "google_css_url"])
  const weights = technical ? toWeights(technical.weights) : []
  const category =
    (typeof technical?.category === "string" ? technical.category : null) ??
    tags.find((tag) => ["serif", "sans-serif", "display", "monospace"].includes(tag)) ??
    "sans-serif"

  return {
    id,
    name,
    slug: typeof item.slug === "string" ? item.slug : undefined,
    category,
    variable: Boolean(technical?.variable),
    weights: weights.length > 0 ? weights : [400],
    tags,
    google_url: cssUrl ?? makeGoogleFontUrl(name),
    popularity_rank:
      typeof meta?.popularity_rank === "number" ? meta.popularity_rank : undefined,
    updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
  }
}

export function useFonts() {
  const [registry, setRegistry] = useState<FontDefinition[]>([])
  const [cursor, setCursor] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = cursor >= 0 && cursor < registry.length ? registry[cursor] : null

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`${API}/api/fonts`, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const payload = (await response.json()) as unknown
        const rows =
          payload && typeof payload === "object" && !Array.isArray(payload)
            ? (payload as { fonts?: unknown }).fonts
            : null
        const fonts = Array.isArray(rows)
          ? (rows.map(parseFont).filter(Boolean) as FontDefinition[])
          : []
        const sortedFonts = fonts.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        )

        setRegistry(sortedFonts)
        if (sortedFonts.length > 0) {
          setCursor(0)
        } else {
          setCursor(-1)
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error ? fetchError.message : "Unable to load fonts"
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      controller.abort()
    }
  }, [])

  const nextFont = useCallback(() => {
    if (!registry.length) {
      return
    }

    setCursor((currentCursor) => (currentCursor + 1) % registry.length)
  }, [registry.length])

  const previousFont = useCallback(() => {
    if (!registry.length) {
      return
    }

    setCursor((currentCursor) => {
      if (currentCursor <= 0) {
        return registry.length - 1
      }

      return currentCursor - 1
    })
  }, [registry.length])

  const deleteCurrent = useCallback(async () => {
    if (!current || isDeleting) {
      return
    }

    const deletedFontId = current.id
    const deletedCursor = cursor

    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`${API}/api/fonts/${deletedFontId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      setRegistry((currentRegistry) => {
        const nextRegistry = currentRegistry.filter((font) => font.id !== deletedFontId)
        setCursor(nextRegistry.length === 0 ? -1 : Math.min(deletedCursor, nextRegistry.length - 1))
        return nextRegistry
      })
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete font"
      )
    } finally {
      setIsDeleting(false)
    }
  }, [current, cursor, isDeleting])

  return {
    current,
    deleteCurrent,
    nextFont,
    previousFont,
    total: registry.length,
    isDeleting,
    isLoading,
    error,
  }
}
