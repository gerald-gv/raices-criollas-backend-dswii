import { Perfil } from "@/app/types/auth";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";

// Tarjeta de solo lectura
export const PerfilResumen = ({ perfil }: { perfil: Perfil }) => {
    const iniciales = `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase();

    const desde = new Date(perfil.creadoEn);
    const miembroDesde = Number.isNaN(desde.getTime()) ? null : desde.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

    return (
        <aside className="border border-(--line) bg-(--paper) p-7 sm:p-9">

            <span aria-hidden="true" className="flex size-18 items-center justify-center rounded-full bg-(--yellow)/30 font-serif text-[28px] tracking-[-0.04em]">
                {iniciales}
            </span>

            <h2 className="mt-5 font-serif text-[28px] font-normal leading-tight tracking-tighter">
                {perfil.nombre} {perfil.apellido}
            </h2>

            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Cliente</p>

            <ul className="mt-6 flex flex-col gap-3.5 border-t border-(--line) pt-6 text-[13px]">

                <li className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
                    <span className="min-w-0 truncate">{perfil.email}</span>
                </li>

                <li className="flex items-center gap-3">
                    <Phone size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
                    {perfil.telefono ?? <span className="text-(--muted)">Sin teléfono registrado</span>}
                </li>

                <li className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-(--muted)" aria-hidden="true" />
                    {perfil.direccion ? (
                        <span>{perfil.direccion}, {perfil.distrito}</span>
                    ) : (
                        <span className="text-(--muted)">Sin dirección de entrega</span>
                    )}
                </li>

                {miembroDesde && (
                    <li className="flex items-center gap-3">
                        <CalendarDays size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
                        <span>Cliente desde <span className="capitalize">{miembroDesde}</span></span>
                    </li>
                )}

            </ul>
        </aside>
    );
};
