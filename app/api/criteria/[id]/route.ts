import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth_token")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query("DELETE FROM criteria WHERE id = $1 RETURNING *", [id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Criterion not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error deleting criterion:", error)
    return NextResponse.json({ error: "Failed to delete criterion" }, { status: 500 })
  }
}
