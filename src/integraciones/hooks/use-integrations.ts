import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  connectIntegration,
  disconnectIntegration,
  fetchIntegrations,
  pollIntegrationStatus,
} from "../api";
import { INTEGRATIONS, CATEGORIES } from "../data";
import type { Category, ConnectionState } from "../types";

const POLL_INTERVAL_MS = 3000;

export function useIntegrations() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [states, setStates] = useState<Record<string, ConnectionState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pollingRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    fetchIntegrations()
      .then((data) => {
        const next: Record<string, ConnectionState> = {};
        for (const item of data) {
          next[item.id] = item.connected ? "connected" : "idle";
        }
        setStates(next);
      })
      .catch(() => {
        // backend unreachable — leave all as idle
      });

    return () => {
      Object.values(pollingRefs.current).forEach(clearInterval);
    };
  }, []);

  const startPolling = useCallback((serviceId: string) => {
    const interval = setInterval(async () => {
      try {
        const data = await pollIntegrationStatus(serviceId);
        if (data.connected) {
          clearInterval(pollingRefs.current[serviceId]);
          delete pollingRefs.current[serviceId];
          setStates((prev) => ({ ...prev, [serviceId]: "connected" }));
        }
      } catch {
        // ignore transient network errors during polling
      }
    }, POLL_INTERVAL_MS);

    pollingRefs.current[serviceId] = interval;
  }, []);

  const connect = useCallback(
    async (serviceId: string) => {
      setStates((prev) => ({ ...prev, [serviceId]: "loading" }));
      setErrors((prev) => ({ ...prev, [serviceId]: "" }));
      try {
        const { oauth_url } = await connectIntegration(serviceId);
        window.open(oauth_url, "_blank", "noopener,noreferrer");
        setStates((prev) => ({ ...prev, [serviceId]: "polling" }));
        startPolling(serviceId);
      } catch (e) {
        setErrors((prev) => ({ ...prev, [serviceId]: (e as Error).message }));
        setStates((prev) => ({ ...prev, [serviceId]: "idle" }));
      }
    },
    [startPolling]
  );

  const disconnect = useCallback(async (serviceId: string) => {
    setStates((prev) => ({ ...prev, [serviceId]: "disconnecting" }));
    try {
      await disconnectIntegration(serviceId);
      setStates((prev) => ({ ...prev, [serviceId]: "idle" }));
    } catch {
      setStates((prev) => ({ ...prev, [serviceId]: "connected" }));
    }
  }, []);

  const cancelPolling = useCallback((serviceId: string) => {
    clearInterval(pollingRefs.current[serviceId]);
    delete pollingRefs.current[serviceId];
    setStates((prev) => ({ ...prev, [serviceId]: "idle" }));
  }, []);

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter((integration) => {
      const matchesCategory =
        activeCategory === "Todos" || integration.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        integration.name.toLowerCase().includes(q) ||
        integration.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const connectedCount = Object.values(states).filter(
    (s) => s === "connected"
  ).length;

  return {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories: CATEGORIES,
    filtered,
    states,
    errors,
    connectedCount,
    connect,
    disconnect,
    cancelPolling,
  };
}
