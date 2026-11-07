export type FontDefinition = {
  id: string
  name: string
  slug?: string
  category: string
  variable: boolean
  weights: number[]
  tags: string[]
  google_url: string
  popularity_rank?: number
  updated_at?: string
}

export type FontMerged = {
  id: string | number
  name: string
  slug: string
  font_json: unknown
  tags_json: unknown
  pairings_json: unknown
  pair_font_ids_json: unknown
  updated_at: string
}

const monoFallback =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
const serifFallback = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
const sansFallback =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export function getFontFamily(font: FontDefinition) {
  if (font.category === "monospace" || font.tags.includes("code")) {
    return `"${font.name}", ${monoFallback}`
  }

  if (font.category === "serif") {
    return `"${font.name}", ${serifFallback}`
  }

  return `"${font.name}", ${sansFallback}`
}
