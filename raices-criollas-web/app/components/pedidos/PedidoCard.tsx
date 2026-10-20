"use client"

import { useState } from "react";
import { formatFechaPedido, formatPrice } from "@/app/lib/format";
import { Pedido } from "@/app/types/pedidos";
import { Calendar, ChevronDown, MapPin, XCircle } from "lucide-react";
import { PedidoEstadoBadge } from "./PedidosEstadoBadge";
import { PagarPedidoButton } from "./PagarPedidoButton";
import { ConfirmDialog } from "../admin/ConfirmDialog";
import { cancelarMiPedidoAction } from "@/app/actions/pedidos";

export const PedidoCard = ({ pedido }: { pedido: Pedido }) => {
    const [openCancel, setOpenCancel] = useState(false);
    const platos = pedido.detalles.reduce((suma, d) => suma + d.cantidad, 0);

    // Mientras no se haya pagado el cliente puede pagar o cancelar; ya pagado, lo gestiona el local
    const pendientePago = pedido.estado === "PENDIENTE_PAGO";

    return (
        <article className="flex flex-col justify-between rounded-sm border border-(--line) bg-(--paper) p-6 transition-all duration-200 hover:border-(--ink)/30 hover:shadow-[0_8px_24px_rgba(38,37,31,0.06)]">
            <div>
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-(--line) pb-4">
                    <div>
                        <h3 className="font-serif text-[20px] font-normal leading-tight text-(--ink)">Pedido #{pedido.id}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-(--muted)">
                            <Calendar size={12} className="text-(--terracotta)" aria-hidden="true" />
                            {formatFechaPedido(pedido.fecha)}
                        </p>
                    </div>

                    <PedidoEstadoBadge estado={pedido.estado} />
                </div>

                <details className="group mt-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold text-(--ink) marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) [&::-webkit-details-marker]:hidden">
                        <span>{platos} {platos === 1 ? "plato" : "platos"}</span>
                        <span className="inline-flex items-center gap-1 text-(--muted)">
                            Ver detalle
                            <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                        </span>
                    </summary>

                    <ul className="mt-3 divide-y divide-(--line) border-t border-(--line) text-[13px]">
                        {pedido.detalles.map((d) => (
                            <li key={d.platoId} className="flex items-baseline justify-between gap-3 py-2.5">
                                <span className="min-w-0">
                                    <strong className="font-bold">{d.cantidad}×</strong> {d.nombrePlato}
                                </span>
                                <span className="shrink-0 text-(--muted)">{formatPrice(d.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                </details>

                {pedido.direccionEntrega && (
                    <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-(--muted)">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-(--terracotta)" aria-hidden="true" />
                        <span>{pedido.direccionEntrega}</span>
                    </p>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-(--line) pt-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">Total</p>
                    <p className="font-serif text-[22px] leading-none tracking-[-0.04em] text-(--terracotta)">{formatPrice(pedido.total)}</p>
                </div>

                {pendientePago ? (
                    <div className="flex flex-wrap items-start justify-end gap-2">
                        <button type="button" onClick={() => setOpenCancel(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-(--terracotta)/40 px-3 py-1.5 text-[11px] font-extrabold text-(--terracotta) transition-colors hover:bg-(--terracotta) hover:text-white focus-visible:outline-2 focus-visible:outline-(--terracotta)">
                            <XCircle size={14} aria-hidden="true" />
                            Cancelar
                        </button>
                        <PagarPedidoButton pedidoId={pedido.id} />
                    </div>
                ) : (
                    <span className="text-[11px] italic text-(--muted)">
                        {pedido.estado === "CANCELADO" ? "Cancelado" : pedido.estado === "ENTREGADO" ? "Pedido entregado" : pedido.estado === "ENVIANDO" ? "En camino" : pedido.estado === "PAGADO" ? "Pagado" : "En curso"}
                    </span>
                )}
            </div>

            <ConfirmDialog open={openCancel} onClose={() => setOpenCancel(false)} title="Cancelar pedido" tone="danger" icon={<XCircle size={20} />}
                description={<>¿Deseas cancelar tu pedido #{pedido.id} por {formatPrice(pedido.total)}?</>}
                warning="Solo puedes cancelarlo mientras no lo hayas pagado. Esta acción no se puede deshacer."
                confirmLabel="Sí, cancelar pedido"
                pendingText="Cancelando…"
                action={cancelarMiPedidoAction}
                fields={{ id: String(pedido.id) }}
            />
        </article>
    );
};
