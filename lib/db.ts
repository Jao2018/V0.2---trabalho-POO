import { neon } from "@neondatabase/serverless"

let sql: any

// Initialize database connection only when needed
async function initializeDatabase() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sql = neon(databaseUrl)
  }
  return sql
}

export { initializeDatabase, sql as getSql }

// Helper function for querying with parametrized queries
export async function query<T>(text: string, values?: (string | number | boolean | null)[]): Promise<T[]> {
  try {
    const sqlClient = await initializeDatabase()

    console.log("[v0] Executing query:", text)
    console.log("[v0] With values:", values)

    let result: any

    if (values && values.length > 0) {
      // For queries with parameters, use sql.query()
      result = await sqlClient.query(text, values)
    } else {
      // For queries without parameters, use tagged template literal
      result = await sqlClient`${sqlClient.unsafe(text)}`
    }

    console.log("[v0] Raw database result:", result)

    // Handle different response formats from Neon
    if (Array.isArray(result)) {
      return result as T[]
    } else if (result && Array.isArray(result.rows)) {
      return result.rows as T[]
    } else if (result && typeof result === "object") {
      return [result] as T[]
    }

    return [] as T[]
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}
