import { PageHeader } from "@/app/components/admin/PageHeader";
import { Pagination } from "@/app/components/admin/Pagination";
import { PedidoModalProvider } from "@/app/components/admin/pedidos/PedidoModal";
import { PedidoTable } from "@/app/components/admin/pedidos/PedidoTable";
import { listAdminPedidos } from "@/app/lib/admin-pedidos";
import { EstadoPedido, ESTADOS_PEDIDO } from "@/app/types/pedidos";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pedidos | Panel de administración" };

const PAGE_SIZE = 10;

type Param = string | string[] | undefined;

interface PedidosPageProps {
    searchParams: Promise<{ estado?: Param; page?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

const tabs: { label: string; value?: EstadoPedido }[] = [
    { label: "Todos" },
    { label: "Pendientes de pago", value: "PENDIENTE_PAGO" },
    { label: "Pagados", value: "PAGADO" },
    { label: "Preparando", value: "PREPARANDO" },
    { label: "Listos", value: "LISTO" },
    { label: "Enviando", value: "ENVIANDO" },
    { label: "Entregados", value: "ENTREGADO" },
    { label: "Cancelados", value: "CANCELADO" },
];

export default async function AdminPedidosPage({ searchParams }: PedidosPageProps) {
    const params = await searchParams;

    const estadoParam = first(params.estado)?.toUpperCase() as EstadoPedido | undefined;
    const estado = estadoParam && ESTADOS_PEDIDO.includes(estadoParam) ? estadoParam : undefined;
    const page = Math.max(Number.parseInt(first(params.page) ?? "1", 10) || 1, 1);

    const pagina = await listAdminPedidos({ estado, page, size: PAGE_SIZE });

    return (
        <PedidoModalProvider>

            <PageHeader eyebrow="Panel de administración" title={<>Pedidos <span className="text-(--terracotta) italic">recibidos</span></>} description="Sigue los pedidos de los clientes y avanza su estado: pagado, preparando, listo y entregado." />

            <div className="mb-6 flex gap-2 overflow-x-auto" role="navigation" aria-label="Filtrar por estado">
                {tabs.map((tab) => {
                    const active = tab.value === estado;

                    return (
                        <Link key={tab.label} href={tab.value ? `/admin/pedidos?estado=${tab.value}` : "/admin/pedidos"} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${active ? "bg-(--ink) text-white" : "bg-(--paper) text-(--muted) hover:bg-(--line) hover:text-(--ink)"}`}>
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <PedidoTable pedidos={pagina.content} />

            <Pagination page={page} totalPages={pagina.totalPages} totalElements={pagina.totalElements} size={PAGE_SIZE} basePath="/admin/pedidos" params={{ estado }} />
            
        </PedidoModalProvider>
    );
}
