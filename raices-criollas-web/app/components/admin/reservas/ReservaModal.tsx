"use client";

import { cambiarEstadoReservaAdminAction } from "@/app/actions/reservas";
import { Reserva } from "@/app/types/reservas";
import { Check, Clock, CreditCard, MapPin, User, Users, XCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog";
import { Modal } from "../../ui/Modal";
import { ReservaEstadoBadge } from "../../reservas/ReservaEstadoBadge";
import { formatPrice } from "@/app/lib/reservas";
import { estaVencida, horaDe } from "@/app/lib/reservas-estados";
import { PagoEstadoBadge } from "../../reservas/PagoEstadoBadge";

export type ReservaModalState = {
  kind: "detail" | "cancelar" | "completar";
  reserva: Reserva;
} | null;

const ReservaModalContext = createContext<((state: NonNullable<ReservaModalState>) => void) | null>(null);

export const useOpenReservaModal = () => {
  const open = useContext(ReservaModalContext);
  if (!open) throw new Error("Debe usarse dentro de <ReservaModalProvider>");
  return open;
};

interface ProviderProps {
  initial?: ReservaModalState;
  children: ReactNode;
}

export const ReservaModalProvider = ({ initial = null, children }: ProviderProps) => {
  const [modal, setModal] = useState<ReservaModalState>(initial);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = useCallback((state: NonNullable<ReservaModalState>) => setModal(state), []);

  const close = useCallback(() => {
    setModal(null);

    if (searchParams.has("detalle")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("detalle");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [searchParams, router, pathname]);

  const reserva = modal?.reserva;

  return (
    <ReservaModalContext.Provider value={open}>
      {children}

      {/* Modal de Detalle Completo */}
      <Modal
        open={modal?.kind === "detail"}
        onClose={close}
        title={`Detalle de Reserva #${reserva?.id ?? ""}`}
      >
        {reserva && (
          <div className="flex flex-col gap-6 text-[13px]">
            <div className="flex items-center justify-between border-b border-(--line) pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-(--muted)">
                  Estado actual
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <ReservaEstadoBadge estado={reserva.estado} vencida={estaVencida(reserva)} />
                  <PagoEstadoBadge estadoPago={reserva.estadoPago} />
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-(--muted)">
                  Código
                </span>
                <p className="mt-1 font-mono font-bold text-(--ink)">RC-RES-{reserva.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-(--line) bg-(--cream) p-3.5">
                <span className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-(--muted)">
                  <User size={13} className="text-(--terracotta)" />
                  Cliente (ID Backend)
                </span>
                <p className="mt-1 font-mono font-bold text-(--ink) break-all">{reserva.clienteId}</p>
                <span className="text-[10px] text-(--muted)">Extraído del token JWT verificado</span>
              </div>

              <div className="rounded-sm border border-(--line) bg-(--cream) p-3.5">
                <span className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-(--muted)">
                  <MapPin size={13} className="text-(--terracotta)" />
                  Mesa asignada
                </span>
                <p className="mt-1 font-serif text-[17px] font-bold text-(--ink)">
                  Mesa #{reserva.mesa?.numeroMesa ?? "—"} ({reserva.mesa?.ubicacion ?? "—"})
                </p>
                <span className="text-[10px] text-(--muted)">Capacidad máxima: {reserva.mesa?.capacidad ?? "—"} pers.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-(--line) bg-(--paper) p-3.5">
                <span className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-(--muted)">
                  <Clock size={13} className="text-(--terracotta)" />
                  Horario de la reserva
                </span>
                <p className="mt-1 font-bold text-(--ink)">
                  {reserva.fechaInicio.replace("T", " ")}
                </p>
                <p className="text-(--muted)">
                  Hasta: {reserva.fechaFin.replace("T", " ")}
                </p>
              </div>

              <div className="rounded-sm border border-(--line) bg-(--paper) p-3.5">
                <span className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-(--muted)">
                  <Users size={13} className="text-(--terracotta)" />
                  Comensales registrados
                </span>
                <p className="mt-1 font-serif text-[17px] font-bold text-(--ink)">
                  {reserva.cantidadPersonas} {reserva.cantidadPersonas === 1 ? "persona" : "personas"}
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-(--line) bg-(--paper) p-3.5">
              <span className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-(--muted)">
                <CreditCard size={13} className="text-(--terracotta)" />
                Cobro de la reserva
              </span>
              <p className="mt-1 font-serif text-[17px] font-bold text-(--ink)">
                {formatPrice(reserva.montoTotal, reserva.moneda)}
              </p>
              {reserva.estadoPago === "PENDIENTE" && reserva.fechaExpiracionPago && (
                <p className="text-(--muted)">
                  Plazo para pagar: hasta las {horaDe(reserva.fechaExpiracionPago)}
                  {estaVencida(reserva) ? " (vencido)" : ""}
                </p>
              )}
              {reserva.estadoPago === "PAGADO" && (
                <p className="text-(--muted)">
                  Pagada con Mercado Pago. El reembolso aún no está disponible desde la web.
                </p>
              )}
            </div>

            {reserva.observaciones && (
              <div className="rounded-sm border-l-2 border-(--yellow) bg-(--cream) p-3.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-(--ink)">
                  Observaciones del comensal:
                </span>
                <p className="mt-1 text-(--ink)">{reserva.observaciones}</p>
              </div>
            )}

            <div className="flex justify-end border-t border-(--line) pt-4">
              <button
                type="button"
                onClick={close}
                className="rounded-sm bg-(--ink) px-5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-(--terracotta)"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancelar Reserva */}
      <ConfirmDialog
        open={modal?.kind === "cancelar"}
        onClose={close}
        title="Cancelar reserva"
        tone="danger"
        icon={<XCircle size={20} />}
        description={
          <>¿Cancelar administrativamente la reserva #{reserva?.id}?</>
        }
        warning="La reserva pasará al estado CANCELADA y liberará la mesa para que otros clientes puedan reservarla."
        confirmLabel="Cancelar reserva"
        pendingText="Cancelando…"
        action={cambiarEstadoReservaAdminAction}
        fields={{ id: String(reserva?.id ?? ""), estado: "CANCELADA" }}
      />

      {/* Completar Reserva */}
      <ConfirmDialog
        open={modal?.kind === "completar"}
        onClose={close}
        title="Marcar como completada"
        icon={<Check size={20} />}
        description={
          <>¿Marcar la visita de la reserva #{reserva?.id} como completada?</>
        }
        warning="La reserva pasará al estado COMPLETADA indicando que el comensal ya fue atendido."
        confirmLabel="Completar"
        pendingText="Actualizando…"
        action={cambiarEstadoReservaAdminAction}
        fields={{ id: String(reserva?.id ?? ""), estado: "COMPLETADA" }}
      />
    </ReservaModalContext.Provider>
  );
};
