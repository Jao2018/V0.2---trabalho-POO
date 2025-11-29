const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  role: "operator" | "manager" | "admin" | "evaluator"
  store_location: string
}

// Helper function to convert string to base64url
function base64url(input: string | ArrayBuffer): string {
  let binary: string
  if (input instanceof ArrayBuffer) {
    binary = String.fromCharCode(...new Uint8Array(input))
  } else {
    binary = input
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlToBytes(input: string): Uint8Array {
  // Convert base64url to base64
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  // Add padding
  const padding = (4 - (base64.length % 4)) % 4
  base64 += "=".repeat(padding)

  // Decode base64 to binary string
  const binaryString = atob(base64)
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

function base64urlDecode(input: string): string {
  const bytes = base64urlToBytes(input)
  return new TextDecoder().decode(bytes)
}

export async function createToken(user: User): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))

  const now = Math.floor(Date.now() / 1000)
  const payload = base64url(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      store_location: user.store_location,
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days
    }),
  )

  const message = `${header}.${payload}`

  // Use Web Crypto API
  const encoder = new TextEncoder()
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(message))
  const signatureString = base64url(signature)

  return `${message}.${signatureString}`
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const [header, payload, signature] = token.split(".")
    if (!header || !payload || !signature) {
      return null
    }

    const message = `${header}.${payload}`
    const encoder = new TextEncoder()

    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const signatureBytes = base64urlToBytes(signature)

    // Use verify to check the signature
    const isValid = await crypto.subtle.verify("HMAC", secretKey, signatureBytes, encoder.encode(message))

    if (!isValid) {
      return null
    }

    const decodedPayload = JSON.parse(base64urlDecode(payload))

    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp < now) {
      return null
    }

    return decodedPayload as User
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function verifyRole(token: string, allowedRoles: string[]): Promise<boolean> {
  const user = await verifyToken(token)
  return user ? allowedRoles.includes(user.role) : false
}
