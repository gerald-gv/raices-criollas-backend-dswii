import { getToken } from "./session";
import { ApiError, apiRequest } from "./api";
import { redirect } from "next/navigation";
import { Carrito, ItemCarritoSync, Pedido } from "../types/pedidos";

const PEDIDOS_PREFIX = "/api/pedidos";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function pedidosApi<T>(path: string, method: Method = "GET", body?: unknown, redirectUrl = "/carrito"): Promise<T> {
    const token = await getToken();

    if (!token) {
        redirect(`/login?next=${encodeURIComponent(redirectUrl)}`);
    }

    try {
        return await apiRequest<T>(`${PEDIDOS_PREFIX}${path}`, { method, body, token, revalidate: false });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect(`/login?expired=1&next=${encodeURIComponent(redirectUrl)}`);
        }
        throw error;
    }
}

export const getCarrito = () => pedidosApi<Carrito>("/carrito");

// Añadir al pedido desde la carta, suma una unidad
export const agregarAlCarrito = (platoId: number, cantidad = 1) => pedidosApi<Carrito>("/carrito/items", "POST", { platoId, cantidad });

// Sincroniza el carrito completo tal como quedo en pantalla, devuelve cada plato con su disponibilidad actual
export const reemplazarCarrito = (items: ItemCarritoSync[]) => pedidosApi<Carrito>("/carrito", "PUT", { items });

export const vaciarCarrito = () => pedidosApi<Carrito>("/carrito", "DELETE");

// Crea el pedido PENDIENTE_PAGO con los precios de hoy
export const confirmarCarrito = () => pedidosApi<Pedido>("/carrito/confirmar", "POST");

export const verificarStockPedido = (id: number) => pedidosApi<null>(`/${id}/verificar-stock`, "POST", undefined, "/mis-pedidos");

export const getMisPedidos = () => pedidosApi<Pedido[]>("/mis-pedidos", "GET", undefined, "/mis-pedidos");

export const cancelarMiPedido = (id: number) => pedidosApi<Pedido>(`/${id}/cancelar`, "PATCH", undefined, "/mis-pedidos");

export async function getCarritoSeguro(): Promise<Carrito | null> {
    const token = await getToken();
    if (!token) return null;

    try {
        return await apiRequest<Carrito>(`${PEDIDOS_PREFIX}/carrito`, { token, revalidate: false });
    } catch {
        return null;
    }
}
