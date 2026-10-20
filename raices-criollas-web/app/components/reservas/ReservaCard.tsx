"use client";

import { cancelarMiReservaAction } from "@/app/actions/reservas";
import { Reserva } from "@/app/types/reservas";
import { formatPrice } from "@/app/lib/reservas";
import { Calendar, Clock, CreditCard, Info, MapPin, MessageSquare, ShieldCheck, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../admin/ConfirmDialog";
import { ReservaCountdown } from "./ReservaCountdown";
import { PagarReservaButton } from "./PagarReservaButton";
import { PagoEstadoBadge } from "./PagoEstadoBadge";
import { ReservaEstadoBadge } from "./ReservaEstadoBadge";

interface ReservaCardProps {
  reserva: Reserva;
  vencida?: boolean; // Lo calcula la página (servidor) para que servidor y navegador muestren lo mismo
}

export const ReservaCard = ({ reserva, vencida = false }: ReservaCardProps) => {
  const [openCancel, setOpenCancel] = useState(false);

  // Formato de fecha
  const inicioDate = new Date(reserva.fechaInicio);
  const finDate = new Date(reserva.fechaFin);

  const fechaFormateada = !Number.isNaN(inicioDate.getTime())
    ? inicioDate.toLocaleDateString("es-PE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : reserva.fechaInicio;

  const horaInicioStr = !Number.isNaN(inicioDate.getTime())
    ? inicioDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : reserva.fechaInicio.split("T")[1]?.slice(0, 5) ?? "";

  const horaFinStr = !Number.isNaN(finDate.getTime())
    ? finDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : reserva.fechaFin.split("T")[1]?.slice(0, 5) ?? "";

  const estaPagada = reserva.estadoPago === "PAGADO";
  // Una reserva pagada no se cancela desde la web mientras el reembolso no esté listo (el dinero quedaría cobrado)
  const puedeCancelar = (reserva.estado === "PENDIENTE" || reserva.estado === "CONFIRMADA") && !estaPagada && !vencida;
  const esPagoPendiente = reserva.estadoPago === "PENDIENTE" && reserva.estado === "PENDIENTE" && !vencida;

  return (
    <article className="flex flex-col justify-between rounded-sm border border-(--line) bg-(--paper) p-6 transition-all duration-200 hover:border-(--ink)/30 hover:shadow-[0_8px_24px_rgba(38,37,31,0.06)]">
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-(--line) pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-(--yellow)/30 font-serif text-[13px] font-bold text-(--ink)">
              #{reserva.id}
            </span>
            <div>
              <h3 className="font-serif text-[18px] font-normal leading-tight text-(--ink)">
                Mesa {reserva.mesa?.numeroMesa ?? "—"}
              </h3>
              <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted)">
                <MapPin size={11} className="text-(--terracotta)" aria-hidden="true" />
                {reserva.mesa?.ubicacion ?? "Ubicación asignada"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <ReservaEstadoBadge estado={reserva.estado} vencida={vencida} />
            {!vencida && <PagoEstadoBadge estado={reserva.estadoPago} />}
          </div>
        </div>

        {/* Detalles principales */}
        <dl className="mt-4 grid grid-cols-1 gap-2.5 text-[13px] sm:grid-cols-2">
          <div className="flex items-center gap-2 text-(--ink)">
            <Calendar size={15} className="shrink-0 text-(--terracotta)" aria-hidden="true" />
            <span className="capitalize font-medium">{fechaFormateada}</span>
          </div>

          <div className="flex items-center gap-2 text-(--ink)">
            <Clock size={15} className="shrink-0 text-(--terracotta)" aria-hidden="true" />
            <span className="font-medium">
              {horaInicioStr} – {horaFinStr}
            </span>
          </div>

          <div className="flex items-center gap-2 text-(--ink)">
            <Users size={15} className="shrink-0 text-(--terracotta)" aria-hidden="true" />
            <span>
              <strong className="font-bold">{reserva.cantidadPersonas}</strong>{" "}
              {reserva.cantidadPersonas === 1 ? "comensal" : "comensales"}
            </span>
          </div>

          {/* Importe total de la reserva */}
          <div className="flex items-center gap-2 text-(--ink)">
            <CreditCard size={15} className="shrink-0 text-(--terracotta)" aria-hidden="true" />
            <span>
              <span className="text-(--muted)">Total:</span>{" "}
              <strong className="font-bold text-(--terracotta)">
                {formatPrice(reserva.montoTotal, reserva.moneda)}
              </strong>
            </span>
          </div>
        </dl>

        {/* Notificación informativa según estado de pago */}
        {esPagoPendiente && (
          <div className="mt-4 rounded-sm border border-(--yellow) bg-[#fffdf0] p-3 text-[12px] text-(--ink)">
            <div className="flex items-start gap-2">
              <Info size={15} className="mt-0.5 shrink-0 text-[#b45309]" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-bold text-[#b45309]">
                  Pendiente de pago — Tu reserva aún no está confirmada
                </p>
                <p className="text-(--muted) text-[11px] leading-relaxed">
                  Cuentas con una tolerancia de 15 minutos para que la mesa permanezca apartada antes
                  de liberarse automáticamente para otros clientes.
                </p>
                {reserva.fechaExpiracionPago && (
                  <div className="pt-1">
                    <ReservaCountdown fechaExpiracion={reserva.fechaExpiracionPago} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-(--muted)">
                    <ShieldCheck size={13} className="text-[#009ee3]" aria-hidden="true" />
                    Pago seguro con Mercado Pago
                  </span>
                  <PagarReservaButton reservaId={reserva.id} />
                </div>
              </div>
            </div>
          </div>
        )}

        {vencida && (
          <div className="mt-4 rounded-sm border border-(--line) bg-(--cream) p-3 text-[12px] text-(--muted)">
            Esta reserva expiró sin pago y la mesa fue liberada. Si aún quieres visitarnos, puedes hacer una nueva
            reserva.
          </div>
        )}

        {reserva.estadoPago === "PAGADO" && (
          <div className="mt-4 flex items-center gap-2 rounded-sm border border-(--olive)/20 bg-(--olive)/5 p-2.5 text-[11px] text-(--olive)">
            <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />
            <span>Pago confirmado. Tu mesa está asegurada.</span>
          </div>
        )}

        {/* Observaciones si las hay */}
        {reserva.observaciones && (
          <div className="mt-4 rounded-sm border-l-2 border-(--yellow) bg-(--cream) p-3 text-[12px] text-(--muted)">
            <span className="flex items-center gap-1 font-bold text-(--ink)">
              <MessageSquare size={12} className="text-(--terracotta)" aria-hidden="true" />
              Observaciones:
            </span>
            <p className="mt-0.5 line-clamp-2">{reserva.observaciones}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-6 flex items-center justify-between border-t border-(--line) pt-4">
        <span className="text-[11px] text-(--muted)">
          Código: <span className="font-mono font-bold text-(--ink)">RC-RES-{reserva.id}</span>
        </span>

        {puedeCancelar ? (
          <button
            type="button"
            onClick={() => setOpenCancel(true)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-(--terracotta)/40 px-3 py-1.5 text-[11px] font-extrabold text-(--terracotta) transition-colors hover:bg-(--terracotta) hover:text-white focus-visible:outline-2 focus-visible:outline-(--terracotta)"
          >
            <XCircle size={14} aria-hidden="true" />
            Cancelar reserva
          </button>
        ) : (
          <span className="text-right text-[11px] italic text-(--muted)">
            {reserva.estado === "CANCELADA"
              ? "Cancelada previamente"
              : vencida
                ? "Expiró sin pago"
                : reserva.estado === "COMPLETADA"
                  ? "Visita completada"
                  : "Para cambios o cancelación, comunícate con el restaurante"}
          </span>
        )}
      </div>

      {/* Diálogo de confirmación para cancelación */}
      <ConfirmDialog
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        title="Cancelar reserva"
        tone="danger"
        icon={<XCircle size={20} />}
        description={
          <>
            ¿Deseas cancelar tu reserva para el{" "}
            <strong className="capitalize">{fechaFormateada}</strong> de {horaInicioStr} a{" "}
            {horaFinStr}?
          </>
        }
        warning="Al cancelar, la mesa quedará liberada para otros clientes. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar reserva"
        pendingText="Cancelando reserva…"
        action={cancelarMiReservaAction}
        fields={{ id: String(reserva.id) }}
      />
    </article>
  );
};
