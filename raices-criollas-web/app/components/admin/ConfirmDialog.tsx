"use client"

import { FormState } from "@/app/types/menu";
import { ReactNode, useActionState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { SubmitButton } from "../ui/SubmitButton";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description: ReactNode;
    warning?: ReactNode;
    icon: ReactNode;
    tone?: "neutral" | "danger";
    confirmLabel: string;
    pendingText?: string;
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    fields: Record<string, string>;
}

// Un solo dialogo de confirmacion para ocultar/mostrar y eliminar: sin datos, solo aviso y consecuencia
export const ConfirmDialog = ({ open, onClose, title, ...body }: ConfirmDialogProps) => {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <ConfirmBody onClose={onClose} {...body} />
        </Modal>
    );
};

type BodyProps = Omit<ConfirmDialogProps, "open" | "title">;

const ConfirmBody = ({ onClose, description, warning, icon, tone = "neutral", confirmLabel, pendingText, action, fields }: BodyProps) => {
    const [state, formAction] = useActionState(action, {} as FormState);
    const { notify } = useToast();
    const danger = tone === "danger";

    useEffect(() => {
        if (state.ok) {
            notify("ok", state.mensaje ?? "Listo");
            onClose();
        }
    }, [state, notify, onClose]);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            {Object.entries(fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}

            <div className="flex items-start gap-4">
                <span
                    aria-hidden="true"
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${danger ? "bg-[#f3e6dd] text-(--terracotta)" : "bg-(--yellow)/30 text-(--ink)"}`}
                >
                    {icon}
                </span>

                <p className="pt-1 font-serif text-[16px] leading-[1.6]">{description}</p>
            </div>

            {warning && (
                <div className={`flex items-start gap-2.5 border-l-2 bg-(--cream) p-3.5 text-[12px] leading-relaxed text-(--muted) ${danger ? "border-(--terracotta)" : "border-(--yellow)"}`}>
                    <AlertTriangle size={15} className={`mt-px shrink-0 ${danger ? "text-(--terracotta)" : "text-(--gold)"}`} aria-hidden="true" />
                    <div>{warning}</div>
                </div>
            )}

            {/* Ej.: 409 "No se puede eliminar la categoria porque tiene platos asociados" */}
            {state.mensaje && !state.ok && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <SubmitButton variant={danger ? "danger" : "primary"} pendingText={pendingText ?? "Procesando…"}>
                    {confirmLabel}
                </SubmitButton>
            </div>
        </form>
    );
};
