"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { actualizarMesa, cambiarEstadoMesa, crearMesa } from "../lib/admin-mesas";
import { ApiError, getFieldErrors } from "../lib/api";
import { FormState } from "../types/menu";
import { MesaRequestDTO } from "../types/reservas";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const checked = (formData: FormData, key: string) => formData.get(key) === "on";
const valuesOf = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

function refreshMesas() {
  revalidatePath("/admin/mesas");
  revalidatePath("/reservar-mesa");
}

function toState(error: unknown): FormState {
  unstable_rethrow(error);

  const errores = getFieldErrors(error);
  if (errores) return { mensaje: "Revisa los datos marcados.", errores };

  if (error instanceof ApiError) {
    if (error.status === 409) {
      return {
        mensaje: error.message || "Ya existe una mesa con ese número o hay un conflicto.",
        errores: { numeroMesa: "El número o código de mesa ya está registrado" },
      };
    }
    return { mensaje: error.message };
  }

  return { mensaje: "Ocurrió un error inesperado al gestionar la mesa." };
}

function mesaFromForm(formData: FormData): MesaRequestDTO {
  const precioBaseStr = text(formData, "precioBase");
  const precioBase = precioBaseStr ? Number(precioBaseStr) : 20.0;

  return {
    numeroMesa: text(formData, "numeroMesa"),
    capacidad: Number(text(formData, "capacidad")),
    ubicacion: text(formData, "ubicacion"),
    precioBase: Number.isFinite(precioBase) && precioBase >= 0 ? precioBase : 20.0,
    activo: checked(formData, "activo"),
  };
}

function validarMesa(dto: MesaRequestDTO): Record<string, string> | undefined {
  const errores: Record<string, string> = {};

  if (!dto.numeroMesa || String(dto.numeroMesa).trim().length === 0) {
    errores.numeroMesa = "Ingresa un número o código de mesa (ej.: 12 o M-03)";
  }

  if (!Number.isInteger(dto.capacidad) || dto.capacidad <= 0) {
    errores.capacidad = "Ingresa una capacidad de comensales válida mayor a 0";
  }

  if (!dto.ubicacion || dto.ubicacion.length < 2) {
    errores.ubicacion = "Indica la ubicación (ej.: Salón Principal, Terraza, Balcón)";
  }

  if (dto.precioBase !== undefined && (!Number.isFinite(dto.precioBase) || dto.precioBase < 0)) {
    errores.precioBase = "Ingresa una tarifa base mayor o igual a 0";
  }

  return Object.keys(errores).length > 0 ? errores : undefined;
}

/**
 * Server Action para crear o editar una mesa con soporte de tarifa base.
 */
export async function guardarMesaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const idStr = text(formData, "id");
  const id = idStr ? Number(idStr) : undefined;
  const input = mesaFromForm(formData);

  const errores = validarMesa(input);
  if (errores) {
    return {
      mensaje: "Revisa los datos ingresados.",
      errores,
      valores: valuesOf(formData),
    };
  }

  try {
    if (id) {
      await actualizarMesa(id, input);
    } else {
      await crearMesa(input);
    }
  } catch (error) {
    return {
      ...toState(error),
      valores: valuesOf(formData),
    };
  }

  refreshMesas();
  return {
    ok: true,
    mensaje: id ? "Mesa actualizada exitosamente" : "Mesa creada exitosamente",
  };
}

/**
 * Server Action para alternar estado activo/inactivo de una mesa.
 */
export async function cambiarEstadoMesaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = Number(formData.get("id"));
  const activar = formData.get("activar") === "true";

  if (!id) {
    return { mensaje: "Mesa no identificada." };
  }

  try {
    await cambiarEstadoMesa(id, activar);
  } catch (error) {
    return toState(error);
  }

  refreshMesas();
  return {
    ok: true,
    mensaje: activar ? "Mesa activada correctamente" : "Mesa desactivada correctamente",
  };
}
