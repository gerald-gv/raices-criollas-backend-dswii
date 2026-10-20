"use server"

import { revalidatePath } from "next/cache";
import { EstadoPedido, ESTADOS_PEDIDO, ItemCarritoSync } from "../types/pedidos";
import { agregarAlCarrito, cancelarMiPedido, getCarritoSeguro, reemplazarCarrito, vaciarCarrito } from "../lib/pedidos";
import { getSession } from "../lib/session";
import { mensajeDe } from "../lib/action-errors";
import { FormState } from "../types/menu";
import { redirect } from "next/navigation";
import { cambiarEstadoPedido } from "../lib/admin-pedidos";


export interface CarritoActionResult {
    ok: boolean;
    mensaje?: string;
    requiereLogin?: boolean;
    items?: ItemCarritoSync[];
}

export interface ContinuarCompraResult {
    ok: false;
    mensaje: string;
    noDisponibles?: number[];
}

function refreshPedidos() {
    revalidatePath("/carrito");
    revalidatePath("/mis-pedidos");
    revalidatePath("/admin/pedidos");
}

// CARRITO 

// Carga el carrito guardado en la cuenta (al iniciar sesion), sirve para el contador del Header
export async function cargarCarritoAction(): Promise<ItemCarritoSync[]> {
    const carrito = await getCarritoSeguro();
    return carrito ? carrito.items.map((i) => ({ platoId: i.platoId, cantidad: i.cantidad })) : [];
}

export async function agregarAlCarritoAction(platoId: number, cantidad = 1): Promise<CarritoActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, requiereLogin: true };

    if (!Number.isInteger(platoId) || platoId <= 0) return { ok: false, mensaje: "Plato no válido." };

    try {
        const carrito = await agregarAlCarrito(platoId, cantidad);
        return {
            ok: true,
            mensaje: "Añadido a tu pedido.",
            items: carrito.items.map((i) => ({ platoId: i.platoId, cantidad: i.cantidad })),
        };
    } catch (error) {
        return { ok: false, mensaje: mensajeDe(error) };
    }
}

export async function vaciarCarritoAction(): Promise<FormState> {
    try {
        await vaciarCarrito();
    } catch (error) {
        return { mensaje: mensajeDe(error) };
    }

    revalidatePath("/carrito");
    return { ok: true, mensaje: "Tu pedido quedó vacío." };
}

// Guarda en la cuenta lo que el cliente dejó en pantalla (cantidades y platos quitados), sin revisar disponibilidad
export async function sincronizarCarritoAction(items: ItemCarritoSync[]): Promise<{ ok: boolean }> {
    const validos =
        Array.isArray(items) &&
        items.length <= 50 &&
        items.every((i) => Number.isInteger(i.platoId) && i.platoId > 0 && Number.isInteger(i.cantidad) && i.cantidad >= 1 && i.cantidad <= 99);

    if (!validos) return { ok: false };

    try {
        if (items.length === 0) await vaciarCarrito();
        else await reemplazarCarrito(items.map(({ platoId, cantidad }) => ({ platoId, cantidad })));
        return { ok: true };
    } catch {
        return { ok: false };
    }
}

// "Continuar compra", envia el carrito tal como quedo en pantalla y revisa que todos los platos
// sigan disponibles, mo crea ningun pedido, eso ocurre recien al pulsar "Realizar pago"
export async function continuarCompraAction(items: ItemCarritoSync[]): Promise<ContinuarCompraResult> {
    const validos =
        Array.isArray(items) &&
        items.length > 0 &&
        items.length <= 50 &&
        items.every((i) => Number.isInteger(i.platoId) && i.platoId > 0 && Number.isInteger(i.cantidad) && i.cantidad >= 1 && i.cantidad <= 99);

    if (!validos) return { ok: false, mensaje: "Revisa las cantidades de tu pedido." };

    try {
        const carrito = await reemplazarCarrito(items.map(({ platoId, cantidad }) => ({ platoId, cantidad })));
        const caidos = carrito.items.filter((i) => !i.disponible).map((i) => i.platoId);

        if (caidos.length > 0) {
            return {
                ok: false,
                mensaje: caidos.length === 1
                    ? "Un plato ya no está disponible. Quítalo de tu pedido para continuar."
                    : `${caidos.length} platos ya no están disponibles. Quítalos de tu pedido para continuar.`,
                noDisponibles: caidos,
            };
        }
    } catch (error) {
        return { ok: false, mensaje: mensajeDe(error) };
    }

    redirect("/carrito/continuar");
}

// Pedidos del cliente 

export async function cancelarMiPedidoAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = Number(formData.get("id"));
    if (!id) return { mensaje: "Pedido no válido." };

    try {
        await cancelarMiPedido(id);
    } catch (error) {
        return { mensaje: mensajeDe(error) };
    }

    refreshPedidos();
    return { ok: true, mensaje: "Tu pedido ha sido cancelado." };
}

// Administrador 

export async function cambiarEstadoPedidoAdminAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = Number(formData.get("id"));
    const estado = String(formData.get("estado") ?? "") as EstadoPedido;

    if (!id) return { mensaje: "Pedido no identificado." };
    if (!ESTADOS_PEDIDO.includes(estado)) return { mensaje: "El estado seleccionado no es válido." };

    try {
        await cambiarEstadoPedido(id, estado);
    } catch (error) {
        // 409: el pedido ya cambió de estado (otro admin, el cliente lo canceló o ya estaba pagado)
        return { mensaje: mensajeDe(error) };
    }

    refreshPedidos();
    return { ok: true, mensaje: `Pedido #${id} actualizado a ${estado}.` };
}
