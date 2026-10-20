import { EstadoPago } from "@/app/types/reservas";
import { CreditCard } from "lucide-react";

interface PagoEstadoBadgeProps {
  estadoPago?: EstadoPago;
  estado?: EstadoPago;
  className?: string;
}

const pagoMap: Record<
  EstadoPago,
  { label: string; bg: string; text: string; dot: string }
> = {
  PAGADO: {
    label: "Pagado",
    bg: "bg-[#eef1e3]",
    text: "text-(--olive)",
    dot: "bg-(--olive)",
  },
  PENDIENTE: {
    label: "Pendiente de pago",
    bg: "bg-[#fef8e7]",
    text: "text-(--gold)",
    dot: "bg-(--gold)",
  },
  FALLIDO: {
    label: "Pago fallido",
    bg: "bg-[#f8e9e2]",
    text: "text-(--terracotta)",
    dot: "bg-(--terracotta)",
  },
  REEMBOLSADO: {
    label: "Reembolsado",
    bg: "bg-[#eeebe5]",
    text: "text-(--muted)",
    dot: "bg-(--muted)",
  },
};

export const PagoEstadoBadge = ({
  estadoPago,
  estado,
  className = "",
}: PagoEstadoBadgeProps) => {
  const finalEstado = estadoPago ?? estado ?? "PENDIENTE";
  const config = pagoMap[finalEstado] ?? {
    label: estadoPago,
    bg: "bg-(--cream)",
    text: "text-(--muted)",
    dot: "bg-(--muted)",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${config.bg} ${config.text} ${className}`.trim()}
    >
      <CreditCard size={11} aria-hidden="true" className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
