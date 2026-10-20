import { redirect } from "next/navigation";
import { getToken } from "./session";
import { ApiError, apiRequest } from "./api";
import { EstadoPedido, FiltrosAdminPedidos, Pedido } from "../types/pedidos";
import { Pagina } from "../types/menu";

const PEDIDOS_PREFIX = "/api/pedidos";
const ADMIN_URL = "/admin/pedidos";

async function adminPedidosApi<T>(path: string, method: "GET" | "PATCH" = "GET", body?: unknown): Promise<T> {
    const token = await getToken();

    if (!token) {
        redirect(`/login?next=${ADMIN_URL}`);
    }

    try {
        return await apiRequest<T>(`${PEDIDOS_PREFIX}${path}`, { method, body, token, revalidate: false });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect(`/login?expired=1&next=${ADMIN_URL}`);
        }
        throw error;
    }
}

export async function listAdminPedidos({ estado, page = 1, size = 10 }: FiltrosAdminPedidos = {}): Promise<Pagina<Pedido>> {
    const params = new URLSearchParams({ page: String(Math.max(page - 1, 0)), size: String(size) });
    if (estado) params.set("estado", estado);

    return adminPedidosApi<Pagina<Pedido>>(`/admin?${params}`);
}

export const cambiarEstadoPedido = (id: number, estado: EstadoPedido) => adminPedidosApi<Pedido>(`/admin/${id}/estado`, "PATCH", { estado });
