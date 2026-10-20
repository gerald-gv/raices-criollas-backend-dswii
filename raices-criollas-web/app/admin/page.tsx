import Link from "next/link";
import { PageHeader } from "../components/admin/PageHeader";
import { getResumen, listCategorias, listPlatos } from "../lib/admin-menu";
import { getSession } from "../lib/session";
import { ArrowRight, EyeOff, Plus, Tags, UtensilsCrossed } from "lucide-react";
import { StatCard } from "../components/admin/StatCard";
import { StatusBadge } from "../components/admin/StatusBadge";
import { formatPrice } from "../lib/format";

const buttonLink = "inline-flex items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5";

export default async function AdminDashboardPage() {

    // Se piden en paralelo
    const [session, resumen, ultimos, categorias] = await Promise.all([
        getSession(),
        getResumen(),
        listPlatos({ size: 5, sort: "id,desc" }),   // solo los 5 mas recientes, sin cargar todo
        listCategorias(),
    ]);

    const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));
    const recientes = ultimos.content;
    const nombre = session?.email.split("@")[0] ?? "";

    return (
        <>
            <PageHeader
                eyebrow="Panel de administración"
                title={<>Hola, <span className="text-(--terracotta) italic">{nombre}</span></>}
                description="Así está la carta de Raíces Criollas hoy."
                actions={
                    <>
                        <Link href="/admin/platos" className={`${buttonLink} button-primary`}>
                            <Plus size={16} aria-hidden="true" />
                            Nuevo plato
                        </Link>
                        <Link href="/admin/categorias" className={`${buttonLink} button-outline`}>
                            Nueva categoría
                        </Link>
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Platos" value={resumen.totalPlatos} detail="En total" icon={<UtensilsCrossed size={18} aria-hidden="true" />} />
                <StatCard label="Disponibles" value={resumen.platosDisponibles} detail="Se sirven hoy" icon={<UtensilsCrossed size={18} aria-hidden="true" />} />
                <StatCard label="Ocultos" value={resumen.platosNoDisponibles} detail="Marcados como no disponibles" icon={<EyeOff size={18} aria-hidden="true" />} />
                <StatCard label="Categorías" value={resumen.categoriasActivas} detail={`${resumen.categoriasTotal - resumen.categoriasActivas} inactivas`} icon={<Tags size={18} aria-hidden="true" />} />
            </div>

            {resumen.platosDisponiblesEnCategoriaInactiva > 0 && (
                <div role="status" className="mt-6 border-l-2 border-(--yellow) bg-(--paper) p-4 text-[13px]">
                    <p className="font-bold">
                        {resumen.platosDisponiblesEnCategoriaInactiva} {resumen.platosDisponiblesEnCategoriaInactiva === 1 ? "plato disponible no se ve" : "platos disponibles no se ven"} en la carta
                    </p>
                    <p className="mt-1 text-(--muted)">
                        Pertenecen a una categoría inactiva. <Link href="/admin/categorias" className="font-extrabold text-(--terracotta) underline underline-offset-4">Revisar categorías</Link>
                    </p>
                </div>
            )}

            <section className="mt-12" aria-labelledby="recientes">
                <div className="mb-5 flex items-end justify-between border-b border-(--line) pb-4">
                    <h2 id="recientes" className="font-serif text-[clamp(26px,3vw,34px)] font-normal tracking-tighter">
                        Últimos platos agregados
                    </h2>
                    <Link href="/admin/platos" className="flex items-center gap-1.75 text-[11px] font-extrabold text-(--terracotta)">
                        Ver todos
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                {recientes.length === 0 ? (
                    <div className="flex min-h-40 flex-col items-center justify-center gap-3 border border-dashed border-(--line) bg-(--paper) p-8 text-center">
                        <p className="font-serif text-xl">Aún no hay platos en la carta.</p>
                        <Link href="/admin/platos/nuevo" className="text-[12px] font-extrabold text-(--terracotta) underline underline-offset-4">
                            Crear el primer plato
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-(--line) border border-(--line) bg-(--paper)">
                        {recientes.map((plato) => (
                            <li key={plato.id}>
                                <div className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-(--cream)">
                                    <div className="min-w-0">
                                        <p className="truncate font-serif text-[18px] tracking-[-0.03em]">{plato.nombre}</p>
                                        <p className="text-[12px] text-(--muted)">{categoriasPorId.get(plato.categoriaId)?.nombre ?? "Sin categoría"}</p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-4">
                                        <span className="text-[13px] font-extrabold text-(--terracotta)">{formatPrice(plato.precio)}</span>
                                        <span className="hidden sm:block">
                                            <StatusBadge active={plato.disponible} activeLabel="Disponible" inactiveLabel="Oculto" />
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
