import { ApiResponse } from "../types/ApiResponse";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
export { API_URL };

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly data?: unknown,  // En errores 400 de validacion, el backend manda { campo: mensaje } en "data"
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = "ApiError";
    }
}

// Errores de validacion por campo  o undefined si no aplica
export function getFieldErrors(error: unknown): Record<string, string> | undefined {
    if (error instanceof ApiError && error.status === 400 && error.data && typeof error.data === "object") {
        return error.data as Record<string, string>;
    }
    return undefined;
}

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
    revalidate?: number | false;
    headers?: Record<string, string>; // ej. Idempotency-Key del pago
}

// Todas las peticiones pasan por el gateway y devuelven solo el data de ApiResponse
export async function apiRequest<T>(path: string, { method = "GET", body, token, revalidate = false, headers: extra }: RequestOptions = {}): Promise<T> {


    const headers: Record<string, string> = { Accept: "application/json", ...extra };

    if (body !== undefined) headers["Content-Type"] = "application/json";

    if (token) headers.Authorization = `Bearer ${token}`;

    const init: RequestInit = {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    };

    if (revalidate === false) {
        init.cache = "no-store";
    } else {
        (init as RequestInit & { next?: { revalidate: number } }).next = { revalidate };
    }

    let res: Response;
    
    try {
        res = await fetch(`${API_URL}${path}`, init);
    } catch {
        throw new ApiError("No se pudo conectar con el servidor", 503); // En caso no responda, lanza ApiError
    }

    let parsed: ApiResponse<T> | null = null;

    try {
        parsed = (await res.json()) as ApiResponse<T>;
    } catch {
        // 401/403 de Spring Security llegan sin cuerpo JSON
    }

    if (!res.ok || !parsed?.success) {

        const fallback = res.status === 401 ? "Tu sesión expiró. Vuelve a iniciar sesión." : res.status === 403 ? "No tienes permisos para esta acción." : `Error ${res.status}`;
        
        throw new ApiError(parsed?.mensaje ?? fallback, res.status, parsed?.data);
    }

    return parsed.data;
}




// Se obtiene el gateway y este como respuesta devuelve data
export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {

    let res: Response;
    const url = `${API_URL}${path}`;
    console.log("[apiGet] URL solicitada:", url);
    try {
        res = await fetch(`${API_URL}${path}`, {
            headers: { Accept: "application/json" },
            next: { revalidate },
        });
    } catch {
        throw new ApiError("No se pudo conectar con el servidor", 503); // En caso no responsa, lanza ApiError
    }

    let body: ApiResponse<T> | null = null;
    try {
        body = (await res.json()) as ApiResponse<T>;
    } catch {
    }

    if (!res.ok || !body?.success) {
        throw new ApiError(body?.mensaje ?? `Error ${res.status}`, res.status);
    }

    return body.data;
}
