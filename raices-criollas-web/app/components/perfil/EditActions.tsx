"use client"

import { Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { SubmitButton } from "../ui/SubmitButton";

interface EditActionsProps {
    editando: boolean;
    onEditar: () => void;
    onCancelar: () => void;
    submitLabel: string;
    puedeCancelar?: boolean;
}


export const EditActions = ({ editando, onEditar, onCancelar, submitLabel, puedeCancelar = true }: EditActionsProps) => {
    if (!editando) {
        return (
            <div key="lectura" className="flex justify-end">
                <Button type="button" variant="outline" onClick={onEditar}>
                    <Pencil size={14} aria-hidden="true" />
                    Editar
                </Button>
            </div>
        );
    }

    return (
        <div key="edicion" className="flex items-center justify-end gap-3">
            {puedeCancelar && (
                <Button type="button" variant="text" onClick={onCancelar}>
                    Cancelar
                </Button>
            )}
            <SubmitButton pendingText="Guardando…">{submitLabel}</SubmitButton>
        </div>
    );
};
