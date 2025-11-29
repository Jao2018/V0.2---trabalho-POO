// Cliente API Base44 para Product Classification PWA
// Esta é uma implementação mock - substituir com o SDK Base44 real quando disponível

interface AuthResponse {
  user: {
    id: string
    email: string
    role: "operator" | "manager" | "admin"
  }
  token: string
}

interface User {
  id: string
  email: string
  role: "operator" | "manager" | "admin"
}

class Base44Client {
  private apiUrl: string
  private token: string | null = null

  constructor(apiUrl: string = process.env.NEXT_PUBLIC_BASE44_API_URL || "") {
    this.apiUrl = apiUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("base44_token")
    }
  }

  private saveToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("base44_token", token)
    }
  }

  auth = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      // Implementação mock - substituir com chamada API real
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error("Login failed")

      const data = await response.json()
      this.saveToken(data.token)
      return data
    },

    logout: async (): Promise<void> => {
      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("base44_token")
      }
    },

    me: async (): Promise<User> => {
      if (!this.token) throw new Error("Not authenticated")

      const response = await fetch(`${this.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch user")

      return response.json()
    },
  }
}

// Exportar instância singleton
export const base44 = new Base44Client()
