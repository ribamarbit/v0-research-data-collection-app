import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Database, Calendar, FileDown } from 'lucide-react';

export default async function ResearchDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Buscar pesquisa
  const { data: research, error } = await supabase
    .from("research")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !research) {
    notFound();
  }

  // Buscar dados coletados
  const { data: collectedData } = await supabase
    .from("data_collection")
    .select("*")
    .eq("research_id", id)
    .order("collected_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/research/${id}/details`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dados Coletados
          </h1>
          <p className="text-slate-600">{research.title}</p>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {collectedData && collectedData.length > 0 ? (
        <div className="grid gap-4">
          {collectedData.map((data) => (
            <Card key={data.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {data.field_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {data.field_type}
                      </Badge>
                      {!data.is_synced && (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                        >
                          Não sincronizado
                        </Badge>
                      )}
                    </div>

                    <div className="text-lg text-slate-700">
                      {data.field_type === "boolean"
                        ? data.field_value === "true"
                          ? "Sim"
                          : "Não"
                        : data.field_value || "—"}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      Coletado em{" "}
                      {new Date(data.collected_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Nenhum dado coletado
            </h3>
            <p className="mb-6 text-center text-sm text-slate-600">
              Comece a coletar dados para esta pesquisa
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/dashboard/data-collection?research=${id}`}>
                <Database className="mr-2 h-4 w-4" />
                Coletar Dados
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
