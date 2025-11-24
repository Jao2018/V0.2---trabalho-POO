import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Product } from "@/lib/types"
import { verifyToken } from "@/lib/auth"

function getToken(request: NextRequest): string | undefined {
  // Try cookie first
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) return cookieToken

  // Try Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    console.log("[v0] GET /api/products - Token present:", !!token)

    if (!token) {
      console.log("[v0] No token found in request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    console.log("[v0] Token verification result:", user ? `User: ${user.email}` : "Failed")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await query<Product>("SELECT * FROM products ORDER BY name ASC")
    console.log("[v0] Products fetched from DB:", products.length)
    return NextResponse.json(products)
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/products called")
    const token = getToken(request)
    console.log("[v0] Auth token present:", !!token)

    const user = await verifyToken(token || "")
    console.log("[v0] Verified user:", user)

    if (!user || user.role !== "manager") {
      console.log("[v0] Authorization failed - user role:", user?.role)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { sku, name, category_id, barcode, description, image_url } = body

    console.log("[v0] Executing INSERT query...")
    const products = await query<Product>(
      `INSERT INTO products (sku, name, category_id, barcode, description, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [sku, name, category_id, barcode, description, image_url],
    )

    console.log("[v0] Product created successfully:", products[0])
    return NextResponse.json(products[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
