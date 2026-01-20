"use client";

import { usePermission } from "@/lib/hooks/use-permission";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

interface ProtectedContentProps {
  resourceType: string;
  resourceId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedContent({
  resourceType,
  resourceId,
  children,
  fallback,
}: ProtectedContentProps) {
  const { hasPermission, isLoading } = usePermission(resourceType, resourceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar este recurso.
          </AlertDescription>
        </Alert>
      )
    );
  }

  return <>{children}</>;
}
