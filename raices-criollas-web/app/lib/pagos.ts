import { redirect } from "next/navigation";
import { getToken } from "./session";
import { ApiError, apiRequest } from "./api";
import { Pago } from "../types/pagos";

const PAGOS_PREFIX = "/api/payment";

async function pagosApi<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown, headers?: Record<string, string>, volverA = "/mis-pedidos"): Promise<T> {
    const token = await getToken();

    if (!token) {
        redirect(`/login?next=${encodeURIComponent(volverA)}`);
    }

    try {
        return await apiRequest<T>(`${PAGOS_PREFIX}${path}`, { method, body, token, headers, revalidate: false });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            redirect(`/login?expired=1&next=${encodeURIComponent(volverA)}`);
        }
        throw error;
    }
}

// La clave es fija por pedido, si se repite la llamada (doble clic, "Pagar ahora" otra vez), el backend devuelve
// el mismo pago con la misma URL de Mercado Pago en vez de crear otro cobro.
export const crearPago = (pedidoId: number) => pagosApi<Pago>("/pagos", "POST", { pedidoId }, { "Idempotency-Key": `pedido-${pedidoId}` });

// Igual para reservas, una reserva tiene un solo plazo de pago, así que la clave por reserva es suficiente.
export const crearPagoReserva = (reservaId: number) => pagosApi<Pago>("/pagos", "POST", { reservaId }, { "Idempotency-Key": `reserva-${reservaId}` }, "/mis-reservas");

export const getPago = (id: number) => pagosApi<Pago>(`/pagos/${id}`);
