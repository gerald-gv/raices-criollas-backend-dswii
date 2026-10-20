import { PageHeader } from "@/app/components/admin/PageHeader";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import {
  MesaModalProvider,
  MesaModalState,
  MesaRowButtons,
  NuevaMesaButton,
} from "@/app/components/admin/mesas/MesaModal";
import { getAdminMesa, listAdminMesas } from "@/app/lib/admin-mesas";
import { formatPrice } from "@/app/lib/reservas";
import { ApiError } from "@/app/lib/api";
import { Users, MapPin, Grid2X2, CreditCard } from "lucide-react";

type Param = string | string[] | undefined;

interface MesasPageProps {
  searchParams: Promise<{ nuevo?: Param; editar?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function AdminMesasPage({ searchParams }: MesasPageProps) {
  const params = await searchParams;
  const mesas = await listAdminMesas();

  // Ordenamos por número de mesa
  const mesasOrdenadas = [...mesas].sort(
    (a, b) => Number(a.numeroMesa) - Number(b.numeroMesa)
  );

  let initial: MesaModalState = null;
  const editarId = Number(first(params.editar)) || undefined;

  if (first(params.nuevo)) {
    initial = { kind: "form" };
  } else if (editarId) {
    try {
      initial = { kind: "form", mesa: await getAdminMesa(editarId) };
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }

  const activasCount = mesas.filter((m) => m.activo).length;
  const totalCapacidad = mesas
    .filter((m) => m.activo)
    .reduce((sum, m) => sum + m.capacidad, 0);

  return (
    <MesaModalProvider initial={initial}>
      <PageHeader
        eyebrow="Salón y Capacidad"
        title={
          <>
            Gestión de <span className="text-(--terracotta) italic">mesas</span>
          </>
        }
        description={`Total de ${mesas.length} mesas registradas (${activasCount} activas con capacidad para ${totalCapacidad} comensales simultáneos).`}
        actions={<NuevaMesaButton />}
      />

      {mesasOrdenadas.length === 0 ? (
        <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
          <Grid2X2 size={36} className="text-(--muted)" aria-hidden="true" />
          <p className="font-serif text-xl">Aún no hay mesas registradas.</p>
          <p className="text-[12px] text-(--muted)">
            Usa «Nueva mesa» para registrar las mesas del restaurante.
          </p>
        </div>
      ) : (
        <>
          {/* Vista para pantallas móviles (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {mesasOrdenadas.map((mesa) => (
              <div
                key={mesa.id}
                className="flex flex-col justify-between rounded-sm border border-(--line) bg-(--paper) p-4"
              >
                <div className="flex items-start justify-between border-b border-(--line) pb-3">
                  <div>
                    <span className="font-serif text-[20px] font-normal tracking-tight text-(--ink)">
                      Mesa {mesa.numeroMesa}
                    </span>
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-(--muted)">
                      <MapPin size={12} className="text-(--terracotta)" />
                      {mesa.ubicacion}
                    </p>
                  </div>
                  <StatusBadge
                    active={mesa.activo}
                    activeLabel="Activa"
                    inactiveLabel="Inactiva"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-1.5 text-(--muted)">
                    <Users size={14} className="text-(--terracotta)" />
                    Capacidad:
                  </span>
                  <strong className="font-bold text-(--ink)">
                    {mesa.capacidad} {mesa.capacidad === 1 ? "persona" : "personas"}
                  </strong>
                </div>

                <div className="mt-1 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-1.5 text-(--muted)">
                    <CreditCard size={14} className="text-(--terracotta)" />
                    Tarifa base:
                  </span>
                  <strong className="font-bold text-(--terracotta)">
                    {formatPrice(mesa.precioBase ?? 20)}
                  </strong>
                </div>

                <div className="mt-4 border-t border-(--line) pt-3">
                  <MesaRowButtons mesa={mesa} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabla para pantallas de escritorio */}
          <div className="hidden md:block overflow-x-auto border border-(--line) bg-(--paper)">
            <table className="w-full min-w-160 text-left">
              <caption className="sr-only">Mesas del restaurante</caption>
              <thead>
                <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                  <th scope="col" className="px-5 py-3.5">
                    Mesa
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Ubicación
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Capacidad
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Tarifa Base
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--line)">
                {mesasOrdenadas.map((mesa) => (
                  <tr
                    key={mesa.id}
                    className="transition-colors duration-200 hover:bg-(--cream)"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-(--yellow)/25 font-serif text-[14px] font-bold text-(--ink)">
                          #{mesa.numeroMesa}
                        </span>
                        <div>
                          <p className="font-serif text-[17px] font-medium tracking-tight text-(--ink)">
                            Mesa {mesa.numeroMesa}
                          </p>
                          <span className="text-[11px] text-(--muted)">ID #{mesa.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[13px] text-(--ink)">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-(--terracotta)" aria-hidden="true" />
                        <span>{mesa.ubicacion}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[13px] font-bold text-(--ink)">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-(--muted)" aria-hidden="true" />
                        <span>{mesa.capacidad} pers.</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[13px] font-bold text-(--terracotta)">
                      {formatPrice(mesa.precioBase ?? 20)}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge
                        active={mesa.activo}
                        activeLabel="Activa"
                        inactiveLabel="Inactiva"
                      />
                    </td>

                    <td className="px-5 py-3.5">
                      <MesaRowButtons mesa={mesa} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MesaModalProvider>
  );
}
