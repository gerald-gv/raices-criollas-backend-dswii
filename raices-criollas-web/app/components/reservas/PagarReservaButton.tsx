"use client"

import { useState, useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { pagarReservaPendienteAction } from "@/app/actions/pagos";

// Retoma el pago de una reserva pendiente. Misma reserva = misma clave en Pagos, por lo tanto no se duplica el cobro
export const PagarReservaButton = ({ reservaId }: { reservaId: number }) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pagar = () => {
    setError(null);

    startTransition(async () => {
      const result = await pagarReservaPendienteAction(reservaId);

      // Si todo sale bien la accion redirige a Mercado Pago y esto no llega a ejecutarse
      if (result?.ok === false) setError(result.mensaje);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={pagar}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-(--ink) px-3.5 py-1.5 text-[11px] font-extrabold text-white transition-colors hover:bg-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <CreditCard size={14} aria-hidden="true" />}
        {pending ? "Abriendo…" : "Pagar ahora"}
      </button>

      {error && (
        <p role="alert" className="max-w-56 text-right text-[11px] font-bold text-(--terracotta)">
          {error}
        </p>
      )}
    </div>
  );
};
