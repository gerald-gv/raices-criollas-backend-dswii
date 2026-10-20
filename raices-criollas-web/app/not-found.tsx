import { ArrowRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <section className="flex min-h-[70vh] items-center justify-center px-6 py-16 md:px-[8vw]">
            <div className="container mx-auto flex flex-col items-center text-center">

                <p className="rc-fade-up text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                    Error 404
                </p>

                <div className="rc-fade-up mt-5 flex items-center justify-center gap-1 font-serif text-[96px] leading-none tracking-[-0.06em] [--rc-delay:0.1s] sm:gap-3 sm:text-[148px]" aria-hidden="true">
                    <span>4</span>

                    <span className="rc-float relative inline-flex size-[0.72em] items-center justify-center rounded-full border-[3px] border-(--terracotta) bg-(--paper)">
                        <span className="absolute inset-[14%] rounded-full border border-(--yellow)" />
                        <UtensilsCrossed className="size-[0.26em] text-(--gold)" strokeWidth={1.5} />

                        <span className="rc-steam absolute top-[-0.2em] left-[32%] h-[0.14em] w-0.5 rounded-full bg-(--gold)" />
                        <span className="rc-steam absolute top-[-0.24em] left-1/2 h-[0.18em] w-0.5 rounded-full bg-(--gold) [--rc-delay:0.7s]" />
                        <span className="rc-steam absolute top-[-0.2em] left-[66%] h-[0.14em] w-0.5 rounded-full bg-(--gold) [--rc-delay:1.4s]" />
                    </span>

                    <span>4</span>
                </div>

                <h1 className="rc-fade-up mt-8 font-serif text-[32px] font-normal leading-[0.98] tracking-tighter [--rc-delay:0.2s] sm:text-[44px]">
                    Este plato no está{" "}
                    <span className="italic text-(--terracotta)">
                        en la carta.
                    </span>
                </h1>

                <p className="rc-fade-up mt-4 max-w-md font-serif text-[15px] leading-[1.7] text-(--muted) [--rc-delay:0.3s]">
                    La página que buscas no existe o cambió de lugar.
                    Vuelve al inicio o echa un vistazo a lo que hoy
                    tenemos en la cocina.
                </p>

                <div className="rc-fade-up mt-8 flex flex-col items-center gap-3 [--rc-delay:0.4s] sm:flex-row">
                    <Link href="/" className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary">
                        Volver al inicio
                        <ArrowRight size={16} />
                    </Link>

                    <Link href="/carta" className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-(--ink) px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] text-(--ink) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--ink) hover:text-white">
                        Ver la carta
                    </Link>
                </div>

            </div>
        </section>
    );
}
