import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
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
    const token = getToken(request)
    const user = await verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let evaluations
    if (user.role === "operator") {
      evaluations = await query<any>(
        `SELECT e.*, p.name as product_name FROM evaluations e
         JOIN products p ON e.product_id = p.id
         WHERE e.employee_id = $1 
         ORDER BY e.evaluation_date DESC`,
        [user.id],
      )
    } else {
      evaluations = await query<any>(
        `SELECT e.*, p.name as product_name FROM evaluations e
         JOIN products p ON e.product_id = p.id
         ORDER BY e.evaluation_date DESC`,
      )
    }

    return NextResponse.json(evaluations)
  } catch (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    const user = await verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id, employee_id, evaluation_date, store_location, notes, status } = await request.json()

    const evaluations = await query<any>(
      `INSERT INTO evaluations (product_id, employee_id, evaluation_date, store_location, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [product_id, employee_id || user.id, evaluation_date, store_location, notes, status || "completed"],
    )

    return NextResponse.json(evaluations[0], { status: 201 })
  } catch (error) {
    console.error("Error creating evaluation:", error)
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 })
  }
}
