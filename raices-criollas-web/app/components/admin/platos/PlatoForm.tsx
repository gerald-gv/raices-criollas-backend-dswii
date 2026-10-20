"use client"

import { guardarPlato } from "@/app/actions/menu";
import { Categoria, FormState, PlatoAdmin } from "@/app/types/menu";
import { useActionState, useEffect, useState } from "react";
import { useToast } from "../../ui/Toast";
import { AlertCircle } from "lucide-react";
import { Field, inputClass } from "../../ui/field";
import { ImageField } from "./ImageField";
import { Button } from "../../ui/button";
import { SubmitButton } from "../../ui/SubmitButton";
import { StockChangeNotice } from "./StockChangeNotice";

interface PlatoFormProps {
    categorias: Categoria[];
    plato?: PlatoAdmin;
    onClose: () => void;
}

export const PlatoForm = ({ categorias, plato, onClose }: PlatoFormProps) => {
    const [state, formAction] = useActionState(guardarPlato, {} as FormState);
    const { notify } = useToast();

    useEffect(() => {
        if (state.ok) {
            notify("ok", state.mensaje ?? "Guardado");
            onClose();
        }
    }, [state, notify, onClose]);

    // Stock y disponibilidad van juntos: el aviso se calcula contra el stock guardado
    const stockActual = plato?.stock ?? 0;
    const [stockTxt, setStockTxt] = useState(() => state.valores ? (state.valores.stock ?? "") : String(stockActual));
    const [disponible, setDisponible] = useState(() => state.valores ? state.valores.disponible === "on" : (plato?.disponible ?? true));
    const stockNuevo = Number(stockTxt);
    const stockValido = stockTxt !== "" && Number.isInteger(stockNuevo) && stockNuevo >= 0;

    const onStockChange = (txt: string) => {
        setStockTxt(txt);
        const n = Number(txt);
        // Repones un plato agotado: vuelve a la carta salvo que desmarques la casilla
        if (plato && stockActual === 0 && txt !== "" && Number.isInteger(n) && n > 0) setDisponible(true);
    };

    const error = (name: string) => state.errores?.[name];
    const value = (name: string, fallback: string) => state.valores ? (state.valores[name] ?? "") : fallback;

    return (
        <form action={formAction} className="flex flex-col gap-5">
            {plato && <input type="hidden" name="id" value={plato.id} />}

            {state.mensaje && !state.ok && (
                <div role="alert" className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)">
                    <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
                    {state.mensaje}
                </div>
            )}

            <Field label="Nombre" htmlFor="plato-nombre" error={error("nombre")}>
                <input id="plato-nombre" name="nombre" required minLength={3} maxLength={150} defaultValue={value("nombre", plato?.nombre ?? "")} placeholder="Ej.: Lomo saltado" aria-invalid={!!error("nombre")} className={inputClass} />
            </Field>

            <Field label="Descripción" htmlFor="plato-descripcion" error={error("descripcion")}>
                <textarea id="plato-descripcion" name="descripcion" rows={3} maxLength={500} defaultValue={value("descripcion", plato?.descripcion ?? "")} aria-invalid={!!error("descripcion")} className={`${inputClass} resize-y`} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Precio (S/)" htmlFor="plato-precio" error={error("precio")}>
                    <input id="plato-precio" name="precio" type="number" required min="0.01" step="0.01" inputMode="decimal" defaultValue={value("precio", plato ? String(plato.precio) : "")} placeholder="0.00" aria-invalid={!!error("precio")} className={inputClass} />
                </Field>

                <Field label="Stock (unidades)" htmlFor="plato-stock" error={error("stock")} hint={plato ? undefined : "Al llegar a 0 el plato se oculta solo."}>
                    <input id="plato-stock" name="stock" type="number" required min="0" step="1" inputMode="numeric" value={stockTxt} onChange={(e) => onStockChange(e.target.value)} placeholder="0" aria-invalid={!!error("stock")} className={inputClass} />
                </Field>
            </div>

            {plato && stockValido && <StockChangeNotice actual={stockActual} nuevo={stockNuevo} />}

            <Field label="Categoría" htmlFor="plato-categoria" error={error("categoriaId")}>
                <select id="plato-categoria" name="categoriaId" required defaultValue={value("categoriaId", plato ? String(plato.categoriaId) : "")} aria-invalid={!!error("categoriaId")} className={inputClass}>
                    <option value="" disabled>Elige una categoría</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}{categoria.activo ? "" : " (inactiva)"}
                        </option>
                    ))}
                </select>
            </Field>

            <ImageField defaultUrl={value("imagen", plato?.imagen ?? "")} error={error("imagen")} />

            {/* Al crear, Menu publica el plato si tiene stock; la casilla solo existe al editar */}
            {plato && (
                <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" name="disponible" checked={stockValido && stockNuevo === 0 ? false : disponible} disabled={stockValido && stockNuevo === 0} onChange={(e) => setDisponible(e.target.checked)} className="mt-0.5 size-4 accent-(--terracotta)" />
                    <span>
                        <span className="block text-[13px] font-bold">Disponible en la carta</span>
                        <span className="block text-[12px] text-(--muted)">Desmárcalo para ocultarlo. Con stock 0 se oculta solo.</span>
                    </span>
                </label>
            )}

            <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="destacado" defaultChecked={state.valores ? state.valores.destacado === "on" : (plato?.destacado ?? false)} className="mt-0.5 size-4 accent-(--terracotta)" />
                <span>
                    <span className="block text-[13px] font-bold">Destacado en la home</span>
                    <span className="block text-[12px] text-(--muted)">Máximo 5 platos pueden estar destacados al mismo tiempo.</span>
                </span>
            </label>

            <div className="mt-1 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <SubmitButton>{plato ? "Guardar cambios" : "Crear plato"}</SubmitButton>
            </div>
        </form>
    );
};
