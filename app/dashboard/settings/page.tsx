import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Configurações
        </h1>
        <p className="text-slate-600">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="mb-4 h-16 w-16 text-slate-300" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Em Desenvolvimento
          </h3>
          <p className="text-center text-sm text-slate-600">
            A página de configurações estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
