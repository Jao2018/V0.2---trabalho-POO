import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

function getToken(request: NextRequest): string | undefined {
  // Tentar cookie primeiro
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) return cookieToken

  // Tentar header Authorization
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query("SELECT * FROM criteria ORDER BY category_id, name ASC")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching criteria:", error)
    return NextResponse.json({ error: "Failed to fetch criteria" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { category_id, name, weight = 1, max_score = 5 } = body

    if (!category_id || !name) {
      return NextResponse.json({ error: "Missing required fields: category_id, name" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO criteria (category_id, name, weight, max_score) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [category_id, name, weight, max_score],
    )

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating criterion:", error)
    return NextResponse.json({ error: "Failed to create criterion" }, { status: 500 })
  }
}
