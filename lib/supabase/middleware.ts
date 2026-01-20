import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Apenas retorna a resposta sem modificações
  return NextResponse.next({
    request,
  });
}
