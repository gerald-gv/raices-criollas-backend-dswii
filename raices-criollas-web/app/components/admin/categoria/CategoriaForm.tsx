"use client"

import { guardarCategoria } from "@/app/actions/menu";
import { Categoria, FormState } from "@/app/types/menu";
import { useActionState, useEffect } from "react";
import { useToast } from "../../ui/Toast";
import { AlertCircle } from "lucide-react";
import { Field, inputClass } from "../../ui/field";
import { Button } from "../../ui/button";
import { SubmitButton } from "../../ui/SubmitButton";

interface CategoriaFormProps {
    categoria?: Categoria;
    onClose: () => void;
}

export const CategoriaForm = ({ categoria, onClose }: CategoriaFormProps) => {
    const [state, formAction] = useActionState(guardarCategoria, {} as FormState);
    const { notify } = useToast();

    useEffect(() => {
        if (state.ok) {
            notify("ok", state.mensaje ?? "Guardado");
            onClose();
        }
    }, [state, notify, onClose]);

    const error = (name: string) => state.errores?.[name];

    // Tras un error se muestra lo que el admin habia escrito, si no, los valores guardados
    const value = (name: string, fallback: string) => state.valores ? (state.valores[name] ?? "") : fallback;

    return (
        <form action={formAction} className="flex flex-col gap-5">
            {categoria && <input type="hidden" name="id" value={categoria.id} />}

            {state.mensaje && !state.ok && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            <Field label="Nombre" htmlFor="categoria-nombre" error={error("nombre")}>
                <input id="categoria-nombre" name="nombre" required minLength={3} maxLength={100} defaultValue={value("nombre", categoria?.nombre ?? "")} placeholder="Ej.: Platos de fondo" aria-invalid={!!error("nombre")} className={inputClass} />
            </Field>

            <Field label="Descripción" htmlFor="categoria-descripcion" error={error("descripcion")} hint="Se muestra bajo el título de la categoría en la carta.">
                <textarea id="categoria-descripcion" name="descripcion" rows={3} maxLength={255} defaultValue={value("descripcion", categoria?.descripcion ?? "")} aria-invalid={!!error("descripcion")} className={`${inputClass} resize-y`} />
            </Field>

            <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="activo" defaultChecked={state.valores ? state.valores.activo === "on" : (categoria?.activo ?? true)} className="mt-0.5 size-4 accent-(--terracotta)" />
                <span>
                    <span className="block text-[13px] font-bold">Categoría activa</span>
                    <span className="block text-[12px] text-(--muted)">Si la desactivas, la categoría y sus platos dejan de verse en la carta.</span>
                </span>
            </label>

            <div className="mt-1 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <SubmitButton>{categoria ? "Guardar cambios" : "Crear categoría"}</SubmitButton>
            </div>
        </form>
    );
};
