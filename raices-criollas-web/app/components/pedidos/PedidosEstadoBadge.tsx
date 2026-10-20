import { EstadoPedido } from "@/app/types/pedidos";

const config: Record<EstadoPedido, { label: string; bg: string; text: string; dot: string }> = {
    PENDIENTE_PAGO: { label: "Pendiente de pago", bg: "bg-[#eeebe5]", text: "text-(--muted)", dot: "bg-(--muted)" },
    PAGADO: { label: "Pagado", bg: "bg-[#fef8e7]", text: "text-(--gold)", dot: "bg-(--gold)" },
    PREPARANDO: { label: "Preparando", bg: "bg-[#e4edf1]", text: "text-[#3b6a82]", dot: "bg-[#3b6a82]" },
    LISTO: { label: "Listo", bg: "bg-[#eef1e3]", text: "text-(--olive)", dot: "bg-(--olive)" },
    ENVIANDO: { label: "Enviando", bg: "bg-[#ece6f1]", text: "text-[#6b4f7d]", dot: "bg-[#6b4f7d]" },
    ENTREGADO: { label: "Entregado", bg: "bg-[#e4efe8]", text: "text-[#2f6b4f]", dot: "bg-[#2f6b4f]" },
    CANCELADO: { label: "Cancelado", bg: "bg-[#f8e9e2]", text: "text-(--terracotta)", dot: "bg-(--terracotta)" },
};

export const estadoPedidoLabel = (estado: EstadoPedido) => config[estado]?.label ?? estado;

export const PedidoEstadoBadge = ({ estado }: { estado: EstadoPedido }) => {
    const c = config[estado] ?? { label: estado, bg: "bg-(--cream)", text: "text-(--muted)", dot: "bg-(--muted)" };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${c.bg} ${c.text}`}>
            <span aria-hidden="true" className={`size-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
};
