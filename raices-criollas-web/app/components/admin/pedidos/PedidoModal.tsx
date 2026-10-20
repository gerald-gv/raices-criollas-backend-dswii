"use client"

import { EstadoPedido, Pedido } from "@/app/types/pedidos";
import { BellRing, ChefHat, MapPin, PackageCheck, Phone, Truck, XCircle } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Modal } from "../../ui/Modal";
import { ConfirmDialog } from "../ConfirmDialog";
import { estadoPedidoLabel, PedidoEstadoBadge } from "../../pedidos/PedidosEstadoBadge";
import { formatFechaPedido, formatPrice } from "@/app/lib/format";
import { cambiarEstadoPedidoAdminAction } from "@/app/actions/pedidos";

export type PedidoModalState =
    | { kind: "detalle"; pedido: Pedido }
    | { kind: "estado"; pedido: Pedido; estado: EstadoPedido }
    | null;

const PedidoModalContext = createContext<((state: NonNullable<PedidoModalState>) => void) | null>(null);

export const useOpenPedidoModal = () => {
    const open = useContext(PedidoModalContext);
    if (!open) throw new Error("Debe usarse dentro de <PedidoModalProvider>");
    return open;
};

// Texto y aspecto de cada cambio de estado
const accion: Record<EstadoPedido, { title: string; confirm: string; pending: string; icon: ReactNode; warning: string; danger?: boolean }> = {
    PENDIENTE_PAGO: { title: "Pendiente de pago", confirm: "Confirmar", pending: "Actualizando…", icon: <PackageCheck size={20} />, warning: "" },
    PAGADO: { title: "Pedido pagado", confirm: "Confirmar", pending: "Actualizando…", icon: <PackageCheck size={20} />, warning: "" },
    PREPARANDO: {
        title: "Empezar a preparar",
        confirm: "Preparar",
        pending: "Actualizando…",
        icon: <ChefHat size={20} />,
        warning: "El pedido ya está pagado: empieza su preparación en cocina.",
    },
    LISTO: {
        title: "Marcar como listo",
        confirm: "Marcar listo",
        pending: "Actualizando…",
        icon: <BellRing size={20} />,
        warning: "El pedido pasa a estar listo para entregarse al cliente.",
    },
    ENVIANDO: {
        title: "Enviar pedido",
        confirm: "Marcar enviando",
        pending: "Actualizando…",
        icon: <Truck size={20} />,
        warning: "El pedido sale hacia la dirección del cliente.",
    },
    ENTREGADO: {
        title: "Marcar como entregado",
        confirm: "Marcar entregado",
        pending: "Actualizando…",
        icon: <PackageCheck size={20} />,
        warning: "Es el último paso del pedido y no se puede revertir.",
    },
    CANCELADO: {
        title: "Cancelar pedido",
        confirm: "Cancelar pedido",
        pending: "Cancelando…",
        icon: <XCircle size={20} />,
        warning: "El pedido queda cancelado de forma definitiva.",
        danger: true,
    },
};

export const PedidoModalProvider = ({ children }: { children: ReactNode }) => {
    const [modal, setModal] = useState<PedidoModalState>(null);

    const open = useCallback((state: NonNullable<PedidoModalState>) => setModal(state), []);
    const close = useCallback(() => setModal(null), []);

    const pedido = modal?.pedido;
    const estado = modal?.kind === "estado" ? modal.estado : undefined;
    const texto = estado ? accion[estado] : undefined;

    return (
        <PedidoModalContext.Provider value={open}>
            {children}

            <Modal open={modal?.kind === "detalle"} onClose={close} title={pedido ? `Pedido #${pedido.id}` : "Pedido"}>
                {pedido && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
                            <span className="text-(--muted)">{formatFechaPedido(pedido.fecha)}</span>
                            <PedidoEstadoBadge estado={pedido.estado} />
                        </div>

                        <p className="text-[12px] text-(--muted)">
                            Cliente: <span className="font-mono font-bold text-(--ink)">{pedido.clienteId}</span>
                        </p>

                        <div className="border border-(--line) bg-(--cream) p-3.5 text-[13px] leading-relaxed">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">Entrega</p>
                            {pedido.direccionEntrega ? (
                                <>
                                    <p className="mt-1.5 flex items-start gap-2 font-bold text-(--ink)">
                                        <MapPin size={14} className="mt-0.5 shrink-0 text-(--terracotta)" aria-hidden="true" />
                                        {pedido.direccionEntrega}
                                    </p>
                                    {pedido.telefonoContacto && (
                                        <p className="mt-1 flex items-center gap-2 text-[12px] text-(--muted)">
                                            <Phone size={13} className="shrink-0" aria-hidden="true" />
                                            {pedido.telefonoContacto}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="mt-1 text-[12px] text-(--muted)">Este pedido no tiene dirección registrada.</p>
                            )}
                        </div>

                        <ul className="divide-y divide-(--line) border-y border-(--line) text-[13px]">
                            {pedido.detalles.map((d) => (
                                <li key={d.platoId} className="flex items-baseline justify-between gap-3 py-3">
                                    <span className="min-w-0">
                                        <strong className="font-bold">{d.cantidad}×</strong> {d.nombrePlato}
                                        <span className="block text-[11px] text-(--muted)">{formatPrice(d.precioUnitario)} c/u</span>
                                    </span>
                                    <span className="shrink-0 font-bold">{formatPrice(d.subtotal)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-baseline justify-between">
                            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-(--muted)">Total</span>
                            <span className="font-serif text-[26px] tracking-[-0.04em] text-(--terracotta)">{formatPrice(pedido.total)}</span>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmDialog open={modal?.kind === "estado"} onClose={close} title={texto?.title ?? "Cambiar estado"}
                icon={texto?.icon ?? <PackageCheck size={20} />}
                tone={texto?.danger ? "danger" : "neutral"}
                description={pedido && estado
                    ? <>El pedido #{pedido.id} pasará de <strong>{estadoPedidoLabel(pedido.estado)}</strong> a <strong>{estadoPedidoLabel(estado)}</strong>.</>
                    : ""}
                warning={texto?.warning || undefined}
                confirmLabel={texto?.confirm ?? "Confirmar"}
                pendingText={texto?.pending}
                action={cambiarEstadoPedidoAdminAction}
                fields={{ id: String(pedido?.id ?? ""), estado: estado ?? "" }}
            />
        </PedidoModalContext.Provider>
    );
};
