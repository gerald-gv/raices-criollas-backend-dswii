"use client"

import { Button } from "../components/ui/button";

// Se muestra si el gateway o el microservicio fallan (503, red caida, etc)
export default function CartaError({ reset }: { error: Error; reset: () => void }) {
    return (
        <section className="px-6 py-24 md:px-[8vw]">
            <div className="container mx-auto flex flex-col items-center gap-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                    Algo salió mal
                </p>

                <h1 className="font-serif text-[clamp(32px,4vw,48px)] font-normal tracking-tighter">
                    No pudimos cargar la carta
                </h1>

                <p className="max-w-md font-serif text-base leading-[1.7] text-(--muted)">
                    Estamos teniendo un problema para mostrar los platos. Inténtalo nuevamente en unos segundos.
                </p>

                <Button onClick={reset}>Reintentar</Button>
            </div>
        </section>
    );
}
