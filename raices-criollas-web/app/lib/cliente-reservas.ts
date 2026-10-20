import { redirect } from "next/navigation";
import { getToken } from "./session";
import { Reserva, ReservaRequestDTO } from "../types/reservas";
import { ApiError, apiRequest } from "./api";

const RESERVAS_PREFIX = "/api/reservas";

async function clienteApi<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
  redirectUrl = "/mis-reservas"
): Promise<T> {
  const token = await getToken();

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(redirectUrl)}`);
  }

  try {
    return await apiRequest<T>(`${RESERVAS_PREFIX}${path}`, {
      method,
      body,
      token,
      revalidate: false,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?expired=1&next=${encodeURIComponent(redirectUrl)}`);
    }
    throw error;
  }
}

/**
 * Obtiene el historial propio de reservas del cliente autenticado.
 */
export async function getMisReservas(): Promise<Reserva[]> {
  return clienteApi<Reserva[]>("/reservas/mis-reservas", "GET", undefined, "/mis-reservas");
}

/**
 * Obtiene el detalle de una reserva propia del cliente autenticado.
 */
export async function getMiReserva(id: number): Promise<Reserva> {
  return clienteApi<Reserva>(`/reservas/mis-reservas/${id}`, "GET", undefined, "/mis-reservas");
}

/**
 * Solicita la creación de una nueva reserva para el cliente autenticado.
 * Nota: El frontend NO envía clienteId ni userId; el backend lo extrae del claim sub del JWT.
 */
export async function crearReservaCliente(dto: ReservaRequestDTO): Promise<Reserva> {
  return clienteApi<Reserva>("/reservas", "POST", dto, "/reservar-mesa");
}

/**
 * Cancela una reserva propia del cliente autenticado.
 */
export async function cancelarMiReserva(id: number): Promise<Reserva | null> {
  return clienteApi<Reserva | null>(`/reservas/${id}/cancelar`, "PATCH", undefined, "/mis-reservas");
}
