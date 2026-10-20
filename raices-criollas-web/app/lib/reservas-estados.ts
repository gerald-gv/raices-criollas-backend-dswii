import { Reserva } from "../types/reservas";

export const estaVencida = (
  reserva: Pick<Reserva, "estado" | "estadoPago" | "fechaExpiracionPago">,
  ahora = Date.now(),
): boolean => {
  if (reserva.estado !== "PENDIENTE" || reserva.estadoPago !== "PENDIENTE" || !reserva.fechaExpiracionPago) return false;

  const limite = new Date(reserva.fechaExpiracionPago).getTime();
  return !Number.isNaN(limite) && limite < ahora;
};

// "2026-10-18T20:45:12.123" -> "20:45" (sin pasar por Date: evita diferencias entre servidor y navegador)
export const horaDe = (iso?: string | null): string => iso?.split("T")[1]?.slice(0, 5) ?? "";
