"use client"

import { useActionState, useEffect, useState } from "react";
import { useToast } from "../ui/Toast";
import { cambiarPassword } from "@/app/actions/perfil";
import { FormState } from "@/app/types/menu";
import { Field, inputClass } from "../ui/field";
import { SubmitButton } from "../ui/SubmitButton";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export const PasswordForm = () => {
    const [state, formAction] = useActionState(cambiarPassword, {} as FormState);
    const [visible, setVisible] = useState(false);
    const { notify } = useToast();

    useEffect(() => {
        if (state.ok) notify("ok", state.mensaje ?? "Contraseña actualizada");
    }, [state, notify]);

    const error = (name: string) => state.errores?.[name];
    const type = visible ? "text" : "password";

    return (
        <form action={formAction} className="flex flex-col gap-5 border border-(--line) bg-(--paper) p-7 sm:p-9">

            <div className="flex items-start justify-between gap-4">

                <div>
                    <h2 className="font-serif text-[26px] font-normal leading-none tracking-tighter">Cambiar contraseña</h2>
                    <p className="mt-2 text-[12px] text-(--muted)">Usa al menos 8 caracteres.</p>
                </div>

                <button type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
                    className="flex cursor-pointer items-center gap-1.5 text-[12px] font-extrabold text-(--muted) transition-colors hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)">
                    {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    {visible ? "Ocultar" : "Mostrar"}
                </button>

            </div>

            {state.mensaje && !state.ok && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            <Field label="Contraseña actual" htmlFor="pass-actual" error={error("passwordActual")}>
                <input id="pass-actual" name="passwordActual" type={type} required autoComplete="current-password"
                    aria-invalid={!!error("passwordActual")} className={inputClass} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <Field label="Nueva contraseña" htmlFor="pass-nueva" error={error("passwordNueva")}>
                    <input id="pass-nueva" name="passwordNueva" type={type} required minLength={8} autoComplete="new-password"
                        aria-invalid={!!error("passwordNueva")} className={inputClass} />
                </Field>

                <Field label="Repite la nueva" htmlFor="pass-confirmar" error={error("confirmar")}>
                    <input id="pass-confirmar" name="confirmar" type={type} required minLength={8} autoComplete="new-password"
                        aria-invalid={!!error("confirmar")} className={inputClass} />
                </Field>

            </div>

            <div className="flex justify-end">
                <SubmitButton variant="outline" pendingText="Cambiando…">Cambiar contraseña</SubmitButton>
            </div>

        </form>
    );
};