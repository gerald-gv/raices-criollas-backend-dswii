import { Metadata } from "next";
import { EstadoPedido, ESTADOS_PEDIDO } from "../types/pedidos";
import { getSession } from "../lib/session";
import { redirect } from "next/navigation";
import { getMisPedidos } from "../lib/pedidos";
import { ToastProvider } from "../components/ui/Toast";
import Link from "next/link";
import { Package, UtensilsCrossed } from "lucide-react";
import { PedidoCard } from "../components/pedidos/PedidoCard";

export const metadata: Metadata = {
    title: "Mis pedidos | Raíces Criollas",
    description: "Consulta el historial y el estado de tus pedidos en Raíces Criollas.",
};

type Param = string | string[] | undefined;

interface MisPedidosPageProps {
    searchParams: Promise<{ estado?: Param }>;
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

export default async function MisPedidosPage({ searchParams }: MisPedidosPageProps) {
    const session = await getSession();

    if (!session) {
        redirect("/login?next=/mis-pedidos");
    }

    const params = await searchParams;
    const estadoParam = first(params.estado)?.toUpperCase() as EstadoPedido | undefined;
    const estadoFiltro = estadoParam && ESTADOS_PEDIDO.includes(estadoParam) ? estadoParam : undefined;

    const pedidos = await getMisPedidos();

    // Mas recientes como primero
    const ordenados = [...pedidos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const filtrados = estadoFiltro ? ordenados.filter((p) => p.estado === estadoFiltro) : ordenados;

    return (
        <ToastProvider>
            <div className="min-h-screen bg-(--cream) pb-24">

                <section className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">

                    <div className="container mx-auto max-w-5xl">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Mi historial</p>
                                <h1 className="mt-2 font-serif text-[clamp(34px,4vw,52px)] font-normal leading-[0.98] tracking-tighter text-(--ink)">
                                    Mis <span className="text-(--terracotta) italic">pedidos</span>
                                </h1>
                                <p className="mt-3 max-w-lg font-serif text-[15px] leading-[1.7] text-(--muted)">
                                    Sigue el estado de tus pedidos. Si dejaste un pago a medias, puedes retomarlo o cancelarlo mientras siga pendiente.
                                </p>
                            </div>

                            <Link href="/carta" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-(--ink) px-5 py-3.5 text-xs font-extrabold text-white transition-all hover:bg-(--terracotta)">
                                <UtensilsCrossed size={16} aria-hidden="true" />
                                Ver la carta
                            </Link>
                        </div>

                        <div className="mt-8 flex gap-2 overflow-x-auto border-t border-(--line) pt-4">
                            {tabs.map((tab) => {
                                const active = tab.value === estadoFiltro;
                                const href = tab.value ? `/mis-pedidos?estado=${tab.value}` : "/mis-pedidos";

                                return (
                                    <Link key={tab.label} href={href} aria-current={active ? "page" : undefined}
                                        className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${active ? "bg-(--ink) text-white" : "bg-(--cream) text-(--muted) hover:bg-(--line) hover:text-(--ink)"}`}>
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                </section>

                <section className="container mx-auto mt-10 max-w-5xl px-6 md:px-8">
                    {filtrados.length === 0 ? (
                        <div className="flex min-h-60 flex-col items-center justify-center gap-4 border border-dashed border-(--line) bg-(--paper) p-10 text-center">
                            <Package size={40} className="text-(--muted)" aria-hidden="true" />
                            <div>
                                <p className="font-serif text-2xl text-(--ink)">No tienes pedidos {estadoFiltro ? "con ese estado" : "todavía"}</p>
                                <p className="mt-1 text-[13px] text-(--muted)">
                                    {estadoFiltro ? "Prueba con otro filtro." : "Cuando pagues tu primer pedido aparecerá aquí."}
                                </p>
                            </div>
                            <Link href="/carta" className="mt-2 inline-flex items-center gap-2 rounded-sm bg-(--terracotta) px-6 py-3 text-xs font-extrabold text-white transition-colors hover:bg-(--ink)">
                                <UtensilsCrossed size={15} aria-hidden="true" />
                                Hacer un pedido
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {filtrados.map((pedido) => (
                                <PedidoCard key={pedido.id} pedido={pedido} />
                            ))}
                        </div>
                    )}
                </section>
                
            </div>
        </ToastProvider>
    );
}
