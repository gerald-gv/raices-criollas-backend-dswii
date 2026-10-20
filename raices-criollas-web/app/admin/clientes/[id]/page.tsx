import { PageHeader } from "@/app/components/admin/PageHeader";
import { StatCard } from "@/app/components/admin/StatCard";
import { ReservaModalProvider } from "@/app/components/admin/reservas/ReservaModal";
import { ReservaTable } from "@/app/components/admin/reservas/ReservaTable";
import { listAdminReservas } from "@/app/lib/admin-reservas";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ClienteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminClienteDetailPage({
  params,
}: ClienteDetailPageProps) {
  const { id } = await params;

  // Next.js ya entrega el parámetro de ruta decodificado.
  const clienteId = id;

  const todas = await listAdminReservas();

  // Normalizamos el ID para comparar correctamente strings y números.
  const reservasCliente = todas.filter(
    (reserva) => String(reserva.clienteId) === clienteId
  );

  if (reservasCliente.length === 0) {
    notFound();
  }

  const total = reservasCliente.length;

  const confirmadas = reservasCliente.filter(
    (reserva) => reserva.estado === "CONFIRMADA"
  ).length;

  const canceladas = reservasCliente.filter(
    (reserva) => reserva.estado === "CANCELADA"
  ).length;

  const completadas = reservasCliente.filter(
    (reserva) => reserva.estado === "COMPLETADA"
  ).length;

  const pendientes = reservasCliente.filter(
    (reserva) => reserva.estado === "PENDIENTE"
  ).length;

  return (
    <ReservaModalProvider>
      <div className="mb-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-(--terracotta) transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Volver a clientes
        </Link>
      </div>

      <PageHeader
        eyebrow="Detalle del cliente"
        title={
          <>
            Cliente{" "}
            <span className="font-mono text-[clamp(24px,3vw,38px)] text-(--terracotta)">
              #{clienteId}
            </span>
          </>
        }
        description={`Consulta el historial y la actividad de este cliente. Tiene ${total} ${total === 1 ? "reserva registrada" : "reservas registradas"
          }.`}
      />

      {/* Indicadores de actividad */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de reservas"
          value={total}
          detail="Historial completo"
          icon={
            <CalendarCheck2
              size={18}
              aria-hidden="true"
            />
          }
        />

        <StatCard
          label="Confirmadas"
          value={confirmadas}
          detail="Reservas confirmadas"
          icon={
            <CheckCircle2
              size={18}
              aria-hidden="true"
            />
          }
        />

        <StatCard
          label="Completadas"
          value={completadas}
          detail="Visitas completadas"
          icon={<Calendar size={18} aria-hidden="true" />}
        />

        <StatCard
          label="Canceladas"
          value={canceladas}
          detail="Reservas canceladas"
          icon={<XCircle size={18} aria-hidden="true" />}
        />
      </div>

      {pendientes > 0 && (
        <div className="mb-8 flex items-center justify-between gap-3 border border-(--line) bg-(--paper) px-4 py-3">
          <p className="text-[12px] font-medium text-(--muted)">
            Reservas pendientes de este cliente
          </p>

          <span className="shrink-0 text-sm font-bold text-(--ink)">
            {pendientes}
          </span>
        </div>
      )}

      <section aria-labelledby="historial-reservas-titulo">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="historial-reservas-titulo"
              className="font-serif text-[clamp(22px,2.5vw,28px)] font-normal tracking-tight text-(--ink)"
            >
              Historial de reservas
            </h2>

            <p className="mt-1 text-[12px] text-(--muted)">
              Consulta las fechas, mesas y estados de sus reservas.
            </p>
          </div>

          <span className="text-[11px] font-bold text-(--muted)">
            {total} {total === 1 ? "registro" : "registros"}
          </span>
        </div>

        <ReservaTable reservas={reservasCliente} />
      </section>
    </ReservaModalProvider>
  );
}