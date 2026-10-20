"use client"

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { guardarDireccion } from "@/app/actions/perfil";
import { Perfil } from "@/app/types/auth";
import { FormState } from "@/app/types/menu";
import { Field, inputClass } from "../ui/field";
import { SubmitButton } from "../ui/SubmitButton";
import { useToast } from "../ui/Toast";
import { EditActions } from "./EditActions";
import { NOMBRE_PATTERN, NOMBRE_TITLE, TELEFONO_PATTERN, TELEFONO_TITLE } from "@/app/lib/validaciones";

interface DireccionFormProps {
    perfil: Perfil;
    bare?: boolean;
    onSaved?: () => void;
}

interface FormularioProps extends DireccionFormProps {
    editando: boolean;
    puedeCancelar: boolean;
    onEditar: () => void;
    onCancelar: () => void;
    onGuardado: () => void;
}

const Formulario = ({ perfil, bare = false, editando, puedeCancelar, onEditar, onCancelar, onGuardado }: FormularioProps) => {
    const [state, formAction] = useActionState(guardarDireccion, {} as FormState);
    const { notify } = useToast();

    const guardadoRef = useRef(onGuardado);
    useEffect(() => {
        guardadoRef.current = onGuardado;
    });

    useEffect(() => {
        if (!state.ok) return;
        notify("ok", state.mensaje ?? "Dirección guardada");
        guardadoRef.current();
    }, [state, notify]);

    const error = (name: string) => state.errores?.[name];

    const value = (name: "direccion" | "distrito" | "referencia" | "telefono", fallback: string | null) => state.valores ? (state.valores[name] ?? "") : (fallback ?? "");

    const campo = editando ? inputClass : `${inputClass} cursor-default bg-(--cream) focus:border-(--line)`;

    return (
        <form action={formAction} className={`flex flex-col gap-5 ${bare ? "" : "border border-(--line) bg-(--paper) p-7 sm:p-9"}`}>

            {!bare && (
                <div>
                    <h2 className="font-serif text-[26px] font-normal leading-none tracking-tighter">Dirección de entrega</h2>
                    <p className="mt-2 text-[12px] text-(--muted)">Aquí te llevaremos tus pedidos.</p>
                </div>
            )}

            {state.mensaje && !state.ok && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            <Field label="Dirección" htmlFor="dir-direccion" error={error("direccion")}>
                <input id="dir-direccion" name="direccion" required minLength={5} maxLength={200} autoComplete="street-address" readOnly={!editando}
                    placeholder={editando ? "Av. Los Olivos 123, Dpto. 402" : undefined}
                    defaultValue={value("direccion", perfil.direccion)} aria-invalid={!!error("direccion")} className={campo} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Distrito" htmlFor="dir-distrito" error={error("distrito")}>
                    <input id="dir-distrito" name="distrito" required maxLength={100} autoComplete="address-level2" pattern={NOMBRE_PATTERN} title={NOMBRE_TITLE} readOnly={!editando}
                        defaultValue={value("distrito", perfil.distrito)} aria-invalid={!!error("distrito")} className={campo} />
                </Field>

                <Field label="Teléfono de contacto" htmlFor="dir-telefono" error={error("telefono")}>
                    <input id="dir-telefono" name="telefono" type="tel" required maxLength={20} inputMode="tel" autoComplete="tel" pattern={TELEFONO_PATTERN} title={TELEFONO_TITLE} readOnly={!editando}
                        defaultValue={value("telefono", perfil.telefono)} aria-invalid={!!error("telefono")} className={campo} />
                </Field>
            </div>

            <Field label="Referencia (opcional)" htmlFor="dir-referencia" error={error("referencia")}
                hint={editando ? "Ayuda al repartidor a encontrarte: color de la puerta, cerca de…" : undefined}>
                <input id="dir-referencia" name="referencia" maxLength={200} readOnly={!editando}
                    defaultValue={value("referencia", perfil.referencia)} aria-invalid={!!error("referencia")} className={campo} />
            </Field>

            {bare ? (
                <div className="flex justify-end">
                    <SubmitButton pendingText="Guardando…">Guardar dirección</SubmitButton>
                </div>
            ) : (
                <EditActions editando={editando} onEditar={onEditar} onCancelar={onCancelar} submitLabel="Guardar dirección" puedeCancelar={puedeCancelar} />
            )}

        </form>
    );
};

export const DireccionForm = ({ perfil, bare = false, onSaved }: DireccionFormProps) => {
    const tieneDireccion = Boolean(perfil.direccion && perfil.distrito && perfil.telefono);

    const [editando, setEditando] = useState(bare || !tieneDireccion);
    const [version, setVersion] = useState(0);

    const editar = () => {
        setEditando(true);
        requestAnimationFrame(() => document.getElementById("dir-direccion")?.focus());
    };

    return (
        <Formulario
            key={version}
            perfil={perfil}
            bare={bare}
            editando={editando}
            puedeCancelar={tieneDireccion}
            onEditar={editar}
            onCancelar={() => { setEditando(false); setVersion((v) => v + 1); }}
            onGuardado={() => {
                if (!bare) setEditando(false);
                onSaved?.();
            }}
        />
    );
};
