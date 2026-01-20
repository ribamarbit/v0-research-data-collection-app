"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { offlineStorage } from "@/lib/offline/storage"
import Link from "next/link"
import type { Research, FieldType } from "@/lib/types/database"
import { sanitizeString } from "@/lib/security/sanitize"
import { logDataModification } from "@/lib/security/audit-log"

interface DataField {
  id: string
  field_name: string
  field_type: FieldType
  field_value: string
}

export default function DataCollectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const researchId = searchParams.get("research")

  const [research, setResearch] = useState<Research | null>(null)
  const [fields, setFields] = useState<DataField[]>([
    {
      id: crypto.randomUUID(),
      field_name: "",
      field_type: "text",
      field_value: "",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (researchId) {
      loadResearch()
    }
  }, [researchId])

  const loadResearch = async () => {
    if (!researchId) return

    const supabase = createClient()
    const { data } = await supabase.from("research").select("*").eq("id", researchId).single()

    if (data) {
      setResearch(data)
    }
  }

  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        field_name: "",
        field_type: "text",
        field_value: "",
      },
    ])
  }

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter((f) => f.id !== id))
    }
  }

  const updateField = (id: string, key: keyof DataField, value: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value as FieldType } : f)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!researchId) {
        throw new Error("Selecione uma pesquisa")
      }

      const sanitizedFields = fields.map((field) => ({
        ...field,
        field_name: sanitizeString(field.field_name),
        field_value: sanitizeString(field.field_value),
      }))

      const emptyFields = sanitizedFields.filter((f) => !f.field_name.trim())
      if (emptyFields.length > 0) {
        throw new Error("Preencha o nome de todos os campos")
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Verificar se é modo demo
      const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_user')
      
      if (!user && !isDemoMode) throw new Error("Usuário não autenticado")
      
      // No modo demo, usar ID fictício
      const userId = user?.id || 'demo-user-id'

      const dataToSave = sanitizedFields.map((field) => ({
        id: crypto.randomUUID(),
        research_id: researchId,
        user_id: userId,
        field_name: field.field_name,
        field_type: field.field_type,
        field_value: field.field_value,
        metadata: {},
        collected_at: new Date().toISOString(),
        is_synced: navigator.onLine,
      }))

      if (navigator.onLine) {
        const { error: dbError } = await supabase.from("data_collection").insert(dataToSave)

        if (dbError) throw dbError

        logDataModification(userId, "data_collection", researchId, "CREATE")
      }

      await offlineStorage.init()
      for (const data of dataToSave) {
        await offlineStorage.saveDataCollection(data)

        if (!navigator.onLine) {
          await offlineStorage.addToSyncQueue({
            type: "data_collection",
            action: "create",
            data,
            timestamp: Date.now(),
          })
        }
      }

      setSuccess(true)

      setTimeout(() => {
        setFields([
          {
            id: crypto.randomUUID(),
            field_name: "",
            field_type: "text",
            field_value: "",
          },
        ])
        setSuccess(false)
      }, 2000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocorreu um erro ao salvar os dados")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Coleta de Dados</h1>
          <p className="text-slate-600">
            {research ? `Coletando dados para: ${research.title}` : "Selecione uma pesquisa e colete dados"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Coleta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!researchId && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Você não selecionou uma pesquisa.{" "}
                  <Link href="/dashboard/research" className="font-medium underline">
                    Escolha uma pesquisa
                  </Link>{" "}
                  para começar a coleta de dados.
                </AlertDescription>
              </Alert>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700">Campo {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${field.id}`}>Nome do Campo *</Label>
                    <Input
                      id={`name-${field.id}`}
                      placeholder="Ex: Temperatura, Idade, Nome"
                      value={field.field_name}
                      onChange={(e) => updateField(field.id, "field_name", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`type-${field.id}`}>Tipo de Dado *</Label>
                    <Select
                      value={field.field_type}
                      onValueChange={(value) => updateField(field.id, "field_type", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id={`type-${field.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="boolean">Sim/Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`value-${field.id}`}>Valor</Label>
                  {field.field_type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`value-${field.id}`}
                        checked={field.field_value === "true"}
                        onCheckedChange={(checked) => updateField(field.id, "field_value", checked ? "true" : "false")}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`value-${field.id}`} className="text-sm font-normal">
                        Sim
                      </Label>
                    </div>
                  ) : (
                    <Input
                      id={`value-${field.id}`}
                      type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                      placeholder="Digite o valor coletado"
                      value={field.field_value}
                      onChange={(e) => updateField(field.id, "field_value", e.target.value)}
                      disabled={isLoading}
                    />
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addField}
              className="w-full bg-transparent"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Campo
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Dados salvos com sucesso!</AlertDescription>
              </Alert>
            )}

            {!navigator.onLine && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Você está offline. Os dados serão salvos localmente e sincronizados quando você estiver online.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !researchId}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Dados"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Voltar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
