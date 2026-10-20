import { getToken } from "./session";
import { ApiError, apiRequest } from "./api";
import { redirect } from "next/navigation";
import { ActualizarDireccionInput, ActualizarPerfilInput, CambiarPasswordInput, Perfil } from "../types/auth";

const AUTH = "/api/auth/me";

// Todas las llamadas llevan el JWT de la cookie. Sin sesion o con token vencido, al login
async function perfilApi<T>(path: string, method: "GET" | "PUT" = "GET", body?: unknown): Promise<T> {
    
    const token = await getToken();
    if (!token) redirect("/login?next=/cuenta");

    try {
        return await apiRequest<T>(`${AUTH}${path}`, { method, body, token });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect("/login?expired=1&next=/cuenta");
        }
        throw error;
    }
}

export const getPerfil = () => perfilApi<Perfil>("");

export const updatePerfil = (input: ActualizarPerfilInput) => perfilApi<Perfil>("", "PUT", input);

export const updateDireccion = (input: ActualizarDireccionInput) => perfilApi<Perfil>("/direccion", "PUT", input);

export const changePassword = (input: CambiarPasswordInput) => perfilApi<null>("/password", "PUT", input);