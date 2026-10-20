"use client"

import { Button } from "../components/ui/button";

// Gateway caido, microservicio sin responder, etc.
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-start gap-4 py-10">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Algo salió mal</p>

            <h1 className="font-serif text-[clamp(32px,4vw,48px)] font-normal tracking-tighter">
                No pudimos cargar esta sección
            </h1>

            <p className="max-w-md font-serif text-base leading-[1.7] text-(--muted)">
                {error.message || "Revisa que el gateway y los microservicios estén en marcha e inténtalo de nuevo."}
            </p>

            <Button onClick={reset}>Reintentar</Button>
        </div>
    );
}
