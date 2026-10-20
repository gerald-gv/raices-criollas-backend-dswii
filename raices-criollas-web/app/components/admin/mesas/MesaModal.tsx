"use client";

import { Mesa } from "@/app/types/reservas";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Modal } from "../../ui/Modal";
import { MesaForm } from "./MesaForm";
import { ConfirmDialog } from "../ConfirmDialog";
import { cambiarEstadoMesaAction } from "@/app/actions/mesas";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Button } from "../../ui/button";

export type MesaModalState = { kind: "form" | "toggle"; mesa?: Mesa } | null;

const MesaModalContext = createContext<((state: NonNullable<MesaModalState>) => void) | null>(null);

const useOpenModal = () => {
  const open = useContext(MesaModalContext);
  if (!open) throw new Error("Debe usarse dentro de <MesaModalProvider>");
  return open;
};

interface ProviderProps {
  initial?: MesaModalState;
  children: ReactNode;
}

export const MesaModalProvider = ({ initial = null, children }: ProviderProps) => {
  const [modal, setModal] = useState<MesaModalState>(initial);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = useCallback((state: NonNullable<MesaModalState>) => setModal(state), []);

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

  const mesa = modal?.mesa;
  const numero = mesa?.numeroMesa ?? "";

  return (
    <MesaModalContext.Provider value={open}>
      {children}

      <Modal
        open={modal?.kind === "form"}
        onClose={close}
        title={mesa ? `Editar Mesa ${mesa.numeroMesa}` : "Nueva mesa"}
      >
        <MesaForm key={mesa?.id ?? "nueva"} mesa={mesa} onClose={close} />
      </Modal>

      <ConfirmDialog
        open={modal?.kind === "toggle"}
        onClose={close}
        title={mesa?.activo ? "Desactivar mesa" : "Activar mesa"}
        icon={mesa?.activo ? <EyeOff size={20} /> : <Eye size={20} />}
        description={
          mesa?.activo ? (
            <>Vas a desactivar la mesa #{numero} ({mesa.ubicacion}).</>
          ) : (
            <>Vas a activar la mesa #{numero} ({mesa?.ubicacion}).</>
          )
        }
        warning={
          mesa?.activo
            ? "Esta mesa dejará de aparecer como disponible para los clientes en las búsquedas públicas de reservas. Las reservas previamente confirmadas se mantendrán."
            : "La mesa volverá a estar disponible inmediatamente en el sistema para recibir reservas públicas."
        }
        confirmLabel={mesa?.activo ? "Desactivar" : "Activar"}
        pendingText={mesa?.activo ? "Desactivando…" : "Activando…"}
        action={cambiarEstadoMesaAction}
        fields={{ id: String(mesa?.id ?? ""), activar: String(!mesa?.activo) }}
      />
    </MesaModalContext.Provider>
  );
};

export const NuevaMesaButton = () => {
  const open = useOpenModal();

  return (
    <Button type="button" onClick={() => open({ kind: "form" })}>
      <Plus size={16} aria-hidden="true" />
      Nueva mesa
    </Button>
  );
};

const iconButton =
  "flex size-8 cursor-pointer items-center justify-center rounded-sm border border-(--line) text-(--muted) transition-colors duration-200 hover:border-(--ink) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";

export const MesaRowButtons = ({ mesa }: { mesa: Mesa }) => {
  const open = useOpenModal();
  const toggleLabel = mesa.activo
    ? `Desactivar Mesa ${mesa.numeroMesa}`
    : `Activar Mesa ${mesa.numeroMesa}`;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => open({ kind: "form", mesa })}
        aria-label={`Editar Mesa ${mesa.numeroMesa}`}
        title="Editar"
        className={iconButton}
      >
        <Pencil size={14} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => open({ kind: "toggle", mesa })}
        aria-label={toggleLabel}
        title={toggleLabel}
        className={iconButton}
      >
        {mesa.activo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      </button>
    </div>
  );
};
