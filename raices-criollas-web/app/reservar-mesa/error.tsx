"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ReservarMesaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#f8e9e2] text-(--terracotta)">
        <AlertCircle size={32} aria-hidden="true" />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
        Error al consultar reservas
      </p>
      <h1 className="mt-2 font-serif text-[clamp(28px,4vw,38px)] font-normal text-(--ink)">
        No se pudo completar la búsqueda
      </h1>
      <p className="mt-2 max-w-md text-[14px] text-(--muted)">
        {error.message || "Ocurrió un problema temporal al comunicarse con el servicio de reservas."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-sm bg-(--ink) px-5 py-3 text-xs font-extrabold text-white transition-colors hover:bg-(--terracotta)"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Intentar nuevamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm border border-(--ink) px-5 py-3 text-xs font-extrabold text-(--ink) transition-colors hover:bg-(--cream)"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
