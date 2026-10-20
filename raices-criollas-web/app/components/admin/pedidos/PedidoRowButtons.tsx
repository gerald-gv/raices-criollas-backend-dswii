"use client"

import { EstadoPedido, Pedido, TRANSICIONES_PEDIDO } from "@/app/types/pedidos";
import { BellRing, ChefHat, Eye, PackageCheck, Truck, XCircle } from "lucide-react";
import { ReactNode } from "react";
import { useOpenPedidoModal } from "./PedidoModal";

const iconButton = "flex size-8 cursor-pointer items-center justify-center rounded-sm border border-(--line) text-(--muted) transition-colors duration-200 hover:border-(--ink) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";

const destinos: Record<EstadoPedido, { label: string; icon: ReactNode; hover: string } | undefined> = {
    PENDIENTE_PAGO: undefined,
    PAGADO: undefined,
    PREPARANDO: { label: "Empezar a preparar", icon: <ChefHat size={14} aria-hidden="true" />, hover: "hover:border-(--gold)! hover:text-(--gold)!" },
    LISTO: { label: "Marcar como listo", icon: <BellRing size={14} aria-hidden="true" />, hover: "hover:border-(--olive)! hover:text-(--olive)!" },
    ENVIANDO: { label: "Enviar pedido", icon: <Truck size={14} aria-hidden="true" />, hover: "hover:border-[#6b4f7d]! hover:text-[#6b4f7d]!" },
    ENTREGADO: { label: "Marcar como entregado", icon: <PackageCheck size={14} aria-hidden="true" />, hover: "hover:border-(--olive)! hover:text-(--olive)!" },
    CANCELADO: { label: "Cancelar pedido", icon: <XCircle size={14} aria-hidden="true" />, hover: "hover:border-(--terracotta)! hover:text-(--terracotta)!" },
};

export const PedidoRowButtons = ({ pedido }: { pedido: Pedido }) => {
    const open = useOpenPedidoModal();

    return (
        <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={() => open({ kind: "detalle", pedido })} aria-label={`Ver detalle del pedido #${pedido.id}`} title="Ver detalle" className={iconButton}>
                <Eye size={14} aria-hidden="true" />
            </button>

            {TRANSICIONES_PEDIDO[pedido.estado].map((estado) => {
                const destino = destinos[estado];
                if (!destino) return null;

                return (
                    <button key={estado} type="button" onClick={() => open({ kind: "estado", pedido, estado })}
                        aria-label={`${destino.label}: pedido #${pedido.id}`} title={destino.label} className={`${iconButton} ${destino.hover}`}>
                        {destino.icon}
                    </button>
                );
            })}
        </div>
    );
};
