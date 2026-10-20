import { PageHeader } from "@/app/components/admin/PageHeader";
import { StatCard } from "@/app/components/admin/StatCard";
import { listAdminReservas } from "@/app/lib/admin-reservas";
import {
  ArrowRight,
  Calendar,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ClienteResumenListado {
  clienteId: string;
  totalReservas: number;
  confirmadas: number;
  canceladas: number;
  completadas: number;
  pendientes: number;
  ultimaReserva: string | null;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";

  const fechaBase = fecha.split("T")[0];
  const partes = fechaBase.split("-");

  if (partes.length !== 3) return "—";

  const [anio, mes, dia] = partes;

  if (!anio || !mes || !dia) return "—";

  return `${dia}/${mes}/${anio}`;
}

export default async function AdminClientesPage() {
  const reservas = await listAdminReservas();

  // Agrupamos las reservas para calcular la actividad de cada cliente.
  const clientesMap = new Map<string, ClienteResumenListado>();

  reservas.forEach((reserva) => {
    const id = String(reserva.clienteId);

    const actual = clientesMap.get(id) ?? {
      clienteId: id,
      totalReservas: 0,
      confirmadas: 0,
      canceladas: 0,
      completadas: 0,
      pendientes: 0,
      ultimaReserva: null,
    };

    actual.totalReservas += 1;

    if (reserva.estado === "CONFIRMADA") {
      actual.confirmadas += 1;
    } else if (reserva.estado === "CANCELADA") {
      actual.canceladas += 1;
    } else if (reserva.estado === "COMPLETADA") {
      actual.completadas += 1;
    } else if (reserva.estado === "PENDIENTE") {
      actual.pendientes += 1;
    }

    // Conservamos la fecha de la reserva más reciente.
    const fechaActual = actual.ultimaReserva
      ? new Date(actual.ultimaReserva).getTime()
      : Number.NEGATIVE_INFINITY;

    const fechaNueva = new Date(reserva.fechaInicio).getTime();

    if (
      Number.isFinite(fechaNueva) &&
      fechaNueva > fechaActual
    ) {
      actual.ultimaReserva = reserva.fechaInicio;
    }

    clientesMap.set(id, actual);
  });

  const clientes = Array.from(clientesMap.values()).sort(
    (a, b) => b.totalReservas - a.totalReservas
  );

  const promedioReservas =
    clientes.length > 0
      ? (reservas.length / clientes.length).toFixed(1)
      : "0.0";

  return (
    <>
      <PageHeader
        eyebrow="Clientes"
        title={
          <>
            Directorio de{" "}
            <span className="text-(--terracotta) italic">
              comensales
            </span>
          </>
        }
        description="Consulta la actividad de tus clientes y accede al historial de sus reservas."
      />

      {/* Resumen de actividad */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Clientes con reservas"
          value={clientes.length}
          detail="Clientes registrados en el historial"
          icon={<Users size={18} aria-hidden="true" />}
        />

        <StatCard
          label="Total de reservas"
          value={reservas.length}
          detail="Reservas registradas"
          icon={<Calendar size={18} aria-hidden="true" />}
        />

        <StatCard
          label="Promedio por cliente"
          value={promedioReservas}
          detail="Reservas por cliente"
          icon={<User size={18} aria-hidden="true" />}
        />
      </div>

      {clientes.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
          <Users
            size={36}
            className="text-(--muted)"
            aria-hidden="true"
          />

          <p className="font-serif text-xl text-(--ink)">
            Todavía no hay clientes con reservas.
          </p>

          <p className="max-w-md text-[12px] leading-relaxed text-(--muted)">
            Cuando se registren nuevas reservas, podrás consultar
            aquí la actividad de tus clientes y sus visitas al
            restaurante.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-(--line) bg-(--paper)">
          <table className="w-full min-w-150 text-left">
            <caption className="sr-only">
              Directorio de clientes y resumen de sus reservas
            </caption>

            <thead>
              <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                <th scope="col" className="px-5 py-3.5">
                  Cliente
                </th>

                <th scope="col" className="px-4 py-3.5">
                  Total de reservas
                </th>

                <th scope="col" className="px-4 py-3.5">
                  Confirmadas y completadas
                </th>

                <th scope="col" className="px-4 py-3.5">
                  Canceladas
                </th>

                <th scope="col" className="px-4 py-3.5">
                  Reserva más reciente
                </th>

                <th scope="col" className="px-5 py-3.5 text-right">
                  Historial
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--line)">
              {clientes.map((cliente) => (
                <tr
                  key={cliente.clienteId}
                  className="transition-colors duration-200 hover:bg-(--cream)"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--yellow)/25">
                        <User
                          size={15}
                          className="text-(--ink)"
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-(--ink)">
                          Cliente #{cliente.clienteId}
                        </p>

                        <p className="text-[11px] text-(--muted)">
                          {cliente.totalReservas}{" "}
                          {cliente.totalReservas === 1
                            ? "reserva registrada"
                            : "reservas registradas"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-[13px] font-bold text-(--ink)">
                    {cliente.totalReservas}
                  </td>

                  <td className="px-4 py-3.5 text-[13px] font-medium text-(--olive)">
                    {cliente.confirmadas + cliente.completadas}
                  </td>

                  <td className="px-4 py-3.5 text-[13px] font-medium text-(--terracotta)">
                    {cliente.canceladas}
                  </td>

                  <td className="px-4 py-3.5 text-[12px] text-(--muted)">
                    {formatFecha(cliente.ultimaReserva)}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/clientes/${encodeURIComponent(cliente.clienteId)}`}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-(--line) px-3 py-2 text-[11px] font-extrabold text-(--ink) transition-colors hover:border-(--ink) hover:bg-(--ink) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)"
                    >
                      Ver historial

                      <ArrowRight
                        size={13}
                        aria-hidden="true"
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}