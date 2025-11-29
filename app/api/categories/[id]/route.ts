import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Category } from "@/lib/types"
import { verifyToken } from "@/lib/auth"

function getToken(request: NextRequest): string | undefined {
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return undefined
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = getToken(request)
    const user = await verifyToken(token || "")

    if (!user || !["manager", "evaluator", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const categories = await query<Category>(
      "UPDATE categories SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *",
      [name, description || null, color || null, id],
    )

    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(categories[0])
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = getToken(request)
    const user = await verifyToken(token || "")

    if (!user || !["manager", "evaluator", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await query("DELETE FROM categories WHERE id = $1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar categoria:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
