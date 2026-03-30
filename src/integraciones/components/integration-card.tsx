import { CheckIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ConnectionState, Integration } from "../types";
import { ServiceIcon } from "./service-icon";

interface IntegrationCardProps {
  integration: Integration;
  state: ConnectionState;
  error?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onCancelPolling: () => void;
}

export function IntegrationCard({
  integration,
  state,
  error,
  onConnect,
  onDisconnect,
  onCancelPolling,
}: IntegrationCardProps) {
  const isConnected = state === "connected";
  const isPolling = state === "polling";
  const isLoading = state === "loading" || state === "disconnecting";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <ServiceIcon integration={integration} />
        {isConnected && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckIcon className="size-3" />
            Conectado
          </span>
        )}
        {isPolling && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Loader2Icon className="size-3 animate-spin" />
            Esperando...
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-semibold leading-snug">{integration.name}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {integration.description}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {isPolling ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Autorizá en la nueva pestaña y volvé aquí. La conexión se detecta automáticamente.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            onClick={onCancelPolling}
          >
            <XIcon className="size-3.5" />
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          className="w-full"
          disabled={isLoading}
          onClick={isConnected ? onDisconnect : onConnect}
        >
          {isLoading ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : isConnected ? (
            "Desconectar"
          ) : (
            <>
              <PlusIcon className="size-3.5" />
              Conectar
            </>
          )}
        </Button>
      )}
    </div>
  );
}
