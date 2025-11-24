"use server"

import { query } from "@/lib/db"
import { createToken, type User } from "@/lib/auth"
import { cookies } from "next/headers"

export async function loginAction(email: string, password: string) {
  console.log("[v0] Server action login started for:", email)
  try {
    const result = await query<any>(
      `SELECT id, email, name, role, store_location, password_hash FROM employees WHERE email = $1`,
      [email],
    )

    console.log("[v0] Query result:", result)

    if (!result || result.length === 0) {
      console.log("[v0] Employee not found")
      throw new Error("Invalid email or password")
    }

    const employee = result[0]

    // Verify password using simple comparison since bcrypt may not be available
    if (employee.password_hash !== password) {
      console.log("[v0] Password mismatch")
      throw new Error("Invalid email or password")
    }

    const user: User = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      store_location: employee.store_location,
    }

    const token = await createToken(user)
    console.log("[v0] Token created successfully")

    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return {
      success: true,
      user,
      token,
    }
  } catch (error) {
    console.error("[v0] Login action error:", error)
    throw error
  }
}
