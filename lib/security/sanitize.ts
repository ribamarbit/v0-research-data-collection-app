// Sanitização de dados para prevenir XSS e injeção
export function sanitizeString(str: string): string {
  if (!str) return ""

  return str
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers (onclick=, onload=, etc)
    .trim()
}

// Sanitizar objeto inteiro recursivamente
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    const value = sanitized[key]

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>]
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>]
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeString(item) : item)) as T[Extract<
        keyof T,
        string
      >]
    }
  }

  return sanitized
}

// Validar e sanitizar email
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Escapar HTML para exibição segura
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Validar URL para prevenir open redirects
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    // Só permite URLs do mesmo domínio
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}

// Validar UUID v4 (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const sanitizeInput = sanitizeString
