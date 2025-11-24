/**
 * Creates a page URL for React Router navigation
 * Converts page names to route paths
 */
export function createPageUrl(pageName: string): string {
  if (!pageName) return "/"

  // Handle query parameters
  if (pageName.includes("?")) {
    const [page, query] = pageName.split("?")
    const encodedQuery = new URLSearchParams(query).toString()
    return `/${page.toLowerCase()}?${encodedQuery}`
  }

  // Map page names to routes
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
 * Parse query parameters from URL
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
 * Get a specific query parameter value
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(key)
}
