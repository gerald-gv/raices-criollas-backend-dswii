import { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: number | string;
    detail?: string;
    icon: ReactNode;
}

export const StatCard = ({ label, value, detail, icon }: StatCardProps) => {
    return (
        <div className="flex flex-col gap-4 border border-(--line) bg-(--paper) p-5">
            <div className="flex items-center justify-between text-(--terracotta)">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-(--muted)">{label}</span>
                {icon}
            </div>

            <p className="font-serif text-[44px] font-normal leading-none tracking-tighter">{value}</p>

            {detail && <p className="text-[12px] text-(--muted)">{detail}</p>}
        </div>
    );
};
