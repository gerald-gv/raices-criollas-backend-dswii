import { redirect } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/app/components/admin/PageHeader";
import { Pagination } from "@/app/components/admin/Pagination";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import { getPlato, listCategorias, listPlatos } from "@/app/lib/admin-menu";
import { formatPrice } from "@/app/lib/format";
import { NuevoPlatoButton, PlatoModalProvider, PlatoModalState, PlatoRowButtons } from "@/app/components/admin/platos/PlatoModal";
import { ApiError } from "@/app/lib/api";
import { StockBadge } from "@/app/components/admin/platos/StockBadge";

const PAGE_SIZE = 10;

type Param = string | string[] | undefined;

interface PlatosPageProps {
    searchParams: Promise<{ page?: Param; nuevo?: Param; editar?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function AdminPlatosPage({ searchParams }: PlatosPageProps) {
    const params = await searchParams;
    const pagina = Math.max(1, Number(first(params.page)) || 1);

    const [resultado, categorias] = await Promise.all([
        listPlatos({ page: pagina - 1, size: PAGE_SIZE, sort: "id,desc" }),
        listCategorias(),
    ]);

    // Pagina fuera de rango (por ejemplo tras eliminar el ultimo plato de la ultima pagina)
    if (resultado.totalPages > 0 && pagina > resultado.totalPages) {
        redirect(`/admin/platos?page=${resultado.totalPages}`);
    }

    const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));
    const platos = resultado.content;

    // Modal abierto desde la URL: ?nuevo=1 (atajo del dashboard) o ?editar=ID
    let initial: PlatoModalState = null;
    const editarId = Number(first(params.editar)) || undefined;

    if (first(params.nuevo)) {
        initial = { kind: "form" };
    } else if (editarId) {
        try {
            initial = { kind: "form", plato: await getPlato(editarId) };
        } catch (error) {
            if (!(error instanceof ApiError && error.status === 404)) throw error;   // 404: id inexistente, no se abre nada
        }
    }

    return (
        <PlatoModalProvider categorias={categorias} initial={initial}>
            <PageHeader
                eyebrow="Carta"
                title={<>Los <span className="text-(--terracotta) italic">platos</span></>}
                description="Crea, edita y decide qué se sirve hoy. Los cambios se reflejan en la carta pública."
                actions={<NuevoPlatoButton />}
            />

            {platos.length === 0 ? (
                <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
                    <p className="font-serif text-xl">Aún no hay platos en la carta.</p>
                    <p className="text-[12px] text-(--muted)">Usa «Nuevo plato» para crear el primero.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-(--line) bg-(--paper)">
                    <table className="w-full min-w-190 text-left">
                        <caption className="sr-only">Platos de la carta</caption>
                        <thead>
                            <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                                <th scope="col" className="px-5 py-3.5">Plato</th>
                                <th scope="col" className="px-3 py-3.5">Categoría</th>
                                <th scope="col" className="px-3 py-3.5">Precio</th>
                                <th scope="col" className="px-3 py-3.5">Stock</th>
                                <th scope="col" className="px-3 py-3.5">Estado</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--line)">
                            {platos.map((plato) => {
                                const categoria = categoriasPorId.get(plato.categoriaId);

                                return (
                                    <tr key={plato.id} className="transition-colors duration-200 hover:bg-(--cream)">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden bg-[#f2ebdc] text-(--terracotta)">
                                                    {plato.imagen ? (
                                                        <Image src={plato.imagen} alt="" width={48} height={48} className="size-full object-cover" />
                                                    ) : (
                                                        <UtensilsCrossed size={18} strokeWidth={1.25} aria-hidden="true" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-serif text-[18px] tracking-[-0.03em]">{plato.nombre}</p>
                                                    {plato.descripcion && <p className="line-clamp-1 max-w-72 text-[12px] text-(--muted)">{plato.descripcion}</p>}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3.5 text-[13px]">
                                            {categoria ? (
                                                <>
                                                    {categoria.nombre}
                                                    {!categoria.activo && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-(--terracotta)">inactiva</span>}
                                                </>
                                            ) : "—"}
                                        </td>

                                        <td className="px-3 py-3.5 text-[13px] font-extrabold text-(--terracotta)">{formatPrice(plato.precio)}</td>

                                        <td className="px-3 py-3.5">
                                            <StockBadge stock={plato.stock} />
                                        </td>

                                        <td className="px-3 py-3.5">
                                            <StatusBadge active={plato.disponible} activeLabel="Disponible" inactiveLabel="Oculto" />
                                        </td>

                                        <td className="px-5 py-3.5">
                                            <PlatoRowButtons plato={plato} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination
                page={pagina}
                totalPages={resultado.totalPages}
                totalElements={resultado.totalElements}
                size={PAGE_SIZE}
                basePath="/admin/platos"
            />
        </PlatoModalProvider>
    );
}
