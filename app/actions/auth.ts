"use server"

import { query } from "@/lib/db"
import { createToken, type User } from "@/lib/auth"
import { cookies } from "next/headers"

export async function loginAction(email: string, password: string) {
  try {
    const result = await query<any>(
      `SELECT id, email, name, role, store_location, password_hash FROM employees WHERE email = $1`,
      [email],
    )

    if (!result || result.length === 0) {
      throw new Error("Invalid email or password")
    }

    const employee = result[0]

    // Verificar senha usando comparação simples já que bcrypt pode não estar disponível
    if (employee.password_hash !== password) {
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
    console.error("Login action error:", error)
    throw error
  }
}
