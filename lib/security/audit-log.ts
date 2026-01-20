// Sistema de auditoria para rastrear ações sensíveis
interface AuditLogEntry {
  timestamp: Date
  userId: string | null
  action: string
  resource: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

class AuditLogger {
  private logs: AuditLogEntry[] = []
  private maxLogs = 1000

  log(entry: Omit<AuditLogEntry, "timestamp">): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    }

    this.logs.push(logEntry)

    // Manter apenas os últimos N logs em memória
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Em produção, enviar para servidor ou serviço de logging
    if (process.env.NODE_ENV === "production") {
      this.sendToServer(logEntry)
    }
  }

  private async sendToServer(entry: AuditLogEntry): Promise<void> {
    try {
      // Implementar envio para backend/serviço de logging
      console.log("[AUDIT]", entry)
    } catch (error) {
      console.error("Erro ao enviar log de auditoria:", error)
    }
  }

  getRecentLogs(limit = 50): AuditLogEntry[] {
    return this.logs.slice(-limit)
  }
}

export const auditLogger = new AuditLogger()

// Funções auxiliares para ações específicas
export function logLoginAttempt(email: string, success: boolean, ip?: string): void {
  auditLogger.log({
    userId: success ? email : null,
    action: success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
    resource: "auth",
    details: { email },
    ip,
  })
}

export function logLogout(userId: string): void {
  auditLogger.log({
    userId,
    action: "LOGOUT",
    resource: "auth",
  })
}

export function logDataAccess(userId: string, resourceType: string, resourceId: string): void {
  auditLogger.log({
    userId,
    action: "DATA_ACCESS",
    resource: resourceType,
    details: { resourceId },
  })
}

export function logDataModification(
  userId: string,
  resourceType: string,
  resourceId: string,
  operation: "CREATE" | "UPDATE" | "DELETE",
): void {
  auditLogger.log({
    userId,
    action: `DATA_${operation}`,
    resource: resourceType,
    details: { resourceId },
  })
}

export function logAudit(params: {
  user_id: string
  action: string
  resource_type: string
  details?: Record<string, unknown>
}): void {
  auditLogger.log({
    userId: params.user_id,
    action: params.action.toUpperCase(),
    resource: params.resource_type,
    details: params.details,
  })
}
