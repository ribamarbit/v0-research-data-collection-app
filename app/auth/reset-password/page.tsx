"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Check, X } from "lucide-react"
import { sanitizeInput } from "@/lib/security/sanitize"
import { logAudit } from "@/lib/security/audit-log"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasValidToken, setHasValidToken] = useState(true)
  const router = useRouter()

  // Validação de requisitos da senha
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    const checkToken = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setHasValidToken(false)
        setError("Link de recuperação inválido ou expirado. Solicite um novo link.")
      }
    }

    checkToken()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const cleanPassword = sanitizeInput(password)
      const cleanConfirmPassword = sanitizeInput(confirmPassword)

      // Validação manual
      if (!isPasswordValid) {
        throw new Error("A senha não atende aos requisitos de segurança")
      }

      if (cleanPassword !== cleanConfirmPassword) {
        throw new Error("As senhas não coincidem")
      }

      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: cleanPassword,
      })

      if (updateError) throw updateError

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        logAudit({
          user_id: user.id,
          action: "password_reset",
          resource_type: "auth",
          details: { method: "email_recovery" },
        })
      }

      setSuccess(true)

      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao redefinir a senha")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-gray-500"}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </div>
  )

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Redefinir Senha</CardTitle>
            <CardDescription>Digite sua nova senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || !hasValidToken}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Requisitos da senha */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                      <RequirementItem met={passwordRequirements.minLength} text="Mínimo 6 caracteres" />
                      <RequirementItem met={passwordRequirements.hasUppercase} text="Uma letra maiúscula" />
                      <RequirementItem met={passwordRequirements.hasLowercase} text="Uma letra minúscula" />
                      <RequirementItem met={passwordRequirements.hasNumber} text="Um número" />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading || !hasValidToken}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Indicador de senhas coincidentes */}
                  {confirmPassword.length > 0 && (
                    <div
                      className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                    >
                      {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {passwordsMatch ? "Senhas coincidem" : "Senhas não coincidem"}
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Senha redefinida com sucesso! Redirecionando para o login...
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || success || !hasValidToken || !isPasswordValid || !passwordsMatch}
                >
                  {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:underline">
                  Solicitar novo link de recuperação
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                <Link href="/auth/login" className="text-gray-500 hover:underline">
                  Voltar para login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
