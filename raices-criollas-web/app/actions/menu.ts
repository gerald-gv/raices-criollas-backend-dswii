"use server"

import { revalidatePath } from "next/cache";
import { CategoriaInput, FormState, PlatoInput } from "../types/menu";
import { unstable_rethrow } from "next/navigation";
import { createCategoria, createPlato, deleteCategoria, deletePlato, setCategoriaActiva, setPlatoDestacado, setPlatoDisponible, subirImagenPlato, updateCategoria, updatePlato } from "../lib/admin-menu";
import { ApiError, getFieldErrors } from "../lib/api";


const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const checked = (formData: FormData, key: string) => formData.get(key) === "on";
const valuesOf = (formData: FormData) => Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

// Despues de cambiar el menu se refresca el panel y la carta publica
function refresh() {
    revalidatePath("/admin", "layout");
    revalidatePath("/carta");
    revalidatePath("/");
}

function toState(error: unknown): FormState {
    // Si el token vencio, lib/admin-menu hace redirect()
    unstable_rethrow(error);

    const errores = getFieldErrors(error);
    if (errores) return { mensaje: "Revisa los datos marcados.", errores };
    if (error instanceof ApiError) return { mensaje: error.message };
    return { mensaje: "Ocurrió un error inesperado. Inténtalo de nuevo." };
}

// Todas las acciones devuelven un FormState
const idOf = (formData: FormData) => Number(formData.get("id")) || undefined;

// Categorias 
function categoriaFromForm(formData: FormData): CategoriaInput {
    return {
        nombre: text(formData, "nombre"),
        descripcion: text(formData, "descripcion") || null,
        activo: checked(formData, "activo"),
    };
}

export async function guardarCategoria(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);

    try {
        const input = categoriaFromForm(formData);
        if (id) await updateCategoria(id, input);
        else await createCategoria(input);
    } catch (error) {
        return { ...toState(error), valores: valuesOf(formData) };
    }

    refresh();
    return { ok: true, mensaje: id ? "Categoría actualizada" : "Categoría creada" };
}

export async function cambiarEstadoCategoria(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    const activar = formData.get("activar") === "true";
    if (!id) return { mensaje: "Categoría no válida." };

    try {
        await setCategoriaActiva(id, activar);
    } catch (error) {
        return toState(error);
    }

    refresh();
    return { ok: true, mensaje: activar ? "Categoría activada" : "Categoría desactivada" };
}

export async function eliminarCategoria(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    if (!id) return { mensaje: "Categoría no válida." };

    try {
        await deleteCategoria(id);
    } catch (error) {
        // Ej: 409 "No se puede eliminar la categoria porque tiene platos asociados"
        return toState(error);
    }

    refresh();
    return { ok: true, mensaje: "Categoría eliminada" };
}

//  Platos 
function platoFromForm(formData: FormData): PlatoInput {
    const stock = text(formData, "stock");

    return {
        nombre: text(formData, "nombre"),
        descripcion: text(formData, "descripcion") || null,
        precio: Number(text(formData, "precio")),
        stock: stock === "" ? NaN : Number(stock),
        disponible: idOf(formData) ? checked(formData, "disponible") : true,
        destacado: checked(formData, "destacado"),
        imagen: text(formData, "imagen") || null,
        categoriaId: Number(text(formData, "categoriaId")),
    };
}

//se valida antes para dar un mensaje claro
function platoErrors(input: PlatoInput): Record<string, string> | undefined {
    const errores: Record<string, string> = {};
    if (!Number.isFinite(input.precio) || input.precio <= 0) errores.precio = "Ingresa un precio mayor a 0";
    if (!Number.isInteger(input.stock) || input.stock < 0) errores.stock = "Ingresa un stock entero de 0 o más";
    if (!input.categoriaId) errores.categoriaId = "Elige una categoría";
    return Object.keys(errores).length ? errores : undefined;
}

export async function guardarPlato(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    const input = platoFromForm(formData);

    const errores = platoErrors(input);
    if (errores) return { mensaje: "Revisa los datos marcados.", errores, valores: valuesOf(formData) };

    try {
        if (id) {
            await updatePlato(id, input);
        } else {
            await createPlato(input);
        }
    } catch (error) {
        console.error("[guardarPlato] Error al guardar:", error);

        if (error instanceof ApiError) {
            console.error("[guardarPlato] Status:", error.status);
            console.error("[guardarPlato] Mensaje:", error.message);
        }

        return {
            ...toState(error),
            valores: valuesOf(formData),
        };
    }

    refresh();
    return { ok: true, mensaje: id ? "Plato actualizado" : "Plato creado" };
}

export async function cambiarDisponibilidadPlato(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    const activar = formData.get("activar") === "true";
    if (!id) return { mensaje: "Plato no válido." };

    try {
        await setPlatoDisponible(id, activar);
    } catch (error) {
        return toState(error);
    }

    refresh();
    return { ok: true, mensaje: activar ? "Plato disponible en la carta" : "Plato oculto de la carta" };
}

export async function cambiarDestacadoPlato(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    const destacar = formData.get("destacar") === "true";
    if (!id) return { mensaje: "Plato no válido." };

    try {
        await setPlatoDestacado(id, destacar);
    } catch (error) {
        return toState(error);
    }

    refresh();
    return { ok: true, mensaje: destacar ? "Plato marcado como destacado" : "Plato quitado de destacados" };
}

export async function eliminarPlato(_prev: FormState, formData: FormData): Promise<FormState> {
    const id = idOf(formData);
    if (!id) return { mensaje: "Plato no válido." };

    try {
        await deletePlato(id);
    } catch (error) {
        return toState(error);
    }

    refresh();
    return { ok: true, mensaje: "Plato eliminado" };
}

/**
 * Server Action para subir una imagen desde el cliente.
 * Recibe un FormData con el campo "archivo" (File),
 * lo pasa al microservicio de menu y devuelve la URL de Cloudinary.
 */
export async function subirImagen(formData: FormData): Promise<{ url?: string; error?: string }> {
    const archivo = formData.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) {
        return { error: "No se recibió un archivo válido" };
    }
    try {
        const url = await subirImagenPlato(archivo);
        return { url };
    } catch (error) {
        unstable_rethrow(error);
        if (error instanceof ApiError) return { error: error.message };
        return { error: "No se pudo subir la imagen" };
    }
}
