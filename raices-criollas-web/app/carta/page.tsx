import { Metadata } from "next";
import { getCategoriasActivas, getPlatosDisponibles } from "../lib/menu";
import { CartaSearch } from "../components/carta/CartaSearch";
import { CategoryTabs } from "../components/carta/CategoryTabs";
import Link from "next/link";
import { DishCard } from "../components/carta/DishCard";

export const metadata: Metadata = {
    title: "La carta | Raices Criollas",
    description: "Descubre la carta de Raices Criollas: entradas, platos de fondo, postres y bebidas de la cocina peruana.",
};

type Param = string | string[] | undefined;

interface CartaPageProps {
    searchParams: Promise<{ categoria?: Param; q?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function CartaPage({ searchParams }: CartaPageProps) {
    const params = await searchParams;

    const categoriaParam = Number(first(params.categoria));
    const categoriaId = categoriaParam > 0 ? categoriaParam : undefined;
    const q = first(params.q)?.trim() || undefined;

    // Las dos consultas son independientes se lanzan en paralelo
    const [categorias, platos] = await Promise.all([
        getCategoriasActivas(),
        getPlatosDisponibles({ categoriaId, nombre: q }),
    ]);

    // Un plato solo trae categoriaId, asi que se agrupa cruzando con las categorias activas
    // Los platos de una categoria inactiva no se muestran
    const grupos = categorias
        .map((categoria) => ({
            categoria,
            platos: platos.filter((plato) => plato.categoriaId === categoria.id),
        }))
        .filter((grupo) => grupo.platos.length > 0);

    const total = grupos.reduce((suma, grupo) => suma + grupo.platos.length, 0);

    return (
        <>
            <section className="px-6 pb-9 pt-13.75 md:px-[8vw] lg:pt-20">
                <div className="container mx-auto flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Nuestra carta
                        </p>

                        <h1 className="mt-3.5 font-serif text-[clamp(44px,6vw,72px)] font-normal leading-[0.95] tracking-[-0.065em]">
                            Sabores de{" "}
                            <span className="text-(--terracotta) italic">casa</span>
                        </h1>

                        <p className="mt-4 max-w-md font-serif text-base leading-[1.7] text-(--muted)">
                            Recetas criollas preparadas cada día. Elige una categoría o busca tu plato favorito.
                        </p>
                    </div>

                    <CartaSearch q={q} categoriaId={categoriaId} />

                </div>
            </section>

            <CategoryTabs categorias={categorias} categoriaActivaId={categoriaId} q={q} />

            <section className="bg-(--paper) px-6 py-14 md:px-[8vw] md:py-17.5">
                <div className="container mx-auto">

                    {total === 0 ? (
                        <div className="flex min-h-50 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--cream) p-8 text-center">
                            <p className="font-serif text-xl">
                                No encontramos platos con esos filtros.
                            </p>
                            <Link href="/carta" className="text-[12px] font-extrabold text-(--terracotta) underline underline-offset-4">
                                Ver toda la carta
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="mb-10 text-[11px] font-bold uppercase tracking-[0.12em] text-(--muted)" aria-live="polite">
                                {total} {total === 1 ? "plato" : "platos"}
                                {q && <> para “{q}”</>}
                            </p>

                            <div className="flex flex-col gap-16">
                                {grupos.map(({ categoria, platos: platosDelGrupo }) => (
                                    <section key={categoria.id} aria-labelledby={`categoria-${categoria.id}`}>

                                        <div className="mb-7 border-b border-(--line) pb-4">
                                            <h2 id={`categoria-${categoria.id}`} className="font-serif text-[clamp(28px,3vw,38px)] font-normal tracking-tighter">
                                                {categoria.nombre}
                                            </h2>
                                            {categoria.descripcion && (
                                                <p className="mt-1.5 font-serif text-[14px] text-(--muted)">
                                                    {categoria.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {platosDelGrupo.map((plato) => (
                                                <DishCard key={plato.id} plato={plato} />
                                            ))}
                                        </div>

                                    </section>
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </section>
        </>
    );
}
