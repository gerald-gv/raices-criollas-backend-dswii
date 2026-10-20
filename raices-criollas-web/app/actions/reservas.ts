"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { cancelarMiReserva, crearReservaCliente, getMiReserva } from "../lib/cliente-reservas";
import { actualizarEstadoReserva, getAdminReserva } from "../lib/admin-reservas";
import { ApiError, getFieldErrors } from "../lib/api";
import { crearPagoReserva } from "../lib/pagos";
import { EstadoReserva, Reserva, ReservaFormState, ReservaRequestDTO } from "../types/reservas";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const valuesOf = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

function toState(error: unknown): ReservaFormState {
  unstable_rethrow(error);

  const errores = getFieldErrors(error);
  if (errores) return { mensaje: "Revisa los datos marcados.", errores };

  if (error instanceof ApiError) {
    if (error.status === 409) {
      return {
        mensaje:
          error.message ||
          "La mesa ya no está disponible para ese horario o existe un conflicto. Por favor realiza una nueva búsqueda.",
      };
    }
    return { mensaje: error.message };
  }

  return { mensaje: "Ocurrió un error inesperado. Inténtalo de nuevo." };
}

function refreshReservas() {
  revalidatePath("/mis-reservas");
  revalidatePath("/reservar-mesa");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/clientes");
}
/**
 * Server Action para reservar una mesa: crea la reserva (queda PENDIENTE, con plazo para pagar) y abre el pago
 * en Mercado Pago. La reserva solo pasa a CONFIRMADA cuando el pago se aprueba.
 * IMPORTANTE: No se recibe ni envía clienteId ni userId en el DTO. El backend extrae el sub del JWT.
 */

const MENSAJE_PAGADA = "Esta reserva ya está pagada y por ahora los reembolsos no se hacen desde la web. Comunícate con el restaurante para cancelarla.";

export async function crearReservaAction(_prev: ReservaFormState, formData: FormData): Promise<ReservaFormState> {
  const mesaId = Number(text(formData, "mesaId"));
  const fecha = text(formData, "fecha");
  const horaInicio = text(formData, "horaInicio");
  const horaFin = text(formData, "horaFin");
  const cantidadPersonas = Number(text(formData, "cantidadPersonas"));
  const observaciones = text(formData, "observaciones") || null;

  const errores: Record<string, string> = {};

  if (!mesaId || mesaId <= 0) {
    errores.mesaId = "Selecciona una mesa válida";
  }

  if (!fecha) {
    errores.fecha = "Selecciona la fecha de reserva";
  }

  if (!horaInicio) {
    errores.horaInicio = "Selecciona la hora de inicio";
  }

  if (!horaFin) {
    errores.horaFin = "Selecciona la hora de fin";
  }

  if (!cantidadPersonas || cantidadPersonas < 1) {
    errores.cantidadPersonas = "Indica al menos 1 persona";
  }

  if (Object.keys(errores).length > 0) {
    return {
      mensaje: "Por favor revisa los datos ingresados.",
      errores,
      valores: valuesOf(formData),
    };
  }

  // Formato ISO local para Spring LocalDateTime: YYYY-MM-DDTHH:mm:ss
  const inicioIso = `${fecha}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`;
  const finIso = `${fecha}T${horaFin.length === 5 ? `${horaFin}:00` : horaFin}`;

  const inicioDate = new Date(inicioIso);
  const finDate = new Date(finIso);

  if (Number.isNaN(inicioDate.getTime()) || Number.isNaN(finDate.getTime())) {
    return {
      mensaje: "Las fechas u horas proporcionadas no son válidas.",
      valores: valuesOf(formData),
    };
  }

  if (inicioDate >= finDate) {
    return {
      mensaje: "La hora de inicio debe ser anterior a la hora de finalización.",
      errores: { horaFin: "Debe ser posterior a la hora de inicio" },
      valores: valuesOf(formData),
    };
  }

  if (inicioDate.getTime() < Date.now()) {
    return {
      mensaje: "No es posible realizar reservas en fechas u horas pasadas.",
      errores: { fecha: "La fecha y hora deben ser futuras" },
      valores: valuesOf(formData),
    };
  }

  const dto: ReservaRequestDTO = {
    mesaId,
    fechaInicio: inicioIso,
    fechaFin: finIso,
    cantidadPersonas,
    observaciones,
  };

  let reserva: Reserva;

  try {
    reserva = await crearReservaCliente(dto);
  } catch (error) {
    return {
      ...toState(error),
      valores: valuesOf(formData),
    };
  }

  refreshReservas();

  // La reserva ya existe, si Mercado Pago no se puede abrir ahora, queda en «Mis reservas» para pagarla desde ahi
  let urlPago: string | null = null;

  try {

    const pago = await crearPagoReserva(reserva.id);
    urlPago = pago.urlPago;

  } catch (error) {
    unstable_rethrow(error); // Un redirect a /login (sesion vencida) debe seguir su curso
  }

  if (urlPago) redirect(urlPago);

  return {
    ok: true,
    data: reserva, // El formulario muestra la reserva pendiente con su botón «Pagar ahora»
    mensaje:
      "Tu reserva quedó registrada, pero no pudimos abrir Mercado Pago. Págala desde «Mis reservas» antes de que venza el plazo o la mesa se liberará.",
  };
}

/**
 * Server Action para que el cliente cancele su propia reserva.
 */
export async function cancelarMiReservaAction(_prev: ReservaFormState, formData: FormData): Promise<ReservaFormState> {
  const id = Number(formData.get("id"));

  if (!id) {
    return { mensaje: "Reserva no válida para cancelar." };
  }

  try {
    const reserva = await getMiReserva(id);
    if (reserva.estadoPago === "PAGADO") return { mensaje: MENSAJE_PAGADA };

    await cancelarMiReserva(id);
  } catch (error) {
    return toState(error);
  }

  refreshReservas();
  return {
    ok: true,
    mensaje: "Tu reserva ha sido cancelada.",
  };
}

/**
 * Server Action para que el administrador actualice el estado de una reserva.
 */
export async function cambiarEstadoReservaAdminAction(
  _prev: ReservaFormState,
  formData: FormData
): Promise<ReservaFormState> {
  const id = Number(formData.get("id"));
  const nuevoEstado = text(formData, "estado") as EstadoReserva;
  const observaciones = text(formData, "observaciones") || null;

  if (!id) {
    return { mensaje: "Reserva no identificada." };
  }

  // CONFIRMADA no se elige a mano: la reserva se confirma sola cuando Mercado Pago aprueba el pago
  const estadosValidos: EstadoReserva[] = ["CANCELADA", "COMPLETADA"];
  if (!estadosValidos.includes(nuevoEstado)) {
    return { mensaje: "El estado seleccionado no es válido." };
  }

  try {
    if (nuevoEstado === "CANCELADA") {
      const reserva = await getAdminReserva(id);
      if (reserva.estadoPago === "PAGADO") return { mensaje: MENSAJE_PAGADA };
    }

    await actualizarEstadoReserva(id, {
      estado: nuevoEstado,
      observaciones,
    });
    
  } catch (error) {
    return toState(error);
  }

  refreshReservas();
  return {
    ok: true,
    mensaje: `Estado de reserva actualizado a ${nuevoEstado}.`,
  };
}
