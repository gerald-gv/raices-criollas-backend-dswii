interface StatusBadgeProps {
    active: boolean;
    activeLabel: string;
    inactiveLabel: string;
}

export const StatusBadge = ({ active, activeLabel, inactiveLabel }: StatusBadgeProps) => {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${active ? "bg-[#eef1e3] text-(--olive)" : "bg-[#f3e6dd] text-(--terracotta)"}`}>
            <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? "bg-(--olive)" : "bg-(--terracotta)"}`} />
            {active ? activeLabel : inactiveLabel}
        </span>
    );
};
