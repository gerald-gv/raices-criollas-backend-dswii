"use server"

import { clearSessionCookie, decodeToken, setSessionCookie } from "../lib/session";
import { AuthState, TokenResponse } from "../types/auth";
import { ApiError, apiRequest, getFieldErrors } from "../lib/api";
import { redirect } from "next/navigation";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

// Solo rutas internas, evita que ?next= mande al usuario a otro sitio
function safeNext(value: string): string | undefined {
    return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : undefined;
}

function toState(error: unknown, valores: Record<string, string>): AuthState {
    const errores = getFieldErrors(error);
    if (errores) return { mensaje: "Revisa los datos marcados.", errores, valores };

    if (error instanceof ApiError) return { mensaje: error.message, valores };
    return { mensaje: "Ocurrió un error inesperado. Inténtalo de nuevo.", valores };
}

// Guarda el JWT en cookie httpOnly y manda al usuario segun su rol
async function startSession(token: TokenResponse, next?: string): Promise<never> {
    await setSessionCookie(token.accessToken, token.expiresIn);

    const isAdmin = decodeToken(token.accessToken)?.isAdmin ?? false;
    const target = next && (isAdmin || !next.startsWith("/admin")) ? next : isAdmin ? "/admin" : "/";

    redirect(target);
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {

    const email = text(formData, "email");
    const password = String(formData.get("password") ?? "");
    const next = safeNext(text(formData, "next"));

    if (!email || !password) {
        return { mensaje: "Ingresa tu correo y tu contraseña.", valores: { email } };
    }

    let token: TokenResponse;
    try {
        token = await apiRequest<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password } });
    } catch (error) {
        return toState(error, { email });
    }

    return startSession(token, next);
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {

    const valores = {
        nombre: text(formData, "nombre"),
        apellido: text(formData, "apellido"),
        email: text(formData, "email"),
        telefono: text(formData, "telefono"),
    };

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
        return { mensaje: "Revisa los datos marcados.", errores: { confirm: "Las contraseñas no coinciden" }, valores };
    }

    let token: TokenResponse;

    try {

        token = await apiRequest<TokenResponse>("/api/auth/register", { method: "POST",
            body: { ...valores, telefono: valores.telefono || null, password },
        });
        
    } catch (error) {
        return toState(error, valores);
    }

    return startSession(token);
}

export async function logout() {
    await clearSessionCookie();
    redirect("/");
}
