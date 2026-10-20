"use client"

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cart } from "./cartStore";
import { agregarAlCarritoAction } from "@/app/actions/pedidos";
import { Check, ShoppingBag } from "lucide-react";


interface AddToCartButtonProps {
    platoId: number;
    nombre: string;
    pill?: boolean;
}

export const AddToCartButton = ({ platoId, nombre, pill = false }: AddToCartButtonProps) => {
    const [pending, startTransition] = useTransition();
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!added) return;
        const timer = setTimeout(() => setAdded(false), 1800);
        return () => clearTimeout(timer);
    }, [added]);

    const handleClick = () => {
        setError(null);

        // El contador sube al instante, si el servidor lo rechaza, se deshace
        cart.add(platoId, 1);
        setAdded(true);

        startTransition(async () => {
            const result = await agregarAlCarritoAction(platoId, 1);

            if (result.requiereLogin) {
                cart.add(platoId, -1);
                setAdded(false);
                router.push(`/login?next=${encodeURIComponent(pathname)}`);
                return;
            }

            if (!result.ok) {
                cart.add(platoId, -1);
                setAdded(false);
                setError(result.mensaje ?? "No se pudo añadir el plato.");
                return;
            }

            // Si el contador aún no había cargado el carrito de la cuenta, se usa lo que respondió el servidor
            if (result.items && !cart.isReady()) cart.load(result.items);
        });
    };

    return (
        <div className={pill ? "flex flex-col items-center" : "flex flex-col"}>
            
            <button type="button" onClick={handleClick} disabled={pending} aria-busy={pending} aria-label={`Añadir ${nombre} al pedido`}
                className={`dish-card__cart inline-flex cursor-pointer select-none items-center justify-center gap-2 border text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors duration-200 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-wait disabled:opacity-70 ${added
                    ? "border-(--olive) bg-(--olive) text-white"
                    : "border-(--ink) bg-transparent text-(--ink) hover:border-(--terracotta) hover:bg-(--terracotta) hover:text-white"
                    } ${pill ? "rounded-full px-6 py-3" : "w-full rounded-sm px-4 py-3.25"}`}
            >
                {added ? <Check size={15} aria-hidden="true" /> : <ShoppingBag size={15} aria-hidden="true" />}
                {added ? "Añadido" : "Añadir al pedido"}
            </button>

            <p role="status" aria-live="polite" className={error ? "mt-2 text-[11px] font-bold text-(--terracotta)" : "sr-only"}>
                {error ?? (added ? `${nombre} añadido a tu pedido` : "")}
            </p>
        </div>
    );
};
