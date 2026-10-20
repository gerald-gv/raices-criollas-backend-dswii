import { Categoria, Plato } from "../types/menu";
import { apiGet } from "./api";

// Ruta publica del gateway
const MENU = "/api/menu";

export interface PlatoFiltros {
  nombre?: string;
  categoriaId?: number;
  precioMin?: number;
  precioMax?: number;
}

export const getCategoriasActivas = () => apiGet<Categoria[]>(`${MENU}/categorias/activas`);

export const getPlatosDisponibles = (filtros: PlatoFiltros = {}) => {
  const params = new URLSearchParams();

  // Solo se envian los filtros con valor: un "?nombre=" vacio podria filtrar de mas
  if (filtros.nombre?.trim()) params.set("nombre", filtros.nombre.trim());
  if (filtros.categoriaId) params.set("categoriaId", String(filtros.categoriaId));
  if (filtros.precioMin !== undefined) params.set("precioMin", String(filtros.precioMin));
  if (filtros.precioMax !== undefined) params.set("precioMax", String(filtros.precioMax));

  const query = params.toString();
  
  return apiGet<Plato[]>(`${MENU}/platos/disponibles${query ? `?${query}` : ""}`);
};

/** Platos marcados como destacados (disponibles, categoría activa). Usado en la home. */
export const getPlatosDestacados = () => apiGet<Plato[]>(`${MENU}/platos/destacados`, 60);
