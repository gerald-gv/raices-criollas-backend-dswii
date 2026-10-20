"use client";

import { Button } from "@/app/components/ui/button";

export default function AdminReservasError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
        Error en Reservas
      </p>

      <h1 className="font-serif text-[clamp(28px,3vw,42px)] font-normal tracking-tighter">
        No se pudieron cargar las reservas
      </h1>

      <p className="max-w-md font-serif text-base leading-[1.7] text-(--muted)">
        {error.message ||
          "Verifica que el servicio de reservas esté en ejecución e inténtalo de nuevo."}
      </p>

      <Button onClick={reset}>Reintentar carga</Button>
    </div>
  );
}
