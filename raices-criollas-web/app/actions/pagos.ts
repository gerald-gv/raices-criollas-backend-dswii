"use server"

import { redirect, unstable_rethrow } from "next/navigation";
import { mensajeDe } from "../lib/action-errors";
import { crearPago, crearPagoReserva, getPago } from "../lib/pagos";
import { confirmarCarrito, verificarStockPedido } from "../lib/pedidos";
import { EstadoPago, TipoPago } from "../types/pagos";

export interface PagoActionResult {
    ok: false;
    mensaje: string;
}

export async function realizarPagoAction(): Promise<PagoActionResult> {
    let urlPago: string;

    try {
        const pedido = await confirmarCarrito();
        const pago = await crearPago(pedido.id);

        if (!pago.urlPago) {
            return { ok: false, mensaje: "No se pudo abrir Mercado Pago. Tu pedido quedó en «Mis pedidos»: puedes pagarlo desde ahí." };
        }
        urlPago = pago.urlPago;
    } catch (error) {
        return { ok: false, mensaje: mensajeDe(error) };
    }

    redirect(urlPago);
}

export async function pagarPedidoPendienteAction(pedidoId: number): Promise<PagoActionResult> {
    if (!Number.isInteger(pedidoId) || pedidoId <= 0) return { ok: false, mensaje: "Pedido no válido." };

    let urlPago: string;

    try {
        // Antes de ir a pagar, el stock de este pedido pudo agotarse
        await verificarStockPedido(pedidoId);
        const pago = await crearPago(pedidoId);

        if (!pago.urlPago) return { ok: false, mensaje: "No se pudo abrir Mercado Pago. Inténtalo de nuevo." };
        urlPago = pago.urlPago;
    } catch (error) {
        return { ok: false, mensaje: mensajeDe(error) };
    }

    redirect(urlPago);
}

// Retoma el pago de una reserva que quedo pendiente (mientras no venza su plazo)
// Pagos valida que la reserva sea del usuario y siga pendiente, si ya vencio responde con un mensaje claro
export async function pagarReservaPendienteAction(reservaId: number): Promise<PagoActionResult> {
    if (!Number.isInteger(reservaId) || reservaId <= 0) return { ok: false, mensaje: "Reserva no válida." };

    let urlPago: string;

    try {
        const pago = await crearPagoReserva(reservaId);

        if (!pago.urlPago) return { ok: false, mensaje: "No se pudo abrir Mercado Pago. Inténtalo de nuevo." };
        urlPago = pago.urlPago;
    } catch (error) {
        return { ok: false, mensaje: mensajeDe(error) };
    }

    redirect(urlPago);
}

export interface EstadoPagoResult {
    estado: EstadoPago | null;
    tipo?: TipoPago;
    pedidoId?: number | null;
    reservaId?: number | null;
}

export async function consultarPagoAction(pagoId: number): Promise<EstadoPagoResult> {
    if (!Number.isInteger(pagoId) || pagoId <= 0) return { estado: null };

    try {
        const pago = await getPago(pagoId);
        return { estado: pago.estado, tipo: pago.tipo, pedidoId: pago.pedidoId, reservaId: pago.reservaId };
    } catch (error) {
        unstable_rethrow(error);
        return { estado: null };
    }
}
