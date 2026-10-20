import { ReactNode } from "react";
import BrandMark from "../brand-mark";

interface AuthShellProps {
    eyebrow: string;
    title: ReactNode;
    description: string;
    notice?: string;
    children: ReactNode;
}

export const AuthShell = ({ eyebrow, title, description, notice, children }: AuthShellProps) => {
    return (
        <section className="px-6 py-14 md:px-[8vw] md:py-20">
            <div className="container mx-auto grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">

                <div className="max-w-md">
                    <BrandMark />

                    <p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                        {eyebrow}
                    </p>

                    <h1 className="mt-3.5 font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[0.95] tracking-[-0.065em]">
                        {title}
                    </h1>

                    <p className="mt-4 font-serif text-base leading-[1.7] text-(--muted)">
                        {description}
                    </p>
                </div>

                <div className="w-full max-w-lg border border-(--line) bg-(--paper) p-7 sm:p-9 lg:justify-self-end">
                    {notice && (
                        <p className="mb-6 border-l-2 border-(--yellow) bg-(--cream) py-2.5 pl-3.5 text-[12px] font-bold text-(--muted)" role="status">
                            {notice}
                        </p>
                    )}
                    {children}
                </div>

            </div>
        </section>
    );
};
