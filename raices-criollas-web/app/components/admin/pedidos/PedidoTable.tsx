import { Pedido } from "@/app/types/pedidos";
import { PedidoEstadoBadge } from "../../pedidos/PedidosEstadoBadge";
import { PedidoRowButtons } from "./PedidoRowButtons";
import { Calendar, User } from "lucide-react";
import { formatFechaPedido, formatPrice } from "@/app/lib/format";

const resumen = (pedido: Pedido) => {
    const [primero, ...resto] = pedido.detalles;
    if (!primero) return "—";
    return resto.length > 0 ? `${primero.nombrePlato} y ${resto.length} más` : primero.nombrePlato;
};

const unidades = (pedido: Pedido) => pedido.detalles.reduce((suma, d) => suma + d.cantidad, 0);

export const PedidoTable = ({ pedidos }: { pedidos: Pedido[] }) => {
    if (pedidos.length === 0) {
        return (
            <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
                <p className="font-serif text-xl">No hay pedidos con este filtro.</p>
                <p className="text-[12px] text-(--muted)">Prueba con otro estado.</p>
            </div>
        );
    }

    return (
        <>
            {/* Tarjetas en móvil */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {pedidos.map((pedido) => (
                    <div key={pedido.id} className="flex flex-col rounded-sm border border-(--line) bg-(--paper) p-4">
                        <div className="flex items-start justify-between border-b border-(--line) pb-3">
                            <div>
                                <h3 className="font-serif text-[18px] font-normal text-(--ink)">Pedido #{pedido.id}</h3>
                                <p className="flex items-center gap-1 text-[11px] text-(--muted)">
                                    <Calendar size={11} className="text-(--terracotta)" aria-hidden="true" />
                                    {formatFechaPedido(pedido.fecha)}
                                </p>
                            </div>
                            <PedidoEstadoBadge estado={pedido.estado} />
                        </div>

                        <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
                            <div className="flex items-center gap-1.5">
                                <User size={13} className="text-(--terracotta)" aria-hidden="true" />
                                <span className="text-(--muted)">Cliente:</span>
                                <span className="font-mono font-bold">{pedido.clienteId}</span>
                            </div>
                            <p className="text-(--muted)">{unidades(pedido)} {unidades(pedido) === 1 ? "plato" : "platos"} · {resumen(pedido)}</p>
                            <p className="font-serif text-[20px] tracking-[-0.04em] text-(--terracotta)">{formatPrice(pedido.total)}</p>
                        </div>

                        <div className="mt-4 border-t border-(--line) pt-3">
                            <PedidoRowButtons pedido={pedido} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabla en escritorio */}
            <div className="hidden overflow-x-auto border border-(--line) bg-(--paper) md:block">
                <table className="w-full min-w-160 text-left">
                    <caption className="sr-only">Listado administrativo de pedidos</caption>
                    <thead>
                        <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                            <th scope="col" className="px-5 py-3.5">Pedido</th>
                            <th scope="col" className="px-4 py-3.5">Cliente</th>
                            <th scope="col" className="px-4 py-3.5">Fecha</th>
                            <th scope="col" className="px-4 py-3.5">Platos</th>
                            <th scope="col" className="px-4 py-3.5">Total</th>
                            <th scope="col" className="px-4 py-3.5">Estado</th>
                            <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--line)">
                        {pedidos.map((pedido) => (
                            <tr key={pedido.id} className="transition-colors duration-200 hover:bg-(--cream)">
                                <td className="px-5 py-3.5 font-mono text-[13px] font-bold text-(--ink)">#{pedido.id}</td>

                                <td className="px-4 py-3.5">
                                    <p className="max-w-36 truncate font-mono text-[12px] font-bold text-(--ink)" title={String(pedido.clienteId)}>{pedido.clienteId}</p>
                                </td>

                                <td className="px-4 py-3.5 text-[13px] text-(--ink)">{formatFechaPedido(pedido.fecha)}</td>

                                <td className="px-4 py-3.5 text-[13px]">
                                    <p className="font-bold text-(--ink)">{unidades(pedido)}</p>
                                    <p className="max-w-52 truncate text-[11px] text-(--muted)" title={resumen(pedido)}>{resumen(pedido)}</p>
                                </td>

                                <td className="px-4 py-3.5 text-[13px] font-extrabold text-(--terracotta)">{formatPrice(pedido.total)}</td>

                                <td className="px-4 py-3.5"><PedidoEstadoBadge estado={pedido.estado} /></td>

                                <td className="px-5 py-3.5"><PedidoRowButtons pedido={pedido} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
