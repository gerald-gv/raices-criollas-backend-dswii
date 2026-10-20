import { redirect } from "next/navigation";
import { getToken } from "./session";
import { Categoria, CategoriaInput, Pagina, Plato, PlatoAdmin, PlatoInput, ResumenMenu } from "../types/menu";
import { API_URL, ApiError, apiRequest } from "./api";

// Ruta del microservicio menu
const MENU = "/api/menu";

interface PageCruda<T> {
    content: T[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
    page?: { totalElements?: number; totalPages?: number; number?: number; size?: number };
}

function normalizarPagina<T>(raw: PageCruda<T>): Pagina<T> {
    const meta = raw.page ?? raw;

    return {
        content: raw.content,
        totalElements: meta.totalElements ?? raw.content.length,
        totalPages: meta.totalPages ?? 1,
        page: meta.number ?? 0,
        size: meta.size ?? raw.content.length,
    };
}

interface PlatosQuery {
    page?: number;
    size?: number;
    sort?: string;
}



// Toda llamada admin lleva el JWT de la cookie, si no hay sesion o el token vencio se redirige al login
async function admin<T>(path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown): Promise<T> {

    const token = await getToken();

    if (!token) redirect("/login?next=/admin");

    try {
        return await apiRequest<T>(`${MENU}${path}`, { method, body, token });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect("/login?expired=1&next=/admin");
        }
        throw error;
    }
}

// ---- Categorias -----
export const listCategorias = () => admin<Categoria[]>("/categorias");

export const getCategoria = (id: number) => admin<Categoria>(`/categorias/admin/${id}`);

export const createCategoria = (input: CategoriaInput) => admin<Categoria>("/categorias", "POST", input);

export const updateCategoria = (id: number, input: CategoriaInput) => admin<Categoria>(`/categorias/${id}`, "PUT", input);

export const deleteCategoria = (id: number) => admin<null>(`/categorias/${id}`, "DELETE");

export const setCategoriaActiva = (id: number, activa: boolean) => admin<null>(`/categorias/${id}/${activa ? "activar" : "desactivar"}`, "PUT");

// ---- Platos ----
export const listPlatos = async ({ page = 0, size = 10, sort }: PlatosQuery = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (sort) params.set("sort", sort);

    return normalizarPagina(await admin<PageCruda<PlatoAdmin>>(`/platos?${params}`));
};

export const getResumen = () => admin<ResumenMenu>("/platos/admin/resumen");

export const getPlato = (id: number) => admin<PlatoAdmin>(`/platos/admin/${id}`);

export const createPlato = (input: PlatoInput) => admin<PlatoAdmin>("/platos", "POST", input);

export const updatePlato = (id: number, input: PlatoInput) => admin<PlatoAdmin>(`/platos/${id}`, "PUT", input);

export const deletePlato = (id: number) => admin<null>(`/platos/${id}`, "DELETE");

export const setPlatoDisponible = (id: number, disponible: boolean) => admin<null>(`/platos/${id}/${disponible ? "activar" : "desactivar"}`, "PUT");

export const setPlatoDestacado = (id: number, destacado: boolean) => admin<null>(`/platos/${id}/${destacado ? "destacar" : "quitar-destacado"}`, "PUT");

// Ajuste de stock, Menu responde 409 si no alcanza el stock y, al llegar a 0, oculta el plato solo
export const reducirStockPlato = (id: number, cantidad: number) => admin<PlatoAdmin>(`/platos/${id}/reducir-stock?cantidad=${cantidad}`, "PUT");

export const reponerStockPlato = (id: number, cantidad: number) => admin<PlatoAdmin>(`/platos/${id}/reponer-stock?cantidad=${cantidad}`, "PUT");

/**
 * Sube una imagen a Cloudinary a través del microservicio de menu.
 * Devuelve la URL segura o lanza ApiError si falla.
 */
export async function subirImagenPlato(archivo: File): Promise<string> {
    const token = await getToken();
    if (!token) redirect("/login?next=/admin");

    const formData = new FormData();
    formData.append("archivo", archivo);

    let res: Response;
    try {
        res = await fetch(`${API_URL}${MENU}/platos/imagen`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            // NO pongas Content-Type: el browser lo genera con el boundary correcto
            body: formData,
        });
    } catch {
        throw new ApiError("No se pudo conectar con el servidor", 503);
    }

    let body: { url?: string; error?: string } | null = null;
    try {
        body = await res.json();
    } catch { /* noop */ }

    if (!res.ok) {
        throw new ApiError(body?.error ?? `Error ${res.status}`, res.status);
    }

    if (!body?.url) throw new ApiError("El servidor no devolvió la URL de la imagen", 500);

    return body.url;
}
