import type { Integration } from "../types";

export function ServiceIcon({ integration }: { integration: Integration }) {
  const { icon: Icon, color, name } = integration;

  if (Icon) {
    return (
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-white/10"
        style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.07)" }}
      >
        <Icon style={{ color }} className="size-5" />
      </div>
    );
  }

  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name[0]}
    </div>
  );
}
