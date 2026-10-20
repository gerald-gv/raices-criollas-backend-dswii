import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { getMisReservas } from "../lib/cliente-reservas";
import { ReservaCard } from "../components/reservas/ReservaCard";
import { estaVencida } from "../lib/reservas-estados";
import { CalendarDays, Plus, Utensils } from "lucide-react";
import Link from "next/link";
import { ToastProvider } from "../components/ui/Toast";

export const metadata: Metadata = {
  title: "Mis Reservas | Raíces Criollas",
  description: "Consulta el historial de tus reservas, fechas, horarios y estado en Raíces Criollas.",
};

type Param = string | string[] | undefined;

interface MisReservasPageProps {
  searchParams: Promise<{ estado?: Param; pago?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function MisReservasPage({ searchParams }: MisReservasPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/mis-reservas");
  }

  const params = await searchParams;
  const estadoFiltro = first(params.estado)?.toUpperCase();
  const pagoFiltro = first(params.pago)?.toUpperCase();

  const reservas = await getMisReservas();

  // Separación cronológica
  const ahora = new Date();

  // Filtrar si el usuario seleccionó un estado u opción de pago
  const reservasFiltradas = reservas.filter((r) => {
    if (estadoFiltro && r.estado !== estadoFiltro) return false;
    if (pagoFiltro && r.estadoPago !== pagoFiltro) return false;
    return true;
  });

  // Sin pagar y fuera de plazo: la mesa ya se liberó, así que pasa al historial como «Expirada»
  const ahoraMs = ahora.getTime();
  const vencidas = new Set(reservas.filter((r) => estaVencida(r, ahoraMs)).map((r) => r.id));

  const proximas = reservasFiltradas.filter((r) => {
    const inicio = new Date(r.fechaInicio);
    return inicio >= ahora && !vencidas.has(r.id) && (r.estado === "CONFIRMADA" || r.estado === "PENDIENTE");
  });

  const proximasIds = new Set(proximas.map((r) => r.id));
  const pasadasYCanceladas = reservasFiltradas.filter((r) => !proximasIds.has(r.id));

  const pendientesPagoCount = reservas.filter(
    (r) => r.estadoPago === "PENDIENTE" && r.estado === "PENDIENTE" && !vencidas.has(r.id)
  ).length;

  const tabs = [
    { label: "Todas", value: undefined },
    { label: "Confirmadas", value: "CONFIRMADA" },
    { label: "Pendientes", value: "PENDIENTE" },
    { label: "Completadas", value: "COMPLETADA" },
    { label: "Canceladas", value: "CANCELADA" },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-(--cream) pb-24">
        {/* Cabecera */}
        <section className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                  Mi historial
                </p>
                <h1 className="mt-2 font-serif text-[clamp(34px,4vw,52px)] font-normal leading-[0.98] tracking-tighter text-(--ink)">
                  Mis <span className="text-(--terracotta) italic">reservas</span>
                </h1>
                <p className="mt-3 max-w-lg font-serif text-[15px] leading-[1.7] text-(--muted)">
                  Historial de tus mesas reservadas en Raíces Criollas. Revisa el estado de tu mesa,
                  el desglose del costo o gestiona cancelaciones si tus planes cambiaron.
                </p>
              </div>

              <Link
                href="/reservar-mesa"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-(--ink) px-5 py-3.5 text-xs font-extrabold text-white transition-all hover:bg-(--terracotta)"
              >
                <Plus size={16} aria-hidden="true" />
                Nueva reserva
              </Link>
            </div>

            {/* Aviso si existen reservas pendientes de pago */}
            {pendientesPagoCount > 0 && (
              <div className="mt-6 rounded-sm border border-(--yellow) bg-[#fffdf0] p-4 text-[13px] text-(--ink)">
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--yellow) font-bold text-white text-[12px]">
                    !
                  </span>
                  <div>
                    <h3 className="font-bold text-[#b45309]">
                      Tienes {pendientesPagoCount}{" "}
                      {pendientesPagoCount === 1 ? "reserva pendiente" : "reservas pendientes"} de pago
                    </h3>
                    <p className="mt-0.5 text-[12px] text-(--muted) leading-relaxed">
                      Tu mesa queda apartada solo unos minutos. Paga con Mercado Pago desde cada
                      reserva: si el pago no se confirma a tiempo, la mesa se libera para otros comensales.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestañas de filtro por estado */}
            <div className="mt-8 flex gap-2 overflow-x-auto border-t border-(--line) pt-4">
              {tabs.map((tab) => {
                const active = (!estadoFiltro && !tab.value) || estadoFiltro === tab.value;
                const href = tab.value ? `/mis-reservas?estado=${tab.value}` : "/mis-reservas";

                return (
                  <Link
                    key={tab.label}
                    href={href}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${
                      active
                        ? "bg-(--ink) text-white"
                        : "bg-(--cream) text-(--muted) hover:bg-(--line) hover:text-(--ink)"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Listado de reservas */}
        <main className="container mx-auto mt-10 max-w-5xl px-6 md:px-8">
          {reservasFiltradas.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-4 border border-dashed border-(--line) bg-(--paper) p-10 text-center">
              <CalendarDays size={40} className="text-(--muted)" aria-hidden="true" />
              <div>
                <p className="font-serif text-2xl text-(--ink)">No tienes reservas registradas</p>
                <p className="mt-1 text-[13px] text-(--muted)">
                  {estadoFiltro
                    ? `No se encontraron reservas con el estado «${estadoFiltro}».`
                    : "Aún no has realizado ninguna reserva en nuestro restaurante."}
                </p>
              </div>
              <Link
                href="/reservar-mesa"
                className="mt-2 inline-flex items-center gap-2 rounded-sm bg-(--terracotta) px-6 py-3 text-xs font-extrabold text-white transition-colors hover:bg-(--ink)"
              >
                <Utensils size={15} />
                Reservar una mesa ahora
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* Próximas reservas */}
              {proximas.length > 0 && (
                <section aria-labelledby="proximas-titulo">
                  <div className="mb-5 flex items-center justify-between border-b border-(--line) pb-3">
                    <h2
                      id="proximas-titulo"
                      className="font-serif text-[clamp(22px,2.5vw,28px)] font-normal tracking-tight text-(--ink)"
                    >
                      Próximas reservas
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-(--olive)">
                      {proximas.length} {proximas.length === 1 ? "activa" : "activas"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {proximas.map((reserva) => (
                      <ReservaCard key={reserva.id} reserva={reserva} vencida={vencidas.has(reserva.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Historial pasado y canceladas */}
              {pasadasYCanceladas.length > 0 && (
                <section aria-labelledby="historial-titulo">
                  <div className="mb-5 flex items-center justify-between border-b border-(--line) pb-3">
                    <h2
                      id="historial-titulo"
                      className="font-serif text-[clamp(22px,2.5vw,28px)] font-normal tracking-tight text-(--ink)"
                    >
                      Historial pasado y canceladas
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-(--muted)">
                      {pasadasYCanceladas.length} {pasadasYCanceladas.length === 1 ? "registro" : "registros"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {pasadasYCanceladas.map((reserva) => (
                      <ReservaCard key={reserva.id} reserva={reserva} vencida={vencidas.has(reserva.id)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
