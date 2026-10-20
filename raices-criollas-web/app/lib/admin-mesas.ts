import { redirect } from "next/navigation";
import { getToken } from "./session";
import { Mesa, MesaEstadoRequestDTO, MesaRequestDTO } from "../types/reservas";
import { ApiError, apiRequest } from "./api";

const RESERVAS_PREFIX = "/api/reservas";

async function adminMesasApi<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = await getToken();

  if (!token) {
    redirect("/login?next=/admin/mesas");
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
      redirect("/login?expired=1&next=/admin/mesas");
    }
    throw error;
  }
}

/**
 * Listado administrativo de mesas registradas.
 */
export async function listAdminMesas(): Promise<Mesa[]> {
  return adminMesasApi<Mesa[]>("/mesas", "GET");
}

/**
 * Consulta de una mesa por ID para el administrador.
 */
export async function getAdminMesa(id: number): Promise<Mesa> {
  return adminMesasApi<Mesa>(`/mesas/${id}`, "GET");
}

/**
 * Crea una nueva mesa.
 */
export async function crearMesa(input: MesaRequestDTO): Promise<Mesa> {
  return adminMesasApi<Mesa>("/mesas", "POST", input);
}

/**
 * Actualiza los datos de una mesa existente.
 */
export async function actualizarMesa(id: number, input: MesaRequestDTO): Promise<Mesa> {
  return adminMesasApi<Mesa>(`/mesas/${id}`, "PUT", input);
}

/**
 * Activa o desactiva una mesa.
 */
export async function cambiarEstadoMesa(id: number, activo: boolean): Promise<Mesa | null> {
  const body: MesaEstadoRequestDTO = { activo };
  return adminMesasApi<Mesa | null>(`/mesas/${id}/estado`, "PATCH", body);
}
