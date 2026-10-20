"use client"

import { actualizarPerfil } from "@/app/actions/perfil";
import { useActionState, useEffect, useRef, useState } from "react";
import { useToast } from "../ui/Toast";
import { FormState } from "@/app/types/menu";
import { Perfil } from "@/app/types/auth";
import { Field, inputClass } from "../ui/field";
import { AlertCircle } from "lucide-react";
import { EditActions } from "./EditActions";
import { NOMBRE_PATTERN, NOMBRE_TITLE, TELEFONO_PATTERN, TELEFONO_TITLE } from "@/app/lib/validaciones";

interface FormularioProps {
    perfil: Perfil;
    editando: boolean;
    onEditar: () => void;
    onCancelar: () => void;
    onGuardado: () => void;
}

const Formulario = ({ perfil, editando, onEditar, onCancelar, onGuardado }: FormularioProps) => {
    const [state, formAction] = useActionState(actualizarPerfil, {} as FormState);
    const { notify } = useToast();

    const guardadoRef = useRef(onGuardado);
    useEffect(() => {
        guardadoRef.current = onGuardado;
    });

    useEffect(() => {
        if (!state.ok) return;
        notify("ok", state.mensaje ?? "Datos actualizados");
        guardadoRef.current();
    }, [state, notify]);

    const error = (name: string) => state.errores?.[name];

    // Si la accion fallo se muestra lo que escribio; si no, lo guardado
    const value = (name: "nombre" | "apellido" | "telefono", fallback: string) => state.valores ? (state.valores[name] ?? "") : fallback;

    const campo = editando ? inputClass : `${inputClass} cursor-default bg-(--cream) focus:border-(--line)`;

    return (
        <form action={formAction} className="flex flex-col gap-5 border border-(--line) bg-(--paper) p-7 sm:p-9">

            <div>
                <h2 className="font-serif text-[26px] font-normal leading-none tracking-tighter">Mis datos</h2>
                <p className="mt-2 text-[12px] text-(--muted)">Así aparecerás en tus reservas.</p>
            </div>

            {state.mensaje && !state.ok && (

                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>

            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <Field label="Nombre" htmlFor="perfil-nombre" error={error("nombre")}>
                    <input id="perfil-nombre" name="nombre" required maxLength={100} autoComplete="given-name" pattern={NOMBRE_PATTERN} title={NOMBRE_TITLE} readOnly={!editando}
                        defaultValue={value("nombre", perfil.nombre)} aria-invalid={!!error("nombre")} className={campo} />
                </Field>

                <Field label="Apellido" htmlFor="perfil-apellido" error={error("apellido")}>
                    <input id="perfil-apellido" name="apellido" required maxLength={100} autoComplete="family-name" pattern={NOMBRE_PATTERN} title={NOMBRE_TITLE} readOnly={!editando}
                        defaultValue={value("apellido", perfil.apellido)} aria-invalid={!!error("apellido")} className={campo} />
                </Field>

            </div>

            <Field label="Correo electrónico" htmlFor="perfil-email" hint="Es tu usuario para ingresar, por eso no se puede cambiar aquí.">
                <input id="perfil-email" type="email" value={perfil.email} readOnly disabled className={`${inputClass} cursor-not-allowed bg-(--cream) text-(--muted)`} />
            </Field>

            <Field label="Teléfono (opcional)" htmlFor="perfil-telefono" error={error("telefono")}>
                <input id="perfil-telefono" name="telefono" type="tel" maxLength={20} inputMode="tel" autoComplete="tel" pattern={TELEFONO_PATTERN} title={TELEFONO_TITLE} readOnly={!editando}
                    defaultValue={value("telefono", perfil.telefono ?? "")} aria-invalid={!!error("telefono")} className={campo} />
            </Field>

            <EditActions editando={editando} onEditar={onEditar} onCancelar={onCancelar} submitLabel="Guardar cambios" />

        </form>
    );
};

export const ProfileForm = ({ perfil }: { perfil: Perfil }) => {
    const [editando, setEditando] = useState(false);
    const [version, setVersion] = useState(0);

    const editar = () => {
        setEditando(true);
        requestAnimationFrame(() => document.getElementById("perfil-nombre")?.focus());
    };

    return (
        <Formulario
            key={version}
            perfil={perfil}
            editando={editando}
            onEditar={editar}
            onCancelar={() => { setEditando(false); setVersion((v) => v + 1); }}
            onGuardado={() => setEditando(false)}
        />
    );
};
