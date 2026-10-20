// Por debajo de este número se avisa "poco stock" en la tabla de platos
export const STOCK_BAJO = 5;

export const StockBadge = ({ stock }: { stock: number }) => {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3e6dd] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-(--terracotta)">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-(--terracotta)" />
                Agotado
            </span>
        );
    }

    if (stock <= STOCK_BAJO) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef8e7] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-(--gold)">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-(--gold)" />
                {stock} · Poco
            </span>
        );
    }

    return <span className="text-[13px] font-extrabold text-(--ink)">{stock}</span>;
};
