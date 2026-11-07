import { env } from "cloudflare:workers"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-z0-9_-]{1,200}$/i.test(id)) return Response.json({ error: "Invalid font ID" }, { status: 400 })

  try {
    const result = await env.DB.prepare("DELETE FROM fonts_merged WHERE id = ?").bind(id).run()
    if (!result.meta.changes) return Response.json({ error: "Font not found" }, { status: 404 })
    return Response.json({ deleted: true, id }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Font deletion failed", error)
    return Response.json({ error: "Unable to delete font" }, { status: 500 })
  }
}
