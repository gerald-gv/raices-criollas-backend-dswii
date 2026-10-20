import { unstable_rethrow } from "next/navigation";
import { ApiError, getFieldErrors } from "./api";

export function mensajeDe(error: unknown): string {
    unstable_rethrow(error);

    const errores = getFieldErrors(error);
    if (errores) return Object.values(errores)[0] ?? "Revisa los datos enviados.";

    if (error instanceof ApiError) return error.message;
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
