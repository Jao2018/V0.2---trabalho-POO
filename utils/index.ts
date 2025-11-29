/**
 * Cria uma URL de página para navegação React Router
 * Converte nomes de páginas para caminhos de rota
 */
export function createPageUrl(pageName: string): string {
  if (!pageName) return "/"

  // Lidar com parâmetros de consulta
  if (pageName.includes("?")) {
    const [page, query] = pageName.split("?")
    const encodedQuery = new URLSearchParams(query).toString()
    return `/${page.toLowerCase()}?${encodedQuery}`
  }

  // Mapear nomes de páginas para rotas
  const pageRoutes: Record<string, string> = {
    Home: "/home",
    Products: "/products",
    ProductDetail: "/product-detail",
    Evaluations: "/evaluations",
    Reports: "/reports",
    Settings: "/settings",
  }

  return pageRoutes[pageName] || `/${pageName.toLowerCase()}`
}

/**
 * Analisar parâmetros de consulta da URL
 */
export function getQueryParams(): Record<string, string> {
  if (typeof window === "undefined") return {}

  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

/**
 * Obter um valor específico de parâmetro de consulta
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(key)
}
