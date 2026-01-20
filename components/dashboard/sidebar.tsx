"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { FileText, Database, Settings, LogOut, Home, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    {
      label: "Início",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Minhas Pesquisas",
      icon: FileText,
      href: "/dashboard/research",
      active: pathname?.startsWith("/dashboard/research"),
    },
    {
      label: "Coleta de Dados",
      icon: Database,
      href: "/dashboard/data-collection",
      active: pathname?.startsWith("/dashboard/data-collection"),
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/dashboard/reports",
      active: pathname?.startsWith("/dashboard/reports"),
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname?.startsWith("/dashboard/settings"),
    },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className={cn("flex h-full flex-col bg-slate-900", className)}>
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">
            Pesquisa Científica
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              route.active
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
