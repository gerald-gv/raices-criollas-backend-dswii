import { Mesa } from "@/app/types/reservas";
import { formatPrice } from "@/app/lib/format";
import { Check, Users, MapPin, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

interface MesaCardProps {
  mesa: Mesa;
  selected?: boolean;
  searchParamsObj: Record<string, string>;
}

export const MesaCard = ({ mesa, selected = false, searchParamsObj }: MesaCardProps) => {
  const query = new URLSearchParams({
    ...searchParamsObj,
    mesaId: String(mesa.id),
  }).toString();

  const tienePrecioBase = mesa.precioBase !== undefined && mesa.precioBase !== null;

  return (
    <article
      className={`relative flex flex-col justify-between rounded-sm border p-5 transition-all duration-200 ${
        selected
          ? "border-(--terracotta) bg-(--paper) shadow-[0_8px_24px_rgba(185,88,54,0.12)] ring-2 ring-(--terracotta)"
          : "border-(--line) bg-(--paper) hover:border-(--ink) hover:shadow-[0_8px_20px_rgba(38,37,31,0.06)]"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-(--yellow)/25 font-serif text-[15px] font-bold text-(--ink)">
              #{mesa.numeroMesa}
            </span>
            <div>
              <h3 className="font-serif text-[20px] font-normal leading-tight tracking-[-0.02em] text-(--ink)">
                Mesa {mesa.numeroMesa}
              </h3>
              <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-(--muted)">
                <MapPin size={12} className="text-(--terracotta)" aria-hidden="true" />
                {mesa.ubicacion}
              </p>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full bg-[#eef1e3] px-2.5 py-0.75 text-[10px] font-extrabold uppercase tracking-[0.08em] text-(--olive)"
            aria-label="Estado: Mesa disponible para este horario"
          >
            <Sparkles size={11} aria-hidden="true" />
            Disponible
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-(--line)/70 pt-3 text-[13px] text-(--ink)">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-(--muted)">
              <Users size={16} className="text-(--terracotta)" aria-hidden="true" />
              Capacidad máxima:
            </span>
            <strong className="font-bold text-(--ink)">
              {mesa.capacidad} {mesa.capacidad === 1 ? "persona" : "personas"}
            </strong>
          </div>

          {tienePrecioBase && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 text-(--muted)">
                <Tag size={14} className="text-(--terracotta)" aria-hidden="true" />
                Tarifa base mesa:
              </span>
              <span className="font-bold text-(--terracotta)">
                {formatPrice(mesa.precioBase!)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-2">
        {selected ? (
          <div className="flex items-center justify-center gap-2 rounded-sm bg-(--terracotta) px-4 py-2.5 text-[12px] font-extrabold text-white">
            <Check size={16} aria-hidden="true" />
            Mesa seleccionada
          </div>
        ) : (
          <Link
            href={`/reservar-mesa?${query}`}
            scroll={false}
            className="flex items-center justify-center gap-2 rounded-sm border border-(--ink) bg-transparent px-4 py-2.5 text-[12px] font-extrabold text-(--ink) transition-colors hover:bg-(--ink) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)"
            aria-label={`Seleccionar Mesa ${mesa.numeroMesa} en ${mesa.ubicacion}`}
          >
            Seleccionar esta mesa
          </Link>
        )}
      </div>
    </article>
  );
};
