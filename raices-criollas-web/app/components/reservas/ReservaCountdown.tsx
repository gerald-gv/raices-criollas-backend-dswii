"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ReservaCountdownProps {
  fechaExpiracion: string; // ISO-8601 string
}

export const ReservaCountdown = ({ fechaExpiracion }: ReservaCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    minutos: number;
    segundos: number;
    expirado: boolean;
  } | null>(null);

  useEffect(() => {
    const calcular = () => {
      const expDate = new Date(fechaExpiracion).getTime();
      const diff = expDate - Date.now();

      if (diff <= 0) {
        setTimeLeft({ minutos: 0, segundos: 0, expirado: true });
        return;
      }

      const totalSegundos = Math.floor(diff / 1000);
      const minutos = Math.floor(totalSegundos / 60);
      const segundos = totalSegundos % 60;

      setTimeLeft({ minutos, segundos, expirado: false });
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [fechaExpiracion]);

  if (!timeLeft) {
    return null;
  }

  if (timeLeft.expirado) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-sm border border-(--terracotta) bg-[#f8e9e2] p-4 text-[13px] text-(--terracotta)"
      >
        <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <strong className="block font-bold">Tiempo de espera expirado</strong>
          <span>
            La ventana de 15 minutos para procesar esta reserva ha finalizado. La mesa ha sido liberada
            automáticamente para otros comensales.
          </span>
        </div>
      </div>
    );
  }

  const formatoMinutos = String(timeLeft.minutos).padStart(2, "0");
  const formatoSegundos = String(timeLeft.segundos).padStart(2, "0");

  return (
    <div className="flex items-center justify-between rounded-sm border border-(--gold)/50 bg-(--yellow)/15 px-4 py-3 text-[13px]">
      <div className="flex items-center gap-2 text-(--ink)">
        <Clock size={16} className="text-(--terracotta) shrink-0" aria-hidden="true" />
        <span className="font-medium">Tiempo restante de validez de solicitud:</span>
      </div>
      <span className="font-mono text-[16px] font-extrabold text-(--terracotta)">
        {formatoMinutos}:{formatoSegundos}
      </span>
    </div>
  );
};
