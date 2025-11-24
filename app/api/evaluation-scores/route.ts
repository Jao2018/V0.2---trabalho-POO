import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = await verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scores = await query<any>("SELECT * FROM evaluation_scores ORDER BY id ASC")
    return NextResponse.json(scores)
  } catch (error) {
    console.error("Error fetching evaluation scores:", error)
    return NextResponse.json({ error: "Failed to fetch evaluation scores" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = await verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { evaluation_id, criteria_id, score, comment } = await request.json()

    const scores = await query<any>(
      `INSERT INTO evaluation_scores (evaluation_id, criteria_id, score, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [evaluation_id, criteria_id, score, comment],
    )

    return NextResponse.json(scores[0], { status: 201 })
  } catch (error) {
    console.error("Error creating evaluation score:", error)
    return NextResponse.json({ error: "Failed to create evaluation score" }, { status: 500 })
  }
}
