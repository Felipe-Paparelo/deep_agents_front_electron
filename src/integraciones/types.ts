export type Category =
  | "Todos"
  | "Productividad"
  | "Comunicación"
  | "Desarrollo"
  | "CRM"
  | "Redes Sociales"
  | "Finanzas";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "Todos">;
  /** react-icons component, or null to show initial-letter fallback */
  icon: React.ElementType | null;
  color: string;
}

/** "connected" reflects real backend state; the rest are transient UI states */
export type ConnectionState =
  | "idle"
  | "loading"
  | "polling"
  | "connected"
  | "disconnecting";
