"use client"

import { useEffect } from "react";
import { cart, useCartCount } from "./cartStore";
import { cargarCarritoAction } from "@/app/actions/pedidos";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";


export const CartLink = ({ loggedIn }: { loggedIn: boolean }) => {
    const count = useCartCount();

    useEffect(() => {
        if (!loggedIn) {
            cart.reset();
            return;
        }
        if (cart.isReady()) return;

        let active = true;
        void cargarCarritoAction().then((items) => {
            if (active && !cart.isReady()) cart.load(items);
        });

        return () => {
            active = false;
        };
    }, [loggedIn]);

    const shown = loggedIn ? count : 0;

    return (
        <Link href="/carrito" aria-label={`Ver pedido, ${shown} ${shown === 1 ? "producto" : "productos"}`} className="flex cursor-pointer items-center gap-1.75 border-0 bg-transparent p-2.5 text-(--ink) transition-colors hover:text-(--terracotta)">
            
            <ShoppingBag size={19} />

            <span className="flex size-4.5 items-center justify-center rounded-full bg-(--yellow) text-[10px] font-extrabold text-(--ink)">
                {shown > 99 ? "99+" : shown}
            </span>
            
        </Link>
    );
};
