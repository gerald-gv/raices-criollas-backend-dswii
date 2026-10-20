"use client"

import { Categoria } from "@/app/types/menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Modal } from "../../ui/Modal";
import { CategoriaForm } from "./CategoriaForm";
import { ConfirmDialog } from "../ConfirmDialog";
import { cambiarEstadoCategoria, eliminarCategoria } from "@/app/actions/menu";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";

// aviso al desactivar de cuantos platos tiene una categoria
export type CategoriaModalState = { kind: "form" | "toggle" | "delete"; categoria?: Categoria; platos?: number } | null;

const CategoriaModalContext = createContext<((state: NonNullable<CategoriaModalState>) => void) | null>(null);

const useOpenModal = () => {
    const open = useContext(CategoriaModalContext);
    if (!open) throw new Error("Debe usarse dentro de <CategoriaModalProvider>");
    return open;
};

interface ProviderProps {
    initial?: CategoriaModalState;
    children: ReactNode;
}

export const CategoriaModalProvider = ({ initial = null, children }: ProviderProps) => {
    const [modal, setModal] = useState<CategoriaModalState>(initial);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const open = useCallback((state: NonNullable<CategoriaModalState>) => setModal(state), []);

    const close = useCallback(() => {
        setModal(null);

        if (searchParams.has("nuevo") || searchParams.has("editar")) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("nuevo");
            params.delete("editar");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname);
        }
    }, [searchParams, router, pathname]);

    const categoria = modal?.categoria;
    const nombre = categoria?.nombre ?? "";
    const platos = modal?.platos ?? 0;

    return (
        <CategoriaModalContext.Provider value={open}>
            {children}

            <Modal open={modal?.kind === "form"} onClose={close} title={categoria ? "Editar categoría" : "Nueva categoría"}>
                <CategoriaForm key={categoria?.id ?? "nueva"} categoria={categoria} onClose={close} />
            </Modal>

            <ConfirmDialog
                open={modal?.kind === "toggle"}
                onClose={close}
                title={categoria?.activo ? "Desactivar categoría" : "Activar categoría"}
                icon={categoria?.activo ? <EyeOff size={20} /> : <Eye size={20} />}
                description={categoria?.activo
                    ? <>Vas a desactivar la categoría «{nombre}».</>
                    : <>Vas a activar la categoría «{nombre}».</>}
                warning={categoria?.activo
                    ? <>Dejará de mostrarse en la carta{platos > 0 ? <>, y sus {platos} {platos === 1 ? "plato dejará" : "platos dejarán"} de verse aunque sigan marcados como disponibles</> : null}. Podrás activarla de nuevo cuando quieras.</>
                    : "Volverá a mostrarse en la carta pública junto con sus platos disponibles."}
                confirmLabel={categoria?.activo ? "Desactivar" : "Activar"}
                pendingText={categoria?.activo ? "Desactivando…" : "Activando…"}
                action={cambiarEstadoCategoria}
                fields={{ id: String(categoria?.id ?? ""), activar: String(!categoria?.activo) }}
            />

            <ConfirmDialog
                open={modal?.kind === "delete"}
                onClose={close}
                title="Eliminar categoría"
                icon={<Trash2 size={20} />}
                tone="danger"
                description={<>Vas a eliminar la categoría «{nombre}».</>}
                warning="Se borra de forma permanente y no se puede deshacer. Solo es posible si no tiene platos asociados."
                confirmLabel="Eliminar"
                pendingText="Eliminando…"
                action={eliminarCategoria}
                fields={{ id: String(categoria?.id ?? "") }}
            />
        </CategoriaModalContext.Provider>
    );
};

export const NuevaCategoriaButton = () => {
    const open = useOpenModal();

    return (
        <Button type="button" onClick={() => open({ kind: "form" })}>
            <Plus size={16} aria-hidden="true" />
            Nueva categoría
        </Button>
    );
};

const iconButton = "flex size-8 cursor-pointer items-center justify-center rounded-sm border border-(--line) text-(--muted) transition-colors duration-200 hover:border-(--ink) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";

export const CategoriaRowButtons = ({ categoria, platos }: { categoria: Categoria; platos: number }) => {
    const open = useOpenModal();
    const toggleLabel = categoria.activo ? `Desactivar ${categoria.nombre}` : `Activar ${categoria.nombre}`;
    const blockedReason = "Tiene platos asociados: muévelos o elimínalos primero";

    return (
        <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => open({ kind: "form", categoria })} aria-label={`Editar ${categoria.nombre}`} title="Editar" className={iconButton}>
                <Pencil size={14} aria-hidden="true" />
            </button>

            <button type="button" onClick={() => open({ kind: "toggle", categoria, platos })} aria-label={toggleLabel} title={toggleLabel} className={iconButton}>
                {categoria.activo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
            </button>

            {/* El backend no permite eliminar una categoria con platos: se bloquea antes de preguntar */}
            <button type="button" onClick={() => open({ kind: "delete", categoria })} disabled={platos > 0}
                aria-label={platos > 0 ? `Eliminar ${categoria.nombre} (no disponible: ${blockedReason})` : `Eliminar ${categoria.nombre}`}
                title={platos > 0 ? blockedReason : "Eliminar"}
                className={`${iconButton} hover:border-(--terracotta)! hover:text-(--terracotta)! disabled:cursor-not-allowed disabled:text-(--line) disabled:hover:border-(--line)! disabled:hover:text-(--line)!`}>
                <Trash2 size={14} aria-hidden="true" />
            </button>
        </div>
    );
};
