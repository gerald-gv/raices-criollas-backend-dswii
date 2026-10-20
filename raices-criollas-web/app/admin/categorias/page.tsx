import { CategoriaModalProvider, CategoriaModalState, CategoriaRowButtons, NuevaCategoriaButton } from "@/app/components/admin/categoria/CategoriaModal";
import { PageHeader } from "@/app/components/admin/PageHeader";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import { getCategoria, getResumen, listCategorias } from "@/app/lib/admin-menu";
import { ApiError } from "@/app/lib/api";

type Param = string | string[] | undefined;

interface CategoriasPageProps {
    searchParams: Promise<{ nuevo?: Param; editar?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function AdminCategoriasPage({ searchParams }: CategoriasPageProps) {
    const params = await searchParams;
    const [categorias, resumen] = await Promise.all([listCategorias(), getResumen()]);

    // Cuantos platos tiene cada categoria 
    const conteo = new Map(resumen.porCategoria.map((f) => [f.categoriaId, f.total]));

    let initial: CategoriaModalState = null;
    const editarId = Number(first(params.editar)) || undefined;

    if (first(params.nuevo)) {
        initial = { kind: "form" };
    } else if (editarId) {
        try {
            initial = { kind: "form", categoria: await getCategoria(editarId) };
        } catch (error) {
            if (!(error instanceof ApiError && error.status === 404)) throw error;
        }
    }

    return (
        <CategoriaModalProvider initial={initial}>
            <PageHeader
                eyebrow="Carta"
                title={<>Las <span className="text-(--terracotta) italic">categorías</span></>}
                description="Agrupan los platos en la carta. Una categoría inactiva oculta también todos sus platos."
                actions={<NuevaCategoriaButton />}
            />

            {categorias.length === 0 ? (
                <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
                    <p className="font-serif text-xl">Aún no hay categorías.</p>
                    <p className="text-[12px] text-(--muted)">Usa «Nueva categoría» para crear la primera.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-(--line) bg-(--paper)">
                    <table className="w-full min-w-150 text-left">
                        <caption className="sr-only">Categorías de la carta</caption>
                        <thead>
                            <tr className="border-b border-(--line) text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">
                                <th scope="col" className="px-5 py-3.5">Categoría</th>
                                <th scope="col" className="px-3 py-3.5">Platos</th>
                                <th scope="col" className="px-3 py-3.5">Estado</th>
                                <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--line)">
                            {categorias.map((categoria) => {
                                const total = conteo.get(categoria.id) ?? 0;

                                return (
                                    <tr key={categoria.id} className="transition-colors duration-200 hover:bg-(--cream)">
                                        <td className="px-5 py-3.5">
                                            <p className="font-serif text-[18px] tracking-[-0.03em]">{categoria.nombre}</p>
                                            {categoria.descripcion && <p className="line-clamp-1 max-w-96 text-[12px] text-(--muted)">{categoria.descripcion}</p>}
                                        </td>

                                        <td className="px-3 py-3.5 text-[13px] font-bold">{total}</td>

                                        <td className="px-3 py-3.5">
                                            <StatusBadge active={categoria.activo} activeLabel="Activa" inactiveLabel="Inactiva" />
                                        </td>

                                        <td className="px-5 py-3.5">
                                            <CategoriaRowButtons categoria={categoria} platos={total} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </CategoriaModalProvider>
    );
}
