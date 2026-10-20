export type EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO" | "REEMBOLSADO";

export type TipoPago = "PEDIDO" | "RESERVA";

// PagoResponse
export interface Pago {
  id: number;
  tipo: TipoPago;
  pedidoId: number | null;
  reservaId: number | null;
  monto: number;
  moneda: string;
  estado: EstadoPago;
  urlPago: string | null;
  creadoEn: string;
  venceEn: string | null;
}
