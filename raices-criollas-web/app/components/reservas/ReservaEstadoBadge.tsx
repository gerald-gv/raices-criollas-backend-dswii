import { EstadoReserva } from "@/app/types/reservas";

interface ReservaEstadoBadgeProps {
  estado: EstadoReserva;
  vencida?: boolean;
  className?: string;
}

const configMap: Record<
  EstadoReserva,
  { label: string; bg: string; text: string; dot: string }
> = {
  CONFIRMADA: {
    label: "Confirmada",
    bg: "bg-[#eef1e3]",
    text: "text-(--olive)",
    dot: "bg-(--olive)",
  },
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-[#fef8e7]",
    text: "text-(--gold)",
    dot: "bg-(--gold)",
  },
  CANCELADA: {
    label: "Cancelada",
    bg: "bg-[#f8e9e2]",
    text: "text-(--terracotta)",
    dot: "bg-(--terracotta)",
  },
  COMPLETADA: {
    label: "Completada",
    bg: "bg-[#eeebe5]",
    text: "text-(--ink)",
    dot: "bg-(--ink)",
  },
};

export const ReservaEstadoBadge = ({ estado, vencida = false, className = "" }: ReservaEstadoBadgeProps) => {
  const config = vencida
    ? { label: "Expirada", bg: "bg-(--cream)", text: "text-(--muted)", dot: "bg-(--muted)" }
    : (configMap[estado] ?? {
        label: estado,
        bg: "bg-(--cream)",
        text: "text-(--muted)",
        dot: "bg-(--muted)",
      });

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${config.bg} ${config.text} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
