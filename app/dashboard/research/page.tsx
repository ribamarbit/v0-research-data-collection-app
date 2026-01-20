import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus, Clock, Filter } from 'lucide-react';
import { SyncStatus } from "@/components/offline/sync-status";

export default async function ResearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Valores padrão para modo demo
  let research: any[] = [];

  // Só buscar dados se houver usuário autenticado (não demo)
  if (user?.id) {
    const { data } = await supabase
      .from("research")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    research = data || [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Minhas Pesquisas
          </h1>
          <p className="text-slate-600">
            Gerencie todas as suas pesquisas científicas
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/research/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Pesquisa
          </Link>
        </Button>
      </div>

      {/* Status de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <SyncStatus />
        </CardContent>
      </Card>

      {/* Lista de Pesquisas */}
      <div>
        {research && research.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {research.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/research/${item.id}/details`}
                className="group"
              >
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-600 transition-colors">
                        <FileText className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : item.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status === "active"
                          ? "Ativa"
                          : item.status === "completed"
                          ? "Concluída"
                          : "Arquivada"}
                      </span>
                    </div>
                    <CardTitle className="mt-4 line-clamp-2 text-lg">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      Criada em{" "}
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    {item.research_type && (
                      <div className="mt-2 text-xs text-slate-500">
                        Tipo: {item.research_type}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Nenhuma pesquisa encontrada
              </h3>
              <p className="mb-6 text-center text-sm text-slate-600">
                Comece criando sua primeira pesquisa científica
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/research/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Pesquisa
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
