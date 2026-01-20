import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona direto para login sem verificar sessão
  // O middleware irá proteger as rotas protegidas
  redirect("/auth/login");
}
