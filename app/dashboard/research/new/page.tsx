"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { researchSchema } from "@/lib/validations/research"
import { offlineStorage } from "@/lib/offline/storage"
import Link from "next/link"
import { sanitizeString } from "@/lib/security/sanitize"
import { logDataModification } from "@/lib/security/audit-log"

export default function NewResearchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    research_type: "academic" as const,
    status: "active" as const,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const sanitizedData = {
        title: sanitizeString(formData.title),
        description: sanitizeString(formData.description),
        research_type: formData.research_type,
        status: formData.status,
      }

      const validatedData = researchSchema.parse(sanitizedData)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Verificar se é modo demo
      const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_user')
      
      if (!user && !isDemoMode) throw new Error("Usuário não autenticado")
      
      // No modo demo, usar ID fictício
      const userId = user?.id || 'demo-user-id'

      const newResearch = {
        ...validatedData,
        user_id: userId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Tentar salvar online
      if (navigator.onLine) {
        const { error: dbError } = await supabase.from("research").insert(newResearch)

        if (dbError) throw dbError

        logDataModification(userId, "research", newResearch.id, "CREATE")
      } else {
        // Salvar offline e adicionar à fila de sincronização
        await offlineStorage.init()
        await offlineStorage.saveResearch(newResearch)
        await offlineStorage.addToSyncQueue({
          type: "research",
          action: "create",
          data: newResearch,
          timestamp: Date.now(),
        })
      }

      // Também salvar localmente para acesso offline
      await offlineStorage.init()
      await offlineStorage.saveResearch(newResearch)

      router.push("/dashboard/research")
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao criar a pesquisa")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/research">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nova Pesquisa</h1>
          <p className="text-slate-600">Crie uma nova pesquisa científica</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Análise do Comportamento de Dados em IA"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente o objetivo desta pesquisa..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="research_type">Tipo de Pesquisa *</Label>
              <Select
                value={formData.research_type}
                onValueChange={(value) => handleChange("research_type", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="research_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Acadêmica</SelectItem>
                  <SelectItem value="scientific">Científica</SelectItem>
                  <SelectItem value="article">Artigo</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="archived">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!navigator.onLine && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Você está offline. A pesquisa será salva localmente e sincronizada quando você estiver online.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Criar Pesquisa"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
