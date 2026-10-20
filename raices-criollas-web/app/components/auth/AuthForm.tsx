"use client"

import { AuthState } from "@/app/types/auth";
import { Field, inputClass } from "../ui/field";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { login, register } from "@/app/actions/auth";
import Link from "next/link";
import { NOMBRE_PATTERN, NOMBRE_TITLE, TELEFONO_PATTERN, TELEFONO_TITLE } from "@/app/lib/validaciones";

interface AuthFormProps {
    mode: "login" | "register";
    next?: string;
}

const initial: AuthState = {};

export const AuthForm = ({ mode, next }: AuthFormProps) => {
    const isLogin = mode === "login";
    const [state, formAction] = useActionState(isLogin ? login : register, initial);

    const error = (name: string) => state.errores?.[name];
    const value = (name: string) => state.valores?.[name] ?? "";

    return (
        <form action={formAction} className="flex flex-col gap-5">
            {next && <input type="hidden" name="next" value={next} />}

            {state.mensaje && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            {!isLogin && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Nombre" htmlFor="nombre" error={error("nombre")}>
                        <input id="nombre" name="nombre" required maxLength={100} autoComplete="given-name" pattern={NOMBRE_PATTERN} title={NOMBRE_TITLE} defaultValue={value("nombre")} aria-invalid={!!error("nombre")} className={inputClass} />
                    </Field>

                    <Field label="Apellido" htmlFor="apellido" error={error("apellido")}>
                        <input id="apellido" name="apellido" required maxLength={100} autoComplete="family-name" pattern={NOMBRE_PATTERN} title={NOMBRE_TITLE} defaultValue={value("apellido")} aria-invalid={!!error("apellido")} className={inputClass} />
                    </Field>
                </div>
            )}

            <Field label="Correo electrónico" htmlFor="email" error={error("email")}>
                <input id="email" name="email" type="email" required maxLength={150} autoComplete="email" defaultValue={value("email")} placeholder="tucorreo@ejemplo.com" aria-invalid={!!error("email")} className={inputClass} />
            </Field>

            {!isLogin && (
                <Field label="Teléfono (opcional)" htmlFor="telefono" error={error("telefono")}>
                    <input id="telefono" name="telefono" type="tel" maxLength={20} inputMode="tel" autoComplete="tel" pattern={TELEFONO_PATTERN} title={TELEFONO_TITLE} placeholder="987 654 321" defaultValue={value("telefono")} aria-invalid={!!error("telefono")} className={inputClass} />
                </Field>
            )}

            <Field label="Contraseña" htmlFor="password" error={error("password")} hint={isLogin ? undefined : "Mínimo 8 caracteres"}>
                <input id="password" name="password" type="password" required minLength={isLogin ? undefined : 8} autoComplete={isLogin ? "current-password" : "new-password"} aria-invalid={!!error("password")} className={inputClass} />
            </Field>

            {!isLogin && (
                <Field label="Repite la contraseña" htmlFor="confirm" error={error("confirm")}>
                    <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" aria-invalid={!!error("confirm")} className={inputClass} />
                </Field>
            )}

            <SubmitButton pendingText={isLogin ? "Ingresando…" : "Creando cuenta…"} className="mt-1 w-full">
                {isLogin ? "Ingresar" : "Crear cuenta"}
            </SubmitButton>

            <p className="text-center text-[12px] text-(--muted)">

                {isLogin ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}

                <Link href={isLogin ? "/register" : "/login"} className="font-extrabold text-(--terracotta) underline underline-offset-4">
                    {isLogin ? "Regístrate" : "Ingresa"}
                </Link>
            </p>
        </form>
    );
};
