import { Search } from "lucide-react";

interface CartaSearchProps {
    q?: string;
    categoriaId?: number;
}


export const CartaSearch = ({ q, categoriaId }: CartaSearchProps) => {
    return (
        <form action="/carta" method="get" role="search" className="relative w-full sm:max-w-80">
            
            {categoriaId != null && (
                <input type="hidden" name="categoria" value={categoriaId}/>
            )}

            <label htmlFor="carta-q" className="sr-only">
                Buscar un plato
            </label>

            <input
                id="carta-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Buscar un plato…"
                className="w-full rounded-sm border border-(--line) bg-(--paper) py-3 pl-4 pr-11 text-[13px] transition-colors duration-200 placeholder:text-(--muted) focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)"
            />

            <button type="submit" aria-label="Buscar"
                className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-(--ink) transition-colors duration-200 hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-(--terracotta)">
                <Search size={16} aria-hidden="true" />
            </button>
            
        </form>
    );
};