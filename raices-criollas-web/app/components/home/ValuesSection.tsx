import { CookingPot, Leaf, UtensilsCrossed } from "lucide-react";

export const ValuesSection = () => {
    return (
        <section className="bg-[#f2ebdc] p-6">
            <div className="container mx-auto">
                <ul className="flex flex-col items-start gap-4.25 pl-8 md:flex-row md:items-center md:justify-center md:gap-[clamp(28px,8vw,120px)] md:p-0">
                    
                    <li className="flex items-center gap-3.25">

                        <Leaf size={25} strokeWidth={1.5} fill="currentColor" className="text-(--terracotta)" aria-hidden="true"/>

                        <div>
                            <h3 className="text-[11px] font-bold">
                                Ingredientes locales
                            </h3>

                            <p className="mt-1 text-[10px] text-(--muted)">
                                Del mercado a tu mesa
                            </p>
                        </div>

                    </li>

                    <li className="flex items-center gap-3.25">

                        <CookingPot size={25} strokeWidth={1.5} fill="currentColor" className="text-(--terracotta)" aria-hidden="true"/>

                        <div>
                            <h3 className="text-[11px] font-bold">
                                Sazón de siempre
                            </h3>

                            <p className="mt-1 text-[10px] text-(--muted)">
                                Recetas con memoria
                            </p>
                        </div>

                    </li>

                    <li className="flex items-center gap-3.25">
                        <UtensilsCrossed
                            size={25}
                            strokeWidth={1.5}
                            fill="currentColor"
                            className="text-(--terracotta)"
                            aria-hidden="true"
                        />

                        <div>
                            <h3 className="text-[11px] font-bold">
                                Hecho al momento
                            </h3>

                            <p className="mt-1 text-[10px] text-(--muted)">
                                Como debe ser
                            </p>
                        </div>
                    </li>
                    
                </ul>
            </div>
        </section>
    );
};

