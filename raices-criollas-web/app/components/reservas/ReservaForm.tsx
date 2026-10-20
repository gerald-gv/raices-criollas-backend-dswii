"use client";

import { crearReservaAction } from "@/app/actions/reservas";
import { formatPrice } from "@/app/lib/format";
import { CotizacionResponseDTO, Mesa, ReservaFormState } from "@/app/types/reservas";
import { AlertCircle, AlertTriangle, Calendar, Clock, Coins, FileText, MapPin, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Field, inputClass } from "../ui/field";
import { SubmitButton } from "../ui/SubmitButton";
import { ReservaEstadoBadge } from "./ReservaEstadoBadge";
import { PagoEstadoBadge } from "./PagoEstadoBadge";
import { ReservaCountdown } from "./ReservaCountdown";
import { PagarReservaButton } from "./PagarReservaButton";

interface ReservaFormProps {
  mesa: Mesa;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  personas: number;
  cotizacion?: CotizacionResponseDTO | null;
  errorCotizacion?: string | null;
  isLoggedIn: boolean;
  loginRedirectUrl: string;
}

export const ReservaForm = ({
  mesa,
  fecha,
  horaInicio,
  horaFin,
  personas,
  cotizacion,
  errorCotizacion,
  isLoggedIn,
  loginRedirectUrl,
}: ReservaFormProps) => {
  const [state, formAction] = useActionState(crearReservaAction, {} as ReservaFormState);

  // Formateador amigable de fecha
  const fechaLegible = new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Pantalla de "Reserva Pendiente de Pago" tras creación exitosa
  if (state.ok && state.data) {
    const reservaCreada = state.data;

    return (
      <div className="rounded-sm border border-(--gold)/50 bg-(--paper) p-6 sm:p-10 shadow-[0_16px_40px_rgba(38,37,31,0.08)]">
        {/* Cabecera de estado pendiente */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-(--line) pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ReservaEstadoBadge estado={reservaCreada.estado} />
              <PagoEstadoBadge estadoPago={reservaCreada.estadoPago} />
            </div>

            <h3 className="mt-3 font-serif text-[clamp(26px,3.5vw,36px)] font-normal text-(--ink)">
              Reserva registrada: falta el pago
            </h3>
            <p className="mt-1 text-[13px] text-(--muted)">
              Código de solicitud:{" "}
              <span className="font-mono font-bold text-(--ink)">RC-RES-{reservaCreada.id}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-(--muted)">
              Total a pagar
            </span>
            <p className="font-serif text-[28px] font-bold text-(--terracotta)">
              {formatPrice(reservaCreada.montoTotal)}
            </p>
            <span className="text-[10px] uppercase tracking-wider text-(--muted)">
              {reservaCreada.moneda || "PEN"}
            </span>
          </div>
        </div>

        {/* Mensaje obligatorio de estado NO confirmado */}
        <div
          role="status"
          className="my-6 flex items-start gap-3 rounded-sm border-l-3 border-(--gold) bg-(--yellow)/15 p-4 text-[13px] leading-relaxed text-(--ink)"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-(--gold)" aria-hidden="true" />
          <div>
            <strong className="block font-bold">Reserva no confirmada aún</strong>
            <span>
              Tu reserva quedó registrada, pero no pudimos abrir Mercado Pago en este momento. Puedes
              reintentar ahora o pagarla después desde «Mis reservas». Se confirma cuando el pago se
              aprueba y, si no se paga a tiempo, la mesa se libera sola.
            </span>
          </div>
        </div>

        {/* Temporizador de expiración de pago si el backend entregó fecha */}
        {reservaCreada.fechaExpiracionPago && (
          <div className="mb-6">
            <ReservaCountdown fechaExpiracion={reservaCreada.fechaExpiracionPago} />
          </div>
        )}

        {/* Resumen detallado de la reserva */}
        <div className="mb-8 rounded-sm border border-(--line) bg-(--cream) p-5 text-[13px]">
          <h4 className="font-serif text-[16px] font-bold text-(--ink) border-b border-(--line)/70 pb-2 mb-3">
            Detalles de tu visita
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-(--muted)">Mesa asignada:</dt>
              <dd className="font-bold text-(--ink)">
                Mesa {reservaCreada.mesa?.numeroMesa ?? mesa.numeroMesa} ({reservaCreada.mesa?.ubicacion ?? mesa.ubicacion})
              </dd>
            </div>
            <div>
              <dt className="text-(--muted)">Fecha:</dt>
              <dd className="font-bold capitalize text-(--ink)">{fechaLegible}</dd>
            </div>
            <div>
              <dt className="text-(--muted)">Horario:</dt>
              <dd className="font-bold text-(--ink)">{horaInicio} a {horaFin}</dd>
            </div>
            <div>
              <dt className="text-(--muted)">Comensales:</dt>
              <dd className="font-bold text-(--ink)">{reservaCreada.cantidadPersonas} personas</dd>
            </div>
          </dl>
        </div>

        {/* Reintento del pago (misma reserva = mismo cobro, no se duplica) */}
        <div className="mb-8 flex flex-col items-end gap-2 rounded-sm border border-(--line) bg-(--cream) p-5">
          <p className="w-full text-[12px] text-(--muted)">Pago seguro con Mercado Pago · tarjetas, débito y más.</p>
          <PagarReservaButton reservaId={reservaCreada.id} />
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-(--line) pt-6">
          <Link
            href="/mis-reservas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-(--ink) px-6 py-3.5 text-xs font-extrabold text-white transition-all hover:bg-(--terracotta)"
          >
            Ver mis reservas
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm border border-(--line) bg-transparent px-6 py-3.5 text-xs font-extrabold text-(--ink) transition-colors hover:bg-(--cream)"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Si la mesa no está disponible según la cotización
  const noDisponibleParaCotizar = cotizacion?.disponible === false;

  return (
    <div className="rounded-sm border border-(--line) bg-(--paper) p-6 shadow-[0_12px_36px_rgba(38,37,31,0.06)] md:p-8">
      {/* Título */}
      <div className="mb-6 flex items-start justify-between border-b border-(--line) pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-(--terracotta)">
            Paso final
          </span>
          <h2 className="mt-1 font-serif text-[clamp(24px,3vw,32px)] font-normal text-(--ink)">
            Resumen y cotización de reserva
          </h2>
          <p className="text-[13px] text-(--muted)">
            Verifica el desglose de tarifas antes de registrar tu solicitud.
          </p>
        </div>

        {cotizacion?.disponible ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#eef1e3] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-(--olive)">
            <Sparkles size={13} aria-hidden="true" />
            Disponible
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#f8e9e2] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-(--terracotta)">
            <AlertTriangle size={13} aria-hidden="true" />
            No disponible
          </span>
        )}
      </div>

      {/* Datos básicos de la mesa */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-sm border border-(--line) bg-(--cream) p-4 text-[13px] sm:grid-cols-4">
        <div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted)">
            <MapPin size={12} className="text-(--terracotta)" />
            Mesa
          </span>
          <p className="mt-1 font-serif text-[16px] font-bold text-(--ink)">
            #{mesa.numeroMesa} · {mesa.ubicacion}
          </p>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted)">
            <Calendar size={12} className="text-(--terracotta)" />
            Fecha
          </span>
          <p className="mt-1 font-bold capitalize text-(--ink)">{fechaLegible}</p>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted)">
            <Clock size={12} className="text-(--terracotta)" />
            Horario
          </span>
          <p className="mt-1 font-bold text-(--ink)">{horaInicio} a {horaFin}</p>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted)">
            <Users size={12} className="text-(--terracotta)" />
            Comensales
          </span>
          <p className="mt-1 font-bold text-(--ink)">{personas} personas</p>
        </div>
      </div>

      {/* Alerta de no disponibilidad o error de cotización */}
      {noDisponibleParaCotizar && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 rounded-sm border border-(--terracotta) bg-[#f8e9e2] p-4 text-[13px] font-bold text-(--terracotta)"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p>{cotizacion?.mensaje || "La mesa no está disponible para el intervalo de tiempo seleccionado."}</p>
            <p className="mt-1 font-normal text-[12px]">
              Por favor selecciona otra mesa disponible o ajusta el horario de tu búsqueda.
            </p>
          </div>
        </div>
      )}

      {errorCotizacion && !cotizacion && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 rounded-sm border border-(--terracotta) bg-[#f8e9e2] p-4 text-[13px] font-bold text-(--terracotta)"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{errorCotizacion}</p>
        </div>
      )}

      {/* Desglose Económico Oficial de la Cotización */}
      {cotizacion && (
        <div className="mb-6 rounded-sm border border-(--line) bg-(--paper) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-(--line) pb-3 mb-4">
            <h3 className="flex items-center gap-2 font-serif text-[18px] font-normal text-(--ink)">
              <Coins size={18} className="text-(--terracotta)" aria-hidden="true" />
              Presupuesto de reserva
            </h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-(--muted)">
              Moneda: {cotizacion.moneda || "PEN"}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between items-center py-1">
              <span className="text-(--muted)">Tarifa base de mesa:</span>
              <span className="font-bold text-(--ink)">
                {formatPrice(cotizacion.precioBaseMesa ?? cotizacion.tarifaBaseMesa)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-(--muted)">
                Cargo por comensales ({cotizacion.cantidadPersonas} pers. a {formatPrice(cotizacion.tarifaPorPersona)} c/u):
              </span>
              <span className="font-bold text-(--ink)">
                {formatPrice(cotizacion.subtotalPersonas)}
              </span>
            </div>

            {cotizacion.desglose && (
              <div className="rounded-sm bg-(--cream) px-3 py-2 text-[11px] text-(--muted) flex items-center gap-1.5">
                <FileText size={13} className="text-(--terracotta) shrink-0" aria-hidden="true" />
                <span>{cotizacion.desglose}</span>
              </div>
            )}

            <div className="mt-2 flex items-baseline justify-between border-t-2 border-(--ink) pt-4">
              <div>
                <span className="block text-[12px] font-black uppercase tracking-[0.14em] text-(--muted)">
                  Total de la reserva
                </span>
                <span className="text-[11px] text-(--muted)">
                  Tarifa base + recargos por comensal
                </span>
              </div>
              <div className="text-right">
                <span className="font-serif text-[clamp(28px,3vw,34px)] font-bold text-(--terracotta)">
                  {formatPrice(cotizacion.montoTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manejo de Sesión y Formulario de Envío */}
      {!isLoggedIn ? (
        <div className="rounded-sm border border-dashed border-(--terracotta)/60 bg-[#f8e9e2]/50 p-6 text-center">
          <p className="font-serif text-lg text-(--ink)">
            Inicia sesión para continuar con tu reserva
          </p>
          <p className="mt-1 text-[13px] text-(--muted) max-w-md mx-auto">
            Necesitas iniciar sesión para que podamos registrar la reserva a tu nombre con tu tarifa cotizada.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={loginRedirectUrl}
              className="inline-flex items-center justify-center rounded-sm bg-(--ink) px-6 py-3 text-xs font-extrabold text-white transition-colors hover:bg-(--terracotta)"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-sm border border-(--ink) px-6 py-3 text-xs font-extrabold text-(--ink) transition-colors hover:bg-(--cream)"
            >
              Crear una cuenta nueva
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          {/* Campos ocultos de la selección */}
          <input type="hidden" name="mesaId" value={mesa.id} />
          <input type="hidden" name="fecha" value={fecha} />
          <input type="hidden" name="horaInicio" value={horaInicio} />
          <input type="hidden" name="horaFin" value={horaFin} />
          <input type="hidden" name="cantidadPersonas" value={personas} />

          {state.mensaje && !state.ok && (
            <div
              role="alert"
              className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-4 text-[13px] font-bold text-(--terracotta)"
            >
              <AlertCircle size={18} className="mt-px shrink-0" aria-hidden="true" />
              <div>
                <p>{state.mensaje}</p>
                {state.errores && (
                  <ul className="mt-1.5 list-disc pl-5 text-[12px] font-normal">
                    {Object.entries(state.errores).map(([k, v]) => (
                      <li key={k}>{v}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <Field
            label="Observaciones o solicitudes especiales (opcional)"
            htmlFor="reserva-observaciones"
            hint="Ej.: Celebración especial, silla para bebé, preferencia de ubicación interior, etc."
          >
            <textarea
              id="reserva-observaciones"
              name="observaciones"
              rows={3}
              maxLength={255}
              placeholder="Indícanos cualquier detalle para preparar tu mesa…"
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-(--line) pt-5">
            <p className="text-[12px] text-(--muted) max-w-sm">
              Al continuar te llevamos a Mercado Pago. La mesa queda apartada unos minutos mientras pagas y la reserva se confirma cuando el pago se aprueba.
            </p>

            <SubmitButton
              variant="primary"
              pendingText="Abriendo Mercado Pago…"
              className="w-full sm:w-auto"
              disabled={noDisponibleParaCotizar || !cotizacion}
            >
              Continuar al pago
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
};
