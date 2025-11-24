import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test GET route called")
  return NextResponse.json({ message: "Test route works!" })
}

export async function POST() {
  console.log("[v0] Test POST route called")
  return NextResponse.json({ message: "Test POST route works!" })
}
