import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Database, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PWAInstall } from "@/components/pwa/pwa-install"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Valores padrão para modo demo ou quando não há usuário
  let researchCount = 0
  let activeResearchCount = 0
  let dataCount = 0
  let recentResearch: any[] = []

  // Só buscar dados se houver usuário autenticado (não demo)
  if (user?.id) {
    // Buscar estatísticas
    const { count: rc } = await supabase
      .from("research")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
    researchCount = rc || 0

    const { count: arc } = await supabase
      .from("research")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active")
    activeResearchCount = arc || 0

    const { count: dc } = await supabase
      .from("data_collection")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
    dataCount = dc || 0

    // Buscar pesquisas recentes
    const { data: rr } = await supabase
      .from("research")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
    recentResearch = rr || []
  }

  const stats = [
    {
      title: "Total de Pesquisas",
      value: researchCount || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pesquisas Ativas",
      value: activeResearchCount || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Dados Coletados",
      value: dataCount || 0,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">
      <PWAInstall />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Bem-vindo de volta! Aqui está um resumo das suas pesquisas.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/research/new">
              <FileText className="mr-2 h-4 w-4" />
              Nova Pesquisa
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/data-collection">
              <Database className="mr-2 h-4 w-4" />
              Coletar Dados
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reports">
              <TrendingUp className="mr-2 h-4 w-4" />
              Ver Relatórios
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pesquisas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResearch && recentResearch.length > 0 ? (
            <div className="space-y-3">
              {recentResearch.map((research) => (
                <Link
                  key={research.id}
                  href={`/dashboard/research/${research.id}/details`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{research.title}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(research.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      research.status === "active"
                        ? "bg-green-100 text-green-700"
                        : research.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {research.status === "active"
                      ? "Ativa"
                      : research.status === "completed"
                        ? "Concluída"
                        : "Arquivada"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-600">Você ainda não tem pesquisas.</p>
              <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/research/new">Criar Primeira Pesquisa</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
