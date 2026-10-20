import { Categoria } from "@/app/types/menu";
import Link from "next/link";

interface CategoryTabsProps {
    categorias: Categoria[];
    categoriaActivaId?: number;
    q?: string;
}

// Los tabs son enlaces (?categoria=ID): el filtro lo resuelve el servidor
const buildHref = (categoriaId?: number, q?: string) => {
    const params = new URLSearchParams();

    if (categoriaId) {
        params.set("categoria", String(categoriaId));
    }

    if (q) {
        params.set("q", q);
    }

    const query = params.toString();
    return query ? `/carta?${query}` : "/carta";
};

const base = "shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-(--terracotta) focus-visible:outline-offset-2";

const active = "border-(--ink) bg-(--ink) text-white";

const idle = "border-(--line) text-[#625e54] hover:border-(--terracotta) hover:text-(--terracotta)";

export const CategoryTabs = ({ categorias, categoriaActivaId, q, }: CategoryTabsProps) => {
    const items = [
        { id: undefined, nombre: "Todos" },
        ...categorias.map((categoria) => ({ id: categoria.id, nombre: categoria.nombre,
        })),
    ];

    return (
        <nav aria-label="Categorías de la carta" className="sticky top-17.5 z-4 border-y border-(--line) bg-(--cream)/95 backdrop-blur sm:top-20.5">
            <div className="container mx-auto flex gap-2 overflow-x-auto px-6 py-3.5 md:px-[8vw]">
                {items.map((item) => {

                    const isActive = item.id === categoriaActivaId;

                    return (
                        <Link
                            key={item.id ?? "todas"}
                            href={buildHref(item.id, q)}
                            aria-current={isActive ? "page" : undefined}
                            className={`${base} ${isActive ? active : idle}`}
                        >
                            {item.nombre}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};