const BACKEND_URL = "http://localhost:8000";

export interface IntegrationStatus {
  id: string;
  name: string;
  connected: boolean;
}

export interface ConnectResult {
  oauth_url: string;
}

export async function fetchIntegrations(): Promise<IntegrationStatus[]> {
  const res = await fetch(`${BACKEND_URL}/integrations`);
  if (!res.ok) throw new Error("Error al cargar integraciones");
  return res.json();
}

export async function connectIntegration(serviceId: string): Promise<ConnectResult> {
  const res = await fetch(`${BACKEND_URL}/integrations/${serviceId}/connect`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? "Error al iniciar conexión");
  }
  return res.json();
}

export async function pollIntegrationStatus(serviceId: string): Promise<IntegrationStatus> {
  const res = await fetch(`${BACKEND_URL}/integrations/${serviceId}/status`);
  if (!res.ok) throw new Error("Error al verificar estado");
  return res.json();
}

export async function disconnectIntegration(serviceId: string): Promise<void> {
  await fetch(`${BACKEND_URL}/integrations/${serviceId}/disconnect`, {
    method: "DELETE",
  });
}
