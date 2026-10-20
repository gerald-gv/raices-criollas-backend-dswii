import { ArrowRight, ArrowUpRight, Star } from "lucide-react"
import Link from "next/link"

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden px-6 pb-13.75 pt-13.75 md:pb-16 md:pt-13.75 lg:px-[8vw] lg:pb-16 lg:pt-20">
            <div className="container mx-auto">

                <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:grid-cols-[0.9fr_1.1fr]">

                    <div className="relative z-2 max-w-122.5">

                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Cocina peruana · Lima
                        </p>

                        <h1 className="my-6 font-serif text-[52px] font-normal leading-[0.9] tracking-[-0.065em] sm:text-[60px] md:text-[6vw] lg:text-[87px]">
                            Sabores que {" "}
                            <span className="block text-(--terracotta) italic">
                                nos recuerdan
                            </span>{" "}
                            a casa.
                        </h1>

                        <p className="max-w-92.5 font-serif text-base leading-[1.7] text-(--muted)">
                            Recetas con historia, ingredientes de aquí y ese toque
                            de la abuela que convierte cada mesa en un recuerdo.
                        </p>

                        <div className="mt-8 flex items-center gap-6">

                            <Link href="/carta" className="inline-flex text-center cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary">
                                Ver la carta
                                <ArrowRight size={17} />
                            </Link>

                            <Link href="/nuestra-historia" className="group text-center inline-flex items-center gap-2.5 text-[11px] font-extrabold text-(--ink)">

                                <span className="flex size-8 items-center justify-center rounded-full border border-(--ink) transition-all duration-200 group-hover:border-(--terracotta) group-hover:bg-(--terracotta) group-hover:text-white">
                                    <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
                                </span>

                                <span className="border-b border-(--ink) pb-0.5 transition-colors duration-200 group-hover:border-(--terracotta) group-hover:text-(--terracotta)">
                                    Conoce nuestra historia
                                </span>

                            </Link>
                        </div>

                        <div className="mt-9 flex items-center gap-3 sm:mt-14.25">

                            <div className="flex" aria-hidden="true">
                                <span className="-mr-1.75 flex size-7.5 items-center justify-center rounded-full border-2 border-(--cream) bg-[#d4a176] text-[8px] font-extrabold text-white">
                                    MA
                                </span>

                                <span className="-mr-1.75 flex size-7.5 items-center justify-center rounded-full border-2 border-(--cream) bg-(--terracotta) text-[8px] font-extrabold text-white">
                                    LC
                                </span>

                                <span className="flex size-7.5 items-center justify-center rounded-full border-2 border-(--cream) bg-[#72674c] text-[8px] font-extrabold text-white">
                                    JP
                                </span>
                            </div>

                            <div>
                                <span className="flex items-center gap-1 text-[13px] font-bold">
                                    4.9
                                    <Star size={13} fill="currentColor" className="text-(--gold)" aria-hidden="true"/>
                                </span>

                                <p className="mt-0.75 text-[9px] text-(--muted)">
                                    +2,000 historias compartidas
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto w-[92%] md:mx-0 md:w-full md:max-w-145 md:justify-self-end">
                        
                        <figure className="hero-image relative overflow-hidden">

                            <img src="/hero-lomo.png" alt="Lomo saltado de Raíces Criollas" className="block h-77.5 w-full object-cover md:h-90 lg:h-110"/>

                            <figcaption className="absolute bottom-6 left-6.75 z-1 flex items-center gap-3.5 text-white">
                                
                                <span className="border-r border-white/65 pr-3 font-serif text-[22px]">
                                    01
                                </span>

                                <div>
                                    <span className="block text-xs font-bold">
                                        El favorito de la casa
                                    </span>

                                    <span className="mt-1 block text-[10px] opacity-80">
                                        Lomo saltado Raíces
                                    </span>
                                </div>
                            </figcaption>
                        </figure>

                        <div className="absolute -right-5.5 -top-6.25 z-2 flex size-23 rotate-11 flex-col items-center justify-center rounded-full bg-(--yellow) text-center font-serif text-[10px] italic leading-[1.05] text-(--ink) md:-right-6.75" aria-hidden="true">
                            Hecho

                            <span className="text-[19px] font-normal">
                                con
                            </span>

                            cariño
                        </div>

                        <div className="absolute -bottom-9 -left-8 text-[44px] text-(--terracotta)" aria-hidden="true">
                            ✦
                        </div>

                        <div className="absolute -right-3.75 -top-12.5 text-2xl text-(--gold)" aria-hidden="true">
                            ✧
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}