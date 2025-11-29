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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await query<Product>("SELECT * FROM products ORDER BY name ASC")
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)

    const user = await verifyToken(token || "")

    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()

    const { sku, name, category_id, barcode, description, image_url } = body

    const products = await query<Product>(
      `INSERT INTO products (sku, name, category_id, barcode, description, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [sku, name, category_id, barcode, description, image_url],
    )

    return NextResponse.json(products[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
