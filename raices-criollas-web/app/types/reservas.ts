import { ApiResponse } from "./ApiResponse";

export type EstadoReserva = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
export type EstadoPago = "PENDIENTE" | "PAGADO" | "FALLIDO" | "REEMBOLSADO";

export interface Mesa {
  id: number;
  numeroMesa: string | number;
  capacidad: number;
  ubicacion: string;
  precioBase?: number;
  activo: boolean;
}

export interface MesaRequestDTO {
  numeroMesa: string | number;
  capacidad: number;
  ubicacion: string;
  precioBase?: number;
  activo: boolean;
}

export interface MesaEstadoRequestDTO {
  activo: boolean;
}

export interface CotizacionRequestDTO {
  mesaId: number;
  fechaInicio: string; // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  fechaFin: string;    // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
}

export interface CotizacionResponseDTO {
  mesaId: number;
  numeroMesa: string | number;
  capacidadMesa: number;
  cantidadPersonas: number;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos: number;
  moneda: string;
  precioBaseMesa: number;
  tarifaBaseMesa: number;
  tarifaPorPersona: number;
  subtotalPersonas: number;
  montoTotal: number;
  disponible: boolean;
  mensaje: string;
  desglose: string;
}

export interface Reserva {
  id: number;
  clienteId: string | number;
  mesa: Mesa;
  fechaInicio: string; // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  fechaFin: string;    // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
  montoTotal: number;
  moneda: string;
  estado: EstadoReserva;
  estadoPago: EstadoPago;
  fechaCreacion?: string | null;
  fechaExpiracionPago?: string | null;
  observaciones: string | null;
  fechaActualizacion?: string | null;
  createdAt?: string | null;
}

export interface ReservaRequestDTO {
  mesaId: number;
  fechaInicio: string; // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  fechaFin: string;    // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
  observaciones?: string | null;
}

export interface ActualizarEstadoReservaDTO {
  estado?: EstadoReserva;
  estadoPago?: EstadoPago;
  observaciones?: string | null;
}

export interface FiltroDisponibilidad {
  fechaInicio: string; // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  fechaFin: string;    // ISO-8601: "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
}

export interface FiltrosAdminReservas {
  estado?: EstadoReserva | "TODOS";
  estadoPago?: EstadoPago | "TODOS";
  clienteId?: string | number;
  mesaId?: number;
  fecha?: string;
  desde?: string;
  hasta?: string;
}

// Re-exportamos FormState para uniformidad
export interface ReservaFormState {
  ok?: boolean;
  mensaje?: string;
  errores?: Record<string, string>;
  valores?: Record<string, string>;
  data?: Reserva;
}

// Resumen agregado de un cliente derivado de sus reservas
export interface ClienteResumen {
  clienteId: string;
  totalReservas: number;
  confirmadas: number;
  canceladas: number;
  completadas: number;
  pendientes: number;
  montoTotalAcumulado?: number;
  ultimaReserva?: string;
}

export type { ApiResponse };
