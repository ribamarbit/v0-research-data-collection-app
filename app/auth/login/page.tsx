"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { loginSchema } from "@/lib/validations/auth"
import { AlertCircle, Eye, EyeOff, User } from "lucide-react"
import { sanitizeEmail } from "@/lib/security/sanitize"
import { logLoginAttempt } from "@/lib/security/audit-log"

const DEMO_USER = {
  email: "demo@pesquisa.com",
  password: "Demo@123",
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    setError(null)

    // Salva no localStorage que é um usuário demo
    localStorage.setItem(
      "demo_user",
      JSON.stringify({
        id: "demo-user-id",
        email: DEMO_USER.email,
        full_name: "Usuário Demonstração",
        institution: "Universidade Demo",
        isDemo: true,
      }),
    )

    // Pequeno delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 500))

    router.push("/dashboard")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (attempts >= 5) {
      setError("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sanitizedEmail = sanitizeEmail(email)
      const validatedData = loginSchema.parse({ email: sanitizedEmail, password })

      if (validatedData.email === DEMO_USER.email && validatedData.password === DEMO_USER.password) {
        localStorage.setItem(
          "demo_user",
          JSON.stringify({
            id: "demo-user-id",
            email: DEMO_USER.email,
            full_name: "Usuário Demonstração",
            institution: "Universidade Demo",
            isDemo: true,
          }),
        )
        router.push("/dashboard")
        return
      }

      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      })

      if (error) throw error

      // Remove demo user se existir
      localStorage.removeItem("demo_user")

      logLoginAttempt(validatedData.email, true)

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setAttempts((prev) => prev + 1)

      if (error instanceof Error) {
        logLoginAttempt(email, false)

        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("Invalid") ||
          error.message.includes("credentials")
        ) {
          setError("Email e/ou senha incorretos")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login")
        } else if (error.message.includes("Failed to fetch") || error.message.includes("network")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else {
          setError("Email e/ou senha incorretos")
        }
      } else {
        setError("Email e/ou senha incorretos")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-balance text-2xl font-bold text-slate-900 dark:text-white">
            Sistema de Pesquisa Científica
          </h1>
          <p className="mt-2 text-pretty text-sm text-slate-600 dark:text-slate-400">
            Gerencie suas pesquisas e colete dados com segurança
          </p>
        </div>

        <Card className="shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl dark:text-white">Entrar na Conta</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Digite seu email e senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="dark:text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isDemoLoading}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="dark:text-slate-200">
                      Senha
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isDemoLoading}
                      className="pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isDemoLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 bg-transparent"
                  onClick={handleDemoLogin}
                  disabled={isLoading || isDemoLoading}
                >
                  <User className="mr-2 h-4 w-4" />
                  {isDemoLoading ? "Entrando..." : "Entrar como Demonstração"}
                </Button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Use o modo demonstração para explorar o sistema sem criar conta
                </p>
              </div>
              <div className="mt-6 text-center text-sm dark:text-slate-300">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Criar conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
