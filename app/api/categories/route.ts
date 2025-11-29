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

export async function GET(request: NextRequest) {
  try {
    const categories = await query<Category>("SELECT * FROM categories ORDER BY name ASC")
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    const user = await verifyToken(token || "")

    // Allow managers, evaluators, and admin to create categories
    if (!user || !["manager", "evaluator", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const categories = await query<Category>("INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *", [
      name,
      description || null,
    ])

    return NextResponse.json(categories[0], { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
