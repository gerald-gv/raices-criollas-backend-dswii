"use client"

import { realizarPagoAction } from "@/app/actions/pagos";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";

// Crea el pedido, crea el pago y lleva al cliente a Mercado Pago
export const RealizarPagoButton = ({ disabled = false }: { disabled?: boolean }) => {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const pagar = () => {
        setError(null);

        startTransition(async () => {
            const result = await realizarPagoAction();

            if (result?.ok === false) setError(result.mensaje);
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[12px] font-bold leading-relaxed text-(--terracotta)">
                    <AlertTriangle size={15} className="mt-px shrink-0" aria-hidden="true" />
                    {error}
                </div>
            )}

            <Button type="button" className="w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" onClick={pagar} disabled={pending || disabled} aria-busy={pending}>
                {pending ? (
                    <>
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        Abriendo Mercado Pago…
                    </>
                ) : (
                    <>
                        <CreditCard size={15} aria-hidden="true" />
                        Realizar pago
                    </>
                )}
            </Button>
        </div>
    );
};
