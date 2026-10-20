import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const StorySection = () => {
    return (
        <section className="relative overflow-hidden bg-[#c96a46] px-6 py-17.5 text-[#fff7e6] md:px-[8vw] md:py-17.5 lg:px-[13vw] lg:py-22">

            <div className="container mx-auto grid grid-cols-1 gap-16 md:grid-cols-[0.85fr_0.55fr] md:gap-10">

                <div className="relative z-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--yellow)">
                        Una mesa con historia
                    </p>

                    <h2 className="my-5 font-serif text-[44px] font-normal leading-[0.92] tracking-[-0.065em] sm:text-[52px] md:text-[5vw] lg:text-[68px]">
                        Perú se sirve{" "}
                        <span className="block text-(--yellow) italic">
                            en familia.
                        </span>
                    </h2>

                    <p className="max-w-102.5 font-serif text-[15px] leading-[1.7] text-[#f9deca]">
                        Raíces Criollas nació de una sobremesa larga, de esas
                        donde nadie quiere levantarse. Rescatamos los sabores
                        que pasan de generación en generación para compartirlos
                        contigo, sin apuro y con el corazón contento.
                    </p>

                    <Link
                        href="/nuestra-historia"
                        className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-[#fff7e6] bg-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] text-[#fff7e6] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff7e6] hover:text-(--terracotta)"
                    >
                        Conoce nuestra historia
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <blockquote className="relative z-1 self-end border-l border-white/35 pb-2 pl-7.5 md:mb-2 md:pl-10.5">

                    <span className="absolute -top-0.5 left-7.5 font-serif text-[70px] leading-[0.4] text-(--yellow)" aria-hidden="true">
                        “
                    </span>

                    <p className="mb-4.5 mt-8.5 font-serif text-[25px] leading-[1.15]">
                        La mejor receta siempre{" "}
                        <span className="block">
                            lleva un poquito de hogar.
                        </span>
                    </p>

                    <span className="text-[10px] not-italic text-[#f5d5c0]">
                        — Doña Emilia, fundadora
                    </span>

                </blockquote>
            </div>

            <div className="pointer-events-none absolute -left-16 top-16 w-85 -rotate-12 text-[#f4be22] opacity-[0.18] md:w-105" aria-hidden="true" >
                
                <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full">
                
                    {/* Vapor */}
                    <path  d="M91 67 C75 49 104 43 91 23 M120 64 C104 45 135 37 119 16 M148 67 C133 50 160 43 148 27" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>

                    {/* Tapa */}
                    <path d="M78 81 Q120 65 162 81" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

                    <path d="M105 72 Q120 59 135 72" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

                    {/* Cuerpo de la olla */}
                    <path d="M67 86 L173 86 L164 153 Q159 181 120 184 Q81 181 76 153 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />

                    {/* Asas */}
                    <path d="M67 103 L48 103 Q36 103 38 119 Q40 133 72 131 M173 103 L192 103 Q204 103 202 119 Q200 133 168 131" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Base */}
                    <path d="M97 194 Q120 201 143 194" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
            </div>
            
        </section>
    );
};