import { CotizacionRequestDTO, CotizacionResponseDTO, FiltroDisponibilidad, Mesa } from "../types/reservas";
import { apiRequest } from "./api";

const RESERVAS_PREFIX = "/api/reservas";

/**
 * Consulta pública de mesas disponibles en un rango horario y para una cantidad de comensales.
 * Usa revalidate: false (cache: "no-store") para no entregar datos obsoletos de disponibilidad.
 */
export async function getMesasDisponibles(filtro: FiltroDisponibilidad): Promise<Mesa[]> {
  const params = new URLSearchParams({
    fechaInicio: filtro.fechaInicio,
    fechaFin: filtro.fechaFin,
    cantidadPersonas: String(filtro.cantidadPersonas),
  });

  return apiRequest<Mesa[]>(`${RESERVAS_PREFIX}/mesas/disponibles?${params.toString()}`, {
    method: "GET",
    revalidate: false,
  });
}

/**
 * Cotiza en tiempo real el costo exacto de una reserva según la mesa y comensales.
 * Endpoint público sin autenticación requerida.
 */
export async function cotizarReserva(dto: CotizacionRequestDTO): Promise<CotizacionResponseDTO> {
  return apiRequest<CotizacionResponseDTO>(`${RESERVAS_PREFIX}/reservas/cotizar`, {
    method: "POST",
    body: dto,
    revalidate: false,
  });
}

export interface ResultadoConsultaMesas {
  mesas: Mesa[];
  error: string | null;
}

/**
 * Valida parámetros y consulta mesas disponibles, encapsulando validaciones de tiempo en la capa de datos.
 */
export async function consultarMesasDisponibles(
  fecha?: string,
  horaInicio?: string,
  horaFin?: string,
  personas = 2
): Promise<ResultadoConsultaMesas> {
  if (!fecha || !horaInicio || !horaFin) {
    return { mesas: [], error: null };
  }

  const inicioIso = `${fecha}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`;
  const finIso = `${fecha}T${horaFin.length === 5 ? `${horaFin}:00` : horaFin}`;

  const inicioDate = new Date(inicioIso);
  const finDate = new Date(finIso);

  if (Number.isNaN(inicioDate.getTime()) || Number.isNaN(finDate.getTime())) {
    return { mesas: [], error: "La fecha u horario ingresado no es válido." };
  }

  if (inicioDate >= finDate) {
    return { mesas: [], error: "La hora de inicio debe ser anterior a la hora de término." };
  }

  if (inicioDate.getTime() < Date.now() - 60000) {
    return {
      mesas: [],
      error: "La fecha y hora seleccionadas ya pasaron. Por favor elige un horario futuro.",
    };
  }

  try {
    const mesas = await getMesasDisponibles({
      fechaInicio: inicioIso,
      fechaFin: finIso,
      cantidadPersonas: personas,
    });
    return { mesas, error: null };
  } catch (err) {
    return {
      mesas: [],
      error:
        err instanceof Error
          ? err.message
          : "No pudimos consultar la disponibilidad de mesas en este momento.",
    };
  }
}

export interface ResultadoCotizacion {
  cotizacion: CotizacionResponseDTO | null;
  error: string | null;
}

/**
 * Obtiene de forma segura la cotización de una reserva para una mesa y fecha/hora seleccionadas.
 */
export async function obtenerCotizacionSegura(
  mesaId?: number,
  fecha?: string,
  horaInicio?: string,
  horaFin?: string,
  personas = 2
): Promise<ResultadoCotizacion> {
  if (!mesaId || !fecha || !horaInicio || !horaFin || personas < 1) {
    return { cotizacion: null, error: null };
  }

  const inicioIso = `${fecha}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`;
  const finIso = `${fecha}T${horaFin.length === 5 ? `${horaFin}:00` : horaFin}`;

  try {
    const cotizacion = await cotizarReserva({
      mesaId,
      fechaInicio: inicioIso,
      fechaFin: finIso,
      cantidadPersonas: personas,
    });
    return { cotizacion, error: null };
  } catch (err) {
    return {
      cotizacion: null,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo obtener la cotización para esta mesa en el horario seleccionado.",
    };
  }
}

/**
 * Formatea un valor numérico a moneda peruana (PEN / Soles) con formato estándar.
 */
export function formatPrice(value?: number | null, moneda = "PEN"): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "S/ 0.00";
  }
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda || "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}
