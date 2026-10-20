"use client"

import { Categoria, PlatoAdmin } from "@/app/types/menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Modal } from "../../ui/Modal";
import { PlatoForm } from "./PlatoForm";
import { ConfirmDialog } from "../ConfirmDialog";
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cambiarDestacadoPlato, cambiarDisponibilidadPlato, eliminarPlato } from "@/app/actions/menu";
import { Button } from "../../ui/button";

export type PlatoModalState = { kind: "form" | "toggle" | "delete" | "destacar"; plato?: PlatoAdmin } | null;

const PlatoModalContext = createContext<((state: NonNullable<PlatoModalState>) => void) | null>(null);

const useOpenModal = () => {
    const open = useContext(PlatoModalContext);
    if (!open) throw new Error("Debe usarse dentro de <PlatoModalProvider>");
    return open;
};

interface ProviderProps {
    categorias: Categoria[];
    initial?: PlatoModalState;
    children: ReactNode;
}

// Un solo juego de modales para toda la pagina, los botones de cada fila solo dicen cual abrir
export const PlatoModalProvider = ({ categorias, initial = null, children }: ProviderProps) => {
    const [modal, setModal] = useState<PlatoModalState>(initial);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const open = useCallback((state: NonNullable<PlatoModalState>) => setModal(state), []);

    const close = useCallback(() => {
        setModal(null);

        // Si se abrio por la URL, se limpia para que un refresco no lo reabra
        if (searchParams.has("nuevo") || searchParams.has("editar")) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("nuevo");
            params.delete("editar");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname);
        }
    }, [searchParams, router, pathname]);

    const plato = modal?.plato;
    const nombre = plato?.nombre ?? "";

    return (
        <PlatoModalContext.Provider value={open}>
            {children}

            <Modal open={modal?.kind === "form"} onClose={close} title={plato ? "Editar plato" : "Nuevo plato"}>
                <PlatoForm key={plato?.id ?? "nuevo"} categorias={categorias} plato={plato} onClose={close} />
            </Modal>

            <ConfirmDialog
                open={modal?.kind === "toggle"}
                onClose={close}
                title={plato?.disponible ? "Ocultar plato" : "Mostrar plato"}
                icon={plato?.disponible ? <EyeOff size={20} /> : <Eye size={20} />}
                description={plato?.disponible
                    ? <>Vas a ocultar «{nombre}» de la carta pública.</>
                    : <>Vas a mostrar «{nombre}» en la carta pública.</>}
                warning={plato?.disponible
                    ? "Los clientes dejarán de verlo y de poder pedirlo. No se borra nada: puedes volver a mostrarlo cuando quieras."
                    : "Los clientes podrán verlo y pedirlo de inmediato, siempre que su categoría esté activa."}
                confirmLabel={plato?.disponible ? "Ocultar" : "Mostrar"}
                pendingText={plato?.disponible ? "Ocultando…" : "Mostrando…"}
                action={cambiarDisponibilidadPlato}
                fields={{ id: String(plato?.id ?? ""), activar: String(!plato?.disponible) }}
            />

            <ConfirmDialog
                open={modal?.kind === "delete"}
                onClose={close}
                title="Eliminar plato"
                icon={<Trash2 size={20} />}
                tone="danger"
                description={<>Vas a eliminar «{nombre}».</>}
                warning="Se borra de forma permanente y no se puede deshacer. Si solo quieres que no aparezca en la carta, mejor ocúltalo."
                confirmLabel="Eliminar"
                pendingText="Eliminando…"
                action={eliminarPlato}
                fields={{ id: String(plato?.id ?? "") }}
            />

            <ConfirmDialog
                open={modal?.kind === "destacar"}
                onClose={close}
                title={plato?.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                icon={<Star size={20} />}
                description={plato?.destacado
                    ? <>Vas a quitar «{nombre}» de los platos destacados.</>
                    : <>Vas a destacar «{nombre}» en la home.</>}
                warning={plato?.destacado
                    ? "Ya no aparecerá en la sección de favoritos de la página principal."
                    : "Aparecerá en la sección «Los favoritos de Raíces». Recuerda que hay un máximo de 5 platos destacados."}
                confirmLabel={plato?.destacado ? "Quitar destacado" : "Destacar"}
                pendingText={plato?.destacado ? "Quitando…" : "Destacando…"}
                action={cambiarDestacadoPlato}
                fields={{ id: String(plato?.id ?? ""), destacar: String(!plato?.destacado) }}
            />
        </PlatoModalContext.Provider>
    );
};

export const NuevoPlatoButton = () => {
    const open = useOpenModal();

    return (
        <Button type="button" onClick={() => open({ kind: "form" })}>
            <Plus size={16} aria-hidden="true" />
            Nuevo plato
        </Button>
    );
};

const iconButton = "flex size-8 cursor-pointer items-center justify-center rounded-sm border border-(--line) text-(--muted) transition-colors duration-200 hover:border-(--ink) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";

export const PlatoRowButtons = ({ plato }: { plato: PlatoAdmin }) => {
    const open = useOpenModal();
    const toggleLabel = plato.disponible ? `Ocultar ${plato.nombre} de la carta` : `Mostrar ${plato.nombre} en la carta`;
    // Menu no deja mostrar un plato agotado: se bloquea antes de preguntar
    const sinStock = !plato.disponible && plato.stock === 0;
    const sinStockMotivo = "Sin stock: repón unidades primero";
    const destacarLabel = plato.destacado ? `Quitar ${plato.nombre} de destacados` : `Destacar ${plato.nombre}`;

    return (
        <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => open({ kind: "form", plato })} aria-label={`Editar ${plato.nombre}`} title="Editar" className={iconButton}>
                <Pencil size={14} aria-hidden="true" />
            </button>

            <button type="button" onClick={() => open({ kind: "toggle", plato })} disabled={sinStock}
                aria-label={sinStock ? `${toggleLabel} (no disponible: ${sinStockMotivo})` : toggleLabel}
                title={sinStock ? sinStockMotivo : toggleLabel}
                className={`${iconButton} disabled:cursor-not-allowed disabled:text-(--line) disabled:hover:border-(--line) disabled:hover:text-(--line)`}>
                {plato.disponible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
            </button>

            <button
                type="button"
                onClick={() => open({ kind: "destacar", plato })}
                aria-label={destacarLabel}
                title={destacarLabel}
                className={`${iconButton} ${plato.destacado ? "border-(--terracotta) text-(--terracotta)" : ""}`}
            >
                <Star size={14} aria-hidden="true" fill={plato.destacado ? "currentColor" : "none"} />
            </button>

            <button type="button" onClick={() => open({ kind: "delete", plato })} aria-label={`Eliminar ${plato.nombre}`} title="Eliminar"
                className={`${iconButton} hover:border-(--terracotta)! hover:text-(--terracotta)!`}>
                <Trash2 size={14} aria-hidden="true" />
            </button>
        </div>
    );
};
