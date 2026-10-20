import { Metadata } from "next";
import { consultarMesasDisponibles, obtenerCotizacionSegura } from "../lib/reservas";
import { getSession } from "../lib/session";
import { ReservaSearch } from "../components/reservas/ReservaSearch";
import { MesaCard } from "../components/reservas/MesaCard";
import { ReservaForm } from "../components/reservas/ReservaForm";
import { CalendarCheck2, Clock, Sparkles, UtensilsCrossed, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Reservar Mesa | Raíces Criollas",
  description:
    "Consulta mesas disponibles y asegura tu experiencia gastronómica peruana en Raíces Criollas.",
};

type Param = string | string[] | undefined;

interface ReservarMesaPageProps {
  searchParams: Promise<{
    fecha?: Param;
    horaInicio?: Param;
    horaFin?: Param;
    personas?: Param;
    mesaId?: Param;
  }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function ReservarMesaPage({ searchParams }: ReservarMesaPageProps) {
  const params = await searchParams;

  const fecha = first(params.fecha)?.trim();
  const horaInicio = first(params.horaInicio)?.trim();
  const horaFin = first(params.horaFin)?.trim();
  const personasParam = Number(first(params.personas));
  const personas = Number.isInteger(personasParam) && personasParam > 0 ? personasParam : 2;
  const mesaIdParam = Number(first(params.mesaId));

  const hasSearchParams = Boolean(fecha && horaInicio && horaFin);

  const { mesas: mesasDisponibles, error: errorBusqueda } = await consultarMesasDisponibles(
    fecha,
    horaInicio,
    horaFin,
    personas
  );

  const session = await getSession();
  const isLoggedIn = Boolean(session);

  const selectedMesa = mesaIdParam
    ? mesasDisponibles.find((m) => m.id === mesaIdParam)
    : undefined;

  // Si hay una mesa seleccionada y parámetros de fecha y horario, obtenemos la cotización real del backend
  const { cotizacion, error: errorCotizacion } = selectedMesa
    ? await obtenerCotizacionSegura(mesaIdParam, fecha, horaInicio, horaFin, personas)
    : { cotizacion: null, error: null };

  // Objeto para transportar parámetros sin perder la búsqueda al seleccionar mesa
  const searchParamsObj: Record<string, string> = {};
  if (fecha) searchParamsObj.fecha = fecha;
  if (horaInicio) searchParamsObj.horaInicio = horaInicio;
  if (horaFin) searchParamsObj.horaFin = horaFin;
  if (personas) searchParamsObj.personas = String(personas);

  const currentSearchQuery = new URLSearchParams(searchParamsObj).toString();
  const loginRedirectUrl = `/login?next=${encodeURIComponent(
    currentSearchQuery ? `/reservar-mesa?${currentSearchQuery}&mesaId=${mesaIdParam || ""}` : "/reservar-mesa"
  )}`;

  return (
    <div className="min-h-screen bg-(--cream) pb-20">
      {/* Cabecera / Banner */}
      <section className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
              Atención personalizada
            </p>
            <h1 className="font-serif text-[clamp(36px,5vw,60px)] font-normal leading-[0.98] tracking-tighter text-(--ink)">
              Reserva tu <span className="text-(--terracotta) italic">mesa</span>
            </h1>
            <p className="max-w-xl font-serif text-base leading-[1.7] text-(--muted)">
              Elige el día, la hora y el número de comensales. Consulta en tiempo real las mesas
              disponibles y asegura tu lugar para disfrutar lo mejor de nuestra cocina criolla.
            </p>
          </div>

          {/* Formulario de búsqueda */}
          <div className="mt-8">
            <ReservaSearch
              initialFecha={fecha}
              initialHoraInicio={horaInicio}
              initialHoraFin={horaFin}
              initialPersonas={personas}
            />
          </div>
        </div>
      </section>

      {/* Contenido principal: Resultados y Formulario */}
      <main className="container mx-auto mt-10 max-w-5xl px-6 md:px-8">
        {/* Error en la búsqueda */}
        {errorBusqueda && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 border border-(--terracotta) bg-[#f8e9e2] p-4 text-[13px] font-bold text-(--terracotta)"
          >
            <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
            <p>{errorBusqueda}</p>
          </div>
        )}

        {/* Sección de confirmación de mesa seleccionada con cotización en tiempo real */}
        {selectedMesa && fecha && horaInicio && horaFin && (
          <div className="mb-12">
            <ReservaForm
              mesa={selectedMesa}
              fecha={fecha}
              horaInicio={horaInicio}
              horaFin={horaFin}
              personas={personas}
              cotizacion={cotizacion}
              errorCotizacion={errorCotizacion}
              isLoggedIn={isLoggedIn}
              loginRedirectUrl={loginRedirectUrl}
            />
          </div>
        )}

        {/* Sección de resultados de mesas */}
        {hasSearchParams && !errorBusqueda && (
          <section aria-labelledby="resultados-titulo">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-(--line) pb-4">
              <div>
                <h2
                  id="resultados-titulo"
                  className="font-serif text-[clamp(24px,3vw,32px)] font-normal tracking-tight text-(--ink)"
                >
                  Mesas disponibles
                </h2>
                <p className="text-[13px] text-(--muted)">
                  Disponibilidad confirmada para {personas} {personas === 1 ? "persona" : "personas"} el{" "}
                  <strong className="text-(--ink)">{fecha}</strong> ({horaInicio} – {horaFin}).
                </p>
              </div>

              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)"
                aria-live="polite"
              >
                {mesasDisponibles.length}{" "}
                {mesasDisponibles.length === 1 ? "mesa encontrada" : "mesas encontradas"}
              </p>
            </div>

            {mesasDisponibles.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
                <UtensilsCrossed size={36} className="text-(--muted)" aria-hidden="true" />
                <p className="font-serif text-xl text-(--ink)">
                  No hay mesas disponibles para ese horario y capacidad.
                </p>
                <p className="max-w-md text-[13px] text-(--muted)">
                  Intenta cambiar el horario por uno más temprano o más tarde, o prueba con una
                  cantidad diferente de personas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mesasDisponibles.map((mesa) => (
                  <MesaCard
                    key={mesa.id}
                    mesa={mesa}
                    selected={selectedMesa?.id === mesa.id}
                    searchParamsObj={searchParamsObj}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Estado inicial antes de realizar búsqueda */}
        {!hasSearchParams && !errorBusqueda && (
          <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-(--line) bg-(--paper) p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-(--yellow)/20 text-(--ink)">
              <CalendarCheck2 size={28} aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-serif text-[24px] font-normal text-(--ink)">
              Comienza seleccionando tu fecha y hora
            </h2>
            <p className="mt-2 max-w-md font-serif text-[15px] leading-relaxed text-(--muted)">
              Usa el buscador de arriba para verificar qué mesas están libres en el horario que deseas.
              Luego podrás elegir tu mesa y confirmar tu reserva en segundos.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-[12px] text-(--muted)">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-(--terracotta)" /> Reservas disponibles todos los días
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-(--terracotta)" /> Confirmación al pagar
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
