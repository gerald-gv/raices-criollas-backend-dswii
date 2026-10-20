"use client";

import { Reserva } from "@/app/types/reservas";
import { Check, Eye, XCircle } from "lucide-react";
import { useOpenReservaModal } from "./ReservaModal";

const iconButton =
  "flex size-8 cursor-pointer items-center justify-center rounded-sm border border-(--line) text-(--muted) transition-colors duration-200 hover:border-(--ink) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";

export const ReservaRowButtons = ({ reserva }: { reserva: Reserva }) => {
  const open = useOpenReservaModal();

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Botón Ver Detalle */}
      <button
        type="button"
        onClick={() => open({ kind: "detail", reserva })}
        aria-label={`Ver detalle de reserva #${reserva.id}`}
        title="Ver detalle completo"
        className={iconButton}
      >
        <Eye size={14} aria-hidden="true" />
      </button>

      {/* PENDIENTE (esperando pago): solo se puede cancelar. La confirmación la hace el pago aprobado. */}
      {reserva.estado === "PENDIENTE" && (
        <button
          type="button"
          onClick={() => open({ kind: "cancelar", reserva })}
          aria-label={`Cancelar reserva #${reserva.id}`}
          title="Cancelar reserva"
          className={`${iconButton} hover:border-(--terracotta)! hover:text-(--terracotta)!`}
        >
          <XCircle size={14} aria-hidden="true" />
        </button>
      )}

      {/* CONFIRMADA: puede marcar completada. Cancelar solo si no está pagada (el reembolso aún no está listo) */}
      {reserva.estado === "CONFIRMADA" && (
        <>
          <button
            type="button"
            onClick={() => open({ kind: "completar", reserva })}
            aria-label={`Marcar completada reserva #${reserva.id}`}
            title="Marcar como atendida / completada"
            className={`${iconButton} hover:border-(--olive)! hover:text-(--olive)!`}
          >
            <Check size={14} aria-hidden="true" />
          </button>

          {reserva.estadoPago !== "PAGADO" && (
            <button
              type="button"
              onClick={() => open({ kind: "cancelar", reserva })}
              aria-label={`Cancelar reserva #${reserva.id}`}
              title="Cancelar reserva"
              className={`${iconButton} hover:border-(--terracotta)! hover:text-(--terracotta)!`}
            >
              <XCircle size={14} aria-hidden="true" />
            </button>
          )}
        </>
      )}
    </div>
  );
};
