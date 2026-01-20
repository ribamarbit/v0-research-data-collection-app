import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Database, Calendar, FileText } from 'lucide-react';

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Valores padrão para modo demo
  let research: any = null;
  let dataCount = 0;

  // Só buscar dados se houver usuário autenticado (não demo)
  if (user?.id) {
    // Buscar pesquisa
    const { data, error } = await supabase
      .from("research")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      notFound();
    }
    
    research = data;

    // Contar dados coletados
    const { count } = await supabase
      .from("data_collection")
      .select("*", { count: "exact", head: true })
      .eq("research_id", id);
    
    dataCount = count || 0;
  } else {
    // No modo demo, mostrar dados de exemplo
    research = {
      id: id,
      title: "Pesquisa de Demonstração",
      description: "Esta é uma pesquisa de exemplo no modo demonstração. Faça login com uma conta real para ver suas pesquisas.",
      research_type: "academic",
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/research">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {research.title}
            </h1>
            <Badge
              variant="outline"
              className={
                research.status === "active"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : research.status === "completed"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }
            >
              {research.status === "active"
                ? "Ativa"
                : research.status === "completed"
                ? "Concluída"
                : "Arquivada"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Informações da Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Pesquisa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {research.description && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                Descrição
              </h3>
              <p className="text-sm text-slate-600">{research.description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                Tipo de Pesquisa
              </h3>
              <p className="text-sm capitalize text-slate-600">
                {research.research_type?.replace("_", " ") || "Não especificado"}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                Data de Criação
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                {new Date(research.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                Dados Coletados
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Database className="h-4 w-4" />
                {dataCount || 0} registro{dataCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/dashboard/data-collection?research=${id}`}>
              <Database className="mr-2 h-4 w-4" />
              Coletar Dados
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/research/${id}/data`}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Dados Coletados
            </Link>
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Editar Pesquisa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
