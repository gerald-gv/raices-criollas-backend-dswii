import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    basePath: string;
    params?: Record<string, string | undefined>;
}

const hrefFor = (basePath: string, params: PaginationProps["params"], page: number) => {
    const query = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value) query.set(key, value);
    });
    if (page > 1) query.set("page", String(page));

    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
};

// 1 … 4 5 6 … 20, primera, ultima y la actual con sus vecinas
const itemsFor = (current: number, total: number): (number | "…")[] => {
    const pages = [...new Set([1, total, current - 1, current, current + 1])]
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b);

    const items: (number | "…")[] = [];
    let previous = 0;

    for (const p of pages) {
        if (p - previous > 1) items.push("…");
        items.push(p);
        previous = p;
    }
    return items;
};

const base = "flex size-9 items-center justify-center rounded-sm border text-[12px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)";
const idle = "border-(--line) text-[#625e54] hover:border-(--terracotta) hover:text-(--terracotta)";
const active = "border-(--ink) bg-(--ink) text-white";
const disabled = "cursor-not-allowed border-(--line) text-(--line)";

export const Pagination = ({ page, totalPages, totalElements, size, basePath, params }: PaginationProps) => {
    if (totalElements === 0) return null;

    const from = (page - 1) * size + 1;
    const to = Math.min(page * size, totalElements);

    return (
        <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--muted)" aria-live="polite">
                Mostrando {from}–{to} de {totalElements}
            </p>

            {totalPages > 1 && (
                <nav aria-label="Paginación" className="flex items-center gap-1.5">
                    {page > 1 ? (
                        <Link href={hrefFor(basePath, params, page - 1)} aria-label="Página anterior" className={`${base} ${idle}`}>
                            <ChevronLeft size={16} aria-hidden="true" />
                        </Link>
                    ) : (
                        <span aria-disabled="true" className={`${base} ${disabled}`}>
                            <ChevronLeft size={16} aria-hidden="true" />
                        </span>
                    )}

                    {itemsFor(page, totalPages).map((item, index) =>
                        item === "…" ? (
                            <span key={`gap-${index}`} className="px-1 text-[12px] text-(--muted)" aria-hidden="true">…</span>
                        ) : (
                            <Link
                                key={item}
                                href={hrefFor(basePath, params, item)}
                                aria-label={`Página ${item}`}
                                aria-current={item === page ? "page" : undefined}
                                className={`${base} ${item === page ? active : idle}`}
                            >
                                {item}
                            </Link>
                        ),
                    )}

                    {page < totalPages ? (
                        <Link href={hrefFor(basePath, params, page + 1)} aria-label="Página siguiente" className={`${base} ${idle}`}>
                            <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                    ) : (
                        <span aria-disabled="true" className={`${base} ${disabled}`}>
                            <ChevronRight size={16} aria-hidden="true" />
                        </span>
                    )}
                </nav>
            )}
        </div>
    );
};