"use client"

import { Plato } from "@/app/types/menu";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { DishCard } from "../carta/DishCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CLONES = 4;
const DURATION = 500;
const AUTOPLAY_MS = 5000;
const SWIPE_PX = 50;

function usePerView() {
    const [perView, setPerView] = useState(3);

    useEffect(() => {
        
        const xl = window.matchMedia("(min-width: 80rem)");
        const lg = window.matchMedia("(min-width: 64rem)");
        const sm = window.matchMedia("(min-width: 40rem)");
        const update = () => setPerView(xl.matches ? 4 : lg.matches ? 3 : sm.matches ? 2 : 1);

        update();
        const queries = [xl, lg, sm];
        queries.forEach((q) => q.addEventListener("change", update));
        return () => queries.forEach((q) => q.removeEventListener("change", update));
    }, []);

    return perView;
}

interface Slide {
    plato: Plato;
    clone: boolean;
    key: string;
}

export const FeaturedSlider = ({ platos }: { platos: Plato[] }) => {
    const n = platos.length;
    const perView = usePerView();
    // Con menos platos de los que caben no hay nada que deslizar
    const enabled = n > perView;

    const [index, setIndex] = useState(CLONES);
    const [animate, setAnimate] = useState(true);
    const [paused, setPaused] = useState(false);

    const busy = useRef(false);
    const startX = useRef<number | null>(null);

    const move = useCallback((dir: 1 | -1) => {
        if (!enabled || busy.current) return;

        busy.current = true;
        setAnimate(true);
        setIndex((i) => i + dir);
        setTimeout(() => { busy.current = false; }, DURATION);
    }, [enabled]);

    // Al llegar a un clon, salta al plato real equivalente
    useEffect(() => {
        if (!enabled || (index >= CLONES && index < CLONES + n)) return;

        const timer = setTimeout(() => {
            setAnimate(false);
            setIndex((i) => (i >= CLONES + n ? i - n : i + n));
        }, DURATION);

        return () => clearTimeout(timer);
    }, [index, enabled, n]);

    // Tras el salto se vuelve a activar la animacion
    useEffect(() => {
        if (animate) return;

        let inner = 0;
        const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setAnimate(true)); });
        return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }, [animate]);

    // Si cambia el tamaño de pantalla y deja de haber slider (o vuelve), se reinicia la posicion
    useEffect(() => {
        setAnimate(false);
        setIndex(CLONES);
    }, [enabled]);

    // Avance automatico, se detiene con el mouse encima
    useEffect(() => {
        if (!enabled || paused) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // index en las dependencias, tras un clic manual, la cuenta vuelve a empezar
        const id = setInterval(() => { if (!document.hidden) move(1); }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [enabled, paused, move, index]);

    const real: Slide[] = platos.map((plato) => ({ plato, clone: false, key: `p${plato.id}` }));
    const slides: Slide[] = enabled
        ? [
            ...Array.from({ length: CLONES }, (_, k) => ({ plato: platos[(((n - CLONES + k) % n) + n) % n], clone: true, key: `h${k}` })),
            ...real,
            ...Array.from({ length: CLONES }, (_, k) => ({ plato: platos[k % n], clone: true, key: `t${k}` })),
        ]
        : real;

    const trackClass = ["slider-track flex [--pv:1] sm:[--pv:2] lg:[--pv:3] xl:[--pv:4]", !animate && "slider-track--instant", !enabled && "slider-track--static"]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="featured-slider relative select-none" role="region" aria-roledescription="carrusel" aria-label="Platos recomendados"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={(event) => {
                if (event.key === "ArrowRight") move(1);
                if (event.key === "ArrowLeft") move(-1);
            }}
        >
            {enabled && (
                <button type="button" onClick={() => move(-1)} aria-label="Platos anteriores" className="flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-(--line) bg-(--paper) text-(--ink) shadow-[0_10px_24px_-8px_rgba(38,37,31,0.3)] transition-[background-color,color,scale] duration-200 hover:scale-110 hover:bg-(--ink) hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) absolute top-[33%] z-10 left-1 lg:left-0 lg:-translate-x-1/2">
                    <ChevronLeft size={22} aria-hidden="true" />
                </button>
            )}

            <div className="-mx-4 -my-5 cursor-grab touch-pan-y overflow-hidden py-5 active:cursor-grabbing" onPointerDown={(event) => {
                // Un clic en "Añadir al pedido" no cuenta como inicio de arrastre
                startX.current = (event.target as HTMLElement).closest("button") ? null : event.clientX;
            }}
                onPointerCancel={() => { startX.current = null; }}
                onPointerUp={(event) => {

                    if (startX.current === null) return;

                    const delta = event.clientX - startX.current;

                    startX.current = null;

                    if (Math.abs(delta) >= SWIPE_PX) move(delta < 0 ? 1 : -1);
                }}
            >
                <div className={trackClass} style={{ "--idx": index } as CSSProperties}>
                    {slides.map((slide, i) => (
                        <div key={slide.key} className="flex shrink-0 grow-0 basis-full px-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4" role="group"
                            aria-roledescription="diapositiva"
                            aria-label={slide.clone ? undefined : `${(enabled ? i - CLONES : i) + 1} de ${n}`}
                            aria-hidden={slide.clone || undefined}
                        >
                            <DishCard plato={slide.plato} variant="feature" badge="Recomendado" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="w-full"/>
                        </div>
                    ))}
                </div>
            </div>

            {enabled && (
                <button type="button" onClick={() => move(1)} aria-label="Platos siguientes" className="flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-(--line) bg-(--paper) text-(--ink) shadow-[0_10px_24px_-8px_rgba(38,37,31,0.3)] transition-[background-color,color,scale] duration-200 hover:scale-110 hover:bg-(--ink) hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) absolute top-[33%] z-10 right-1 lg:right-0 lg:translate-x-1/2">
                    <ChevronRight size={22} aria-hidden="true" />
                </button>
            )}
        </div>
    );
};
