import { Link } from "react-router-dom";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { IntegrationCard } from "@/integraciones/components/integration-card";
import { useIntegrations } from "@/integraciones/hooks/use-integrations";

export default function IntegracionesPage() {
  const {
    search, setSearch,
    activeCategory, setActiveCategory,
    categories, filtered,
    states, errors, connectedCount,
    connect, disconnect, cancelPolling,
  } = useIntegrations();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            to="/"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold">Integraciones</h1>
            <p className="text-xs text-muted-foreground">
              Conectá tus apps para que el asistente pueda actuar en ellas
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1">
            <span className="size-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">{connectedCount} conectadas</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar integraciones..."
            className="h-10 pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "integración" : "integraciones"}
          {search && ` para "${search}"`}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                state={states[integration.id] ?? "idle"}
                error={errors[integration.id]}
                onConnect={() => connect(integration.id)}
                onDisconnect={() => disconnect(integration.id)}
                onCancelPolling={() => cancelPolling(integration.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <SearchIcon className="size-8 text-muted-foreground opacity-30" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Sin resultados</p>
              <p className="text-xs text-muted-foreground">
                No se encontraron integraciones para &quot;{search}&quot;
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
