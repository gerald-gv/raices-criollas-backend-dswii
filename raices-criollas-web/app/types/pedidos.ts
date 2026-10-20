export type EstadoPedido = "PENDIENTE_PAGO" | "PAGADO" | "PREPARANDO" | "LISTO" | "ENVIANDO" | "ENTREGADO" | "CANCELADO";

export const ESTADOS_PEDIDO: EstadoPedido[] = ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO", "LISTO","ENVIANDO", "ENTREGADO", "CANCELADO"];

export const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE_PAGO: ["CANCELADO"],
  PAGADO: ["PREPARANDO"],
  PREPARANDO: ["LISTO"],
  LISTO: ["ENVIANDO"],
  ENVIANDO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

// ItemCarritoResponse
export interface ItemCarrito {
  platoId: number;
  cantidad: number;
  nombre: string | null;
  imagen: string | null;
  precioUnitario: number | null;
  subtotal: number | null;
  disponible: boolean;
}

export interface Carrito {
  clienteId: number | string;
  items: ItemCarrito[];
  total: number;
}

export interface ItemCarritoSync {
  platoId: number;
  cantidad: number;
}

export interface DetallePedido {
  platoId: number;
  nombrePlato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number | string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  direccionEntrega: string | null;
  telefonoContacto: string | null;
  detalles: DetallePedido[];
}

export interface FiltrosAdminPedidos {
  estado?: EstadoPedido;
  page?: number;
  size?: number;
}
