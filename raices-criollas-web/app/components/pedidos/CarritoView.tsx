"use client"

import { formatPrice } from "@/app/lib/format";
import { Carrito, ItemCarrito } from "@/app/types/pedidos";
import { AlertTriangle, Info, Loader2, Minus, Plus, ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { cart } from "./cartStore";
import { continuarCompraAction, sincronizarCarritoAction, vaciarCarritoAction } from "@/app/actions/pedidos";
import { FormState } from "@/app/types/menu";
import Link from "next/link";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../admin/ConfirmDialog";


const stepButton = "flex size-8 cursor-pointer items-center justify-center text-(--ink) transition-colors hover:bg-(--cream) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-not-allowed disabled:text-(--line) disabled:hover:bg-transparent";

interface ItemRowProps {
    item: ItemCarrito;
    cantidad: number;
    disponible: boolean;
    disabled: boolean;
    onChange: (platoId: number, cantidad: number) => void;
    onRemove: (platoId: number) => void;
}

const ItemRow = ({ item, cantidad, disponible, disabled, onChange, onRemove }: ItemRowProps) => {
    const nombre = item.nombre ?? `Plato #${item.platoId}`;
    const subtotal = disponible && item.precioUnitario !== null ? item.precioUnitario * cantidad : null;

    return (
        <li className="flex gap-4 border-b border-(--line) py-5 last:border-b-0 sm:gap-5">
            <div className={`relative size-20 shrink-0 overflow-hidden bg-[#f2ebdc] sm:size-24 ${disponible ? "" : "opacity-55 grayscale"}`}>
                {item.imagen ? (
                    <Image src={item.imagen} alt={nombre} fill sizes="96px" className="object-cover" />
                ) : (
                    <div className="flex size-full items-center justify-center text-(--terracotta)">
                        <UtensilsCrossed size={26} strokeWidth={1.25} aria-hidden="true" />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className={`font-serif text-[19px] font-normal leading-[1.1] tracking-[-0.03em] ${disponible ? "" : "text-(--muted)"}`}>
                            {nombre}
                        </h3>

                        {disponible && item.precioUnitario !== null ? (
                            <p className="mt-1 text-[12px] text-(--muted)">{formatPrice(item.precioUnitario)} c/u</p>
                        ) : (
                            <p className="mt-1 font-serif text-[14px] italic leading-snug text-(--muted)">
                                Hoy no lo tenemos disponible
                            </p>
                        )}
                    </div>

                    {subtotal !== null && (
                        <span className="shrink-0 text-[14px] font-extrabold text-(--terracotta)">{formatPrice(subtotal)}</span>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                    {disponible ? (
                        <div className="inline-flex items-center border border-(--line) bg-(--paper)" role="group" aria-label={`Cantidad de ${nombre}`}>
                            <button type="button" className={stepButton} disabled={disabled || cantidad <= 1} aria-label={`Quitar una unidad de ${nombre}`}
                                onClick={() => onChange(item.platoId, cantidad - 1)}>
                                <Minus size={14} aria-hidden="true" />
                            </button>

                            <span className="min-w-8 text-center text-[13px] font-extrabold" aria-live="polite">{cantidad}</span>

                            <button type="button" className={stepButton} disabled={disabled || cantidad >= 99} aria-label={`Añadir una unidad de ${nombre}`}
                                onClick={() => onChange(item.platoId, cantidad + 1)}>
                                <Plus size={14} aria-hidden="true" />
                            </button>
                        </div>
                    ) : (
                        <span className="text-[12px] text-(--muted)">Cantidad: {cantidad}</span>
                    )}

                    <button type="button" disabled={disabled} onClick={() => onRemove(item.platoId)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-extrabold transition-colors hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-not-allowed disabled:opacity-60 ${disponible ? "text-(--muted)" : "text-(--ink) underline underline-offset-4"
                            }`}>
                        <Trash2 size={13} aria-hidden="true" />
                        Quitar
                    </button>
                </div>
            </div>
        </li>
    );
};

export const CarritoView = ({ carrito }: { carrito: Carrito }) => {

    const [clearOpen, setClearOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [cantidades, setCantidades] = useState<Record<number, number>>(() =>
        Object.fromEntries(carrito.items.map((item) => [item.platoId, item.cantidad])),
    );
    const [caidos, setCaidos] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const ultimo = useRef(cantidades);
    const pendiente = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const guardar = useCallback(() => {
        clearTimeout(timer.current);

        if (!pendiente.current) return;

        pendiente.current = false;

        const items = Object.entries(ultimo.current).map(([id, cantidad]) => ({ platoId: Number(id), cantidad }));
        void sincronizarCarritoAction(items);
    }, []);

    const programar = (siguiente: Record<number, number>, ahora = false) => {

        ultimo.current = siguiente;
        pendiente.current = true;
        clearTimeout(timer.current);

        if (ahora) {
            guardar();
        } else {
            timer.current = setTimeout(guardar, 500);
        }
    };

    // Al salir de la pagina se guarda lo que haya quedado pendiente
    useEffect(() => guardar, [guardar]);

    // Al entrar a la pagina manda lo que hay guardado en la cuenta
    useEffect(() => {
        cart.load(carrito.items.map((item) => (
            {
                platoId: item.platoId,
                cantidad: item.cantidad
            }
        )));
    }, [carrito]);

    const items = carrito.items.filter((item) => cantidades[item.platoId] !== undefined);
    const estaDisponible = (item: ItemCarrito) => item.disponible && !caidos.includes(item.platoId);

    const disponibles = items.filter(estaDisponible);
    const noDisponibles = items.length - disponibles.length;
    const unidades = disponibles.reduce((suma, item) => suma + cantidades[item.platoId], 0);
    const total = disponibles.reduce((suma, item) => suma + (item.precioUnitario ?? 0) * cantidades[item.platoId], 0);

    const cambiar = (platoId: number, cantidad: number) => {
        setError(null);
        const siguiente = { ...cantidades, [platoId]: cantidad };
        setCantidades(siguiente);
        cart.set(platoId, cantidad);
        programar(siguiente);
    };

    const quitar = (platoId: number) => {
        setError(null);
        const siguiente = Object.fromEntries(Object.entries(cantidades).filter(([id]) => Number(id) !== platoId));
        setCantidades(siguiente);
        cart.set(platoId, 0);
        programar(siguiente, true);
    };

    const quitarNoDisponibles = () => {
        setError(null);
        const ids = items.filter((item) => !estaDisponible(item)).map((item) => item.platoId);
        const siguiente = Object.fromEntries(Object.entries(cantidades).filter(([id]) => !ids.includes(Number(id))));
        setCantidades(siguiente);
        setCaidos((actual) => actual.filter((id) => !ids.includes(id)));
        ids.forEach((id) => cart.set(id, 0));
        programar(siguiente, true);
    };

    const continuar = () => {
        setError(null);
        clearTimeout(timer.current);
        pendiente.current = false;

        startTransition(async () => {
            const result = await continuarCompraAction(items.map((item) => ({ platoId: item.platoId, cantidad: cantidades[item.platoId] })));

            // Si todo está bien la acción redirige y esto no llega a ejecutarse
            if (result?.ok === false) {
                setError(result.mensaje);
                if (result.noDisponibles) setCaidos(result.noDisponibles);
            }
        });
    };

    const vaciar = async (): Promise<FormState> => {
        const result = await vaciarCarritoAction();
        if (result.ok) {
            clearTimeout(timer.current);
            pendiente.current = false;
            ultimo.current = {};
            setCantidades({});
            cart.clear();
        }
        return result;
    };

    if (items.length === 0) {
        return (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 border border-dashed border-(--line) bg-(--paper) p-10 text-center">
                <ShoppingBag size={40} className="text-(--muted)" aria-hidden="true" />
                <div>
                    <p className="font-serif text-2xl text-(--ink)">Tu pedido está vacío</p>
                    <p className="mt-1 text-[13px] text-(--muted)">Explora la carta y añade los platos que quieras probar.</p>
                </div>
                <Link href="/carta" className="mt-2 inline-flex items-center gap-2 rounded-sm bg-(--terracotta) px-6 py-3 text-xs font-extrabold text-white transition-colors hover:bg-(--ink)">
                    <UtensilsCrossed size={15} aria-hidden="true" />
                    Ver la carta
                </Link>
            </div>
        );
    }

    return (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            <section aria-labelledby="carrito-items" className="border border-(--line) bg-(--paper) px-5 sm:px-6">
                <h2 id="carrito-items" className="sr-only">Platos de tu pedido</h2>
                <ul>
                    {items.map((item) => (
                        <ItemRow key={item.platoId} item={item} cantidad={cantidades[item.platoId]} disponible={estaDisponible(item)}
                            disabled={pending} onChange={cambiar} onRemove={quitar} />
                    ))}
                </ul>
            </section>

            <aside aria-labelledby="carrito-resumen" className="border border-(--line) bg-(--paper) p-6 lg:sticky lg:top-28">
                <h2 id="carrito-resumen" className="font-serif text-[24px] font-normal tracking-[-0.04em]">Resumen</h2>

                <dl className="mt-5 flex flex-col gap-2.5 border-b border-(--line) pb-5 text-[13px]">
                    <div className="flex justify-between">
                        <dt className="text-(--muted)">Platos</dt>
                        <dd className="font-bold">{unidades}</dd>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <dt className="text-(--muted)">Total</dt>
                        <dd className="font-serif text-[26px] tracking-[-0.04em] text-(--terracotta)">{formatPrice(total)}</dd>
                    </div>
                </dl>

                {noDisponibles > 0 && (
                    <div role="status" className="mt-5 flex items-start gap-2.5 rounded-sm bg-(--cream) p-3.5 text-[12px] leading-relaxed text-(--muted)">
                        <Info size={15} className="mt-0.5 shrink-0 text-(--terracotta)" aria-hidden="true" />
                        <div>
                            <p>
                                {noDisponibles === 1
                                    ? "Un plato no está disponible por ahora y no se suma al total."
                                    : `${noDisponibles} platos no están disponibles por ahora y no se suman al total.`}
                            </p>
                            <button type="button" onClick={quitarNoDisponibles} disabled={pending}
                                className="mt-1.5 cursor-pointer font-extrabold text-(--ink) underline underline-offset-4 transition-colors hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-not-allowed disabled:opacity-60">
                                {noDisponibles === 1 ? "Quitarlo de mi pedido" : "Quitarlos de mi pedido"}
                            </button>
                        </div>
                    </div>
                )}

                {error && noDisponibles === 0 && (
                    <div role="alert" className="mt-5 flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[12px] font-bold leading-relaxed text-(--terracotta)">
                        <AlertTriangle size={15} className="mt-px shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <Button type="button" className="w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        onClick={continuar} disabled={pending || noDisponibles > 0 || disponibles.length === 0} aria-busy={pending}>
                        {pending ? (
                            <>
                                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                                Revisando tu pedido…
                            </>
                        ) : (
                            "Continuar compra"
                        )}
                    </Button>

                    <button type="button" onClick={() => setClearOpen(true)} disabled={pending}
                        className="cursor-pointer text-[11px] font-extrabold text-(--muted) transition-colors hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-not-allowed disabled:opacity-60">
                        Vaciar pedido
                    </button>

                    <Link href="/carta" className="text-center text-[11px] font-extrabold text-(--ink) underline-offset-4 hover:underline">
                        Seguir viendo la carta
                    </Link>
                </div>
            </aside>

            <ConfirmDialog open={clearOpen} onClose={() => setClearOpen(false)} title="Vaciar pedido" tone="danger" icon={<Trash2 size={20} />}
                description="Vas a quitar todos los platos de tu pedido."
                warning="Tendrás que volver a añadirlos desde la carta."
                confirmLabel="Vaciar"
                pendingText="Vaciando…"
                action={vaciar}
                fields={{}}
            />
        </div>
    );
};
