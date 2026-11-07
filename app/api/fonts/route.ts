import { env } from "cloudflare:workers"

export const dynamic = "force-dynamic"

type FontRow = {
  id: number | string
  name: string
  slug: string
  font_json: string | null
  tags_json: string | null
  updated_at: string
}

function parseJson(value: string | null): unknown {
  if (!value) return null
  try { return JSON.parse(value) } catch { return null }
}

export async function GET() {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, slug, font_json, tags_json, updated_at FROM fonts_merged ORDER BY name ASC"
    ).all<FontRow>()
    const fonts = results.map((row) => {
      const data = parseJson(row.font_json)
      const source = data && typeof data === "object" && !Array.isArray(data) ? data : {}
      const font = source as Record<string, unknown>
      return { id: row.id, name: row.name, slug: row.slug, updated_at: row.updated_at,
        tags_json: parseJson(row.tags_json),
        font_json: { technical: font.technical, meta: font.meta } }
    })
    return Response.json({ count: fonts.length, fonts }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    })
  } catch (error) {
    console.error("Catalog read failed", error)
    return Response.json({ error: "Unable to load fonts" }, { status: 500 })
  }
}
