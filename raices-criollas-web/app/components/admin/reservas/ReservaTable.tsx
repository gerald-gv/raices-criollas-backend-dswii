import { Reserva } from "@/app/types/reservas";
import { ReservaEstadoBadge } from "../../reservas/ReservaEstadoBadge";
import { PagoEstadoBadge } from "../../reservas/PagoEstadoBadge";
import { formatPrice } from "@/app/lib/reservas";
import { ReservaRowButtons } from "./ReservaRowButtons";
import { Calendar, MapPin, User, Users } from "lucide-react";
import { estaVencida } from "@/app/lib/reservas-estados";

interface ReservaTableProps {
  reservas: Reserva[];
}

export const ReservaTable = ({ reservas }: ReservaTableProps) => {
  if (reservas.length === 0) {
    return (
      <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
        <p className="font-serif text-xl">No hay reservas con los filtros seleccionados.</p>
        <p className="text-[12px] text-(--muted)">
          Prueba cambiando el estado o la fecha seleccionada.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de tarjetas en móvil */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reservas.map((reserva) => {
          const inicioDate = new Date(reserva.fechaInicio);
          const horaInicioStr = !Number.isNaN(inicioDate.getTime())
            ? inicioDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
            : reserva.fechaInicio.split("T")[1]?.slice(0, 5) ?? "";

          return (
            <div
              key={reserva.id}
              className="flex flex-col justify-between rounded-sm border border-(--line) bg-(--paper) p-4"
            >
              <div className="flex items-start justify-between border-b border-(--line) pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-(--yellow)/25 font-mono text-[11px] font-bold text-(--ink)">
                    #{reserva.id}
                  </span>
                  <div>
                    <h3 className="font-serif text-[18px] font-normal text-(--ink)">
                      Mesa {reserva.mesa?.numeroMesa ?? "—"}
                    </h3>
                    <p className="flex items-center gap-1 text-[11px] text-(--muted)">
                      <MapPin size={11} className="text-(--terracotta)" />
                      {reserva.mesa?.ubicacion ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <ReservaEstadoBadge estado={reserva.estado} vencida={estaVencida(reserva)} />
                  <PagoEstadoBadge estadoPago={reserva.estadoPago} />
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
                <div className="flex items-center gap-1.5 text-(--ink)">
                  <User size={13} className="text-(--terracotta)" />
                  <span className="text-(--muted)">Cliente:</span>
                  <span className="font-mono font-bold">{reserva.clienteId}</span>
                </div>

                <div className="flex items-center gap-1.5 text-(--ink)">
                  <Calendar size={13} className="text-(--terracotta)" />
                  <span>{reserva.fechaInicio.split("T")[0]} ({horaInicioStr})</span>
                </div>

                <div className="flex items-center gap-1.5 text-(--ink)">
                  <Users size={13} className="text-(--terracotta)" />
                  <span>{reserva.cantidadPersonas} personas · {formatPrice(reserva.montoTotal, reserva.moneda)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-(--line) pt-3">
                <ReservaRowButtons reserva={reserva} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla completa en escritorio */}
      <div className="hidden md:block overflow-x-auto border border-(--line) bg-(--paper)">
        <table className="w-full min-w-180 text-left">
          <caption className="sr-only">Listado administrativo de reservas</caption>
          <thead>
            <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
              <th scope="col" className="px-5 py-3.5">
                Código / ID
              </th>
              <th scope="col" className="px-4 py-3.5">
                Cliente
              </th>
              <th scope="col" className="px-4 py-3.5">
                Mesa & Ubicación
              </th>
              <th scope="col" className="px-4 py-3.5">
                Fecha & Horario
              </th>
              <th scope="col" className="px-3 py-3.5">
                Pers.
              </th>
              <th scope="col" className="px-4 py-3.5">
                Total
              </th>
              <th scope="col" className="px-4 py-3.5">
                Estado / Pago
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--line)">
            {reservas.map((reserva) => {
              const inicioDate = new Date(reserva.fechaInicio);
              const finDate = new Date(reserva.fechaFin);

              const horaInicio = !Number.isNaN(inicioDate.getTime())
                ? inicioDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                : reserva.fechaInicio.split("T")[1]?.slice(0, 5) ?? "";

              const horaFin = !Number.isNaN(finDate.getTime())
                ? finDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                : reserva.fechaFin.split("T")[1]?.slice(0, 5) ?? "";

              return (
                <tr
                  key={reserva.id}
                  className="transition-colors duration-200 hover:bg-(--cream)"
                >
                  <td className="px-5 py-3.5 font-mono text-[13px] font-bold text-(--ink)">
                    #{reserva.id}
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-mono text-[12px] font-bold text-(--ink) max-w-36 truncate" title={String(reserva.clienteId)}>
                      {reserva.clienteId}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-[13px]">
                    <p className="font-serif font-medium text-(--ink)">
                      Mesa {reserva.mesa?.numeroMesa ?? "—"}
                    </p>
                    <p className="text-[11px] text-(--muted)">
                      {reserva.mesa?.ubicacion ?? "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-[13px]">
                    <p className="font-medium text-(--ink)">
                      {reserva.fechaInicio.split("T")[0]}
                    </p>
                    <p className="text-[11px] text-(--muted)">
                      {horaInicio} – {horaFin}
                    </p>
                  </td>

                  <td className="px-3 py-3.5 text-[13px] font-bold text-(--ink)">
                    {reserva.cantidadPersonas}
                  </td>

                  <td className="px-4 py-3.5 text-[13px] font-bold text-(--ink)">
                    {formatPrice(reserva.montoTotal, reserva.moneda)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-start gap-1">
                      <ReservaEstadoBadge estado={reserva.estado} vencida={estaVencida(reserva)} />
                      <PagoEstadoBadge estadoPago={reserva.estadoPago} />
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <ReservaRowButtons reserva={reserva} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
