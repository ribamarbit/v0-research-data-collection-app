import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiter } from "@/lib/security/rate-limit";
import { isValidUUID } from "@/lib/security/sanitize";

// Endpoint de validação para verificar permissões
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitCheck = rateLimiter.check(ip);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { resource_type, resource_id } = body;

    // Validar entrada
    if (!resource_type || !resource_id) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    if (!isValidUUID(resource_id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Validar permissão baseado no tipo de recurso
    let hasPermission = false;

    if (resource_type === "research") {
      const { data, error } = await supabase
        .from("research")
        .select("id")
        .eq("id", resource_id)
        .eq("user_id", user.id)
        .single();

      hasPermission = !error && !!data;
    } else if (resource_type === "data_collection") {
      const { data, error } = await supabase
        .from("data_collection")
        .select("id")
        .eq("id", resource_id)
        .eq("user_id", user.id)
        .single();

      hasPermission = !error && !!data;
    }

    return NextResponse.json({
      valid: hasPermission,
      user_id: user.id,
    });
  } catch (error) {
    console.error("[v0] Erro na validação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
