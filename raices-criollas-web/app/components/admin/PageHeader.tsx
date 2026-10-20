import { ReactNode } from "react";

interface PageHeaderProps {
    eyebrow: string;
    title: ReactNode;
    description?: string;
    actions?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => {
    return (
        <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                    {eyebrow}
                </p>

                <h1 className="mt-3 font-serif text-[clamp(34px,4vw,52px)] font-normal leading-[0.98] tracking-[-0.065em]">
                    {title}
                </h1>

                {description && (
                    <p className="mt-3 max-w-xl font-serif text-[15px] leading-[1.7] text-(--muted)">
                        {description}
                    </p>
                )}
            </div>

            {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
    );
};
