import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getPlatosDestacados } from "@/app/lib/menu"
import { FeaturedSlider } from "./FeaturedSlider"

export const FeaturedSection = async () => {
    const platos = await getPlatosDestacados().catch(() => [])

    return (
        <section className="featured-section">
            <div className="container mx-auto">

                <div className="mb-8.75 flex flex-col items-start gap-4.25 sm:flex-row sm:items-end sm:justify-between sm:gap-0">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Lo que se está sirviendo
                        </span>

                        <h2 className="mt-3.25 font-serif text-[clamp(38px,4vw,52px)] font-normal tracking-[-0.065em]">
                            Los favoritos de{" "}
                            <span className="text-(--terracotta) italic">
                                Raíces
                            </span>
                        </h2>
                    </div>

                    <Link href="/carta" className="flex items-center gap-1.75 text-[11px] font-extrabold text-(--terracotta) sm:mb-2">
                        Ver carta completa
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {platos.length === 0 ? (
                    <div className="flex min-h-50 items-center justify-center border border-dashed border-(--line) bg-(--cream)">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-(--muted)">
                            Pronto habrá novedades
                        </p>
                    </div>
                ) : (
                    <FeaturedSlider platos={platos} />
                )}

            </div>
        </section>
    )
}
