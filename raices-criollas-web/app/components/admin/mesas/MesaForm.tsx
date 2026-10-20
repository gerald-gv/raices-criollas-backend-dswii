"use client";

import { guardarMesaAction } from "@/app/actions/mesas";
import { FormState } from "@/app/types/menu";
import { Mesa } from "@/app/types/reservas";
import { AlertCircle } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useToast } from "../../ui/Toast";
import { Field, inputClass } from "../../ui/field";
import { Button } from "../../ui/button";
import { SubmitButton } from "../../ui/SubmitButton";

interface MesaFormProps {
  mesa?: Mesa;
  onClose: () => void;
}

export const MesaForm = ({ mesa, onClose }: MesaFormProps) => {
  const [state, formAction] = useActionState(guardarMesaAction, {} as FormState);
  const { notify } = useToast();

  useEffect(() => {
    if (state.ok) {
      notify("ok", state.mensaje ?? "Mesa guardada con éxito");
      onClose();
    }
  }, [state, notify, onClose]);

  const error = (name: string) => state.errores?.[name];
  const value = (name: string, fallback: string | number) =>
    state.valores ? (state.valores[name] ?? "") : String(fallback);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mesa && <input type="hidden" name="id" value={mesa.id} />}

      {state.mensaje && !state.ok && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[13px] font-bold text-(--terracotta)"
        >
          <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
          <div>
            <p>{state.mensaje}</p>
            {state.errores && Object.keys(state.errores).length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-[12px] font-normal">
                {Object.entries(state.errores).map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Número de mesa" htmlFor="mesa-numero" error={error("numeroMesa")}>
          <input
            id="mesa-numero"
            name="numeroMesa"
            type="number"
            min={1}
            max={999}
            required
            defaultValue={value("numeroMesa", mesa?.numeroMesa ?? "")}
            placeholder="Ej.: 12"
            aria-invalid={!!error("numeroMesa")}
            className={inputClass}
          />
        </Field>

        <Field label="Capacidad (personas)" htmlFor="mesa-capacidad" error={error("capacidad")}>
          <input
            id="mesa-capacidad"
            name="capacidad"
            type="number"
            min={1}
            max={30}
            required
            defaultValue={value("capacidad", mesa?.capacidad ?? 4)}
            placeholder="Ej.: 4"
            aria-invalid={!!error("capacidad")}
            className={inputClass}
          />
        </Field>

        <Field
          label="Tarifa base (S/)"
          htmlFor="mesa-precioBase"
          error={error("precioBase")}
          hint="Costo base fijado por el restaurante (S/ 20.00)"
        >
          <input
            id="mesa-precioBase"
            name="precioBase"
            type="number"
            min={0}
            max={999}
            step="0.50"
            defaultValue={value("precioBase", mesa?.precioBase ?? 20)}
            placeholder="20.00"
            aria-invalid={!!error("precioBase")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Ubicación"
        htmlFor="mesa-ubicacion"
        error={error("ubicacion")}
        hint="Área del restaurante donde se sitúa la mesa (ej.: Salón Principal, Terraza, Balcón)."
      >
        <input
          id="mesa-ubicacion"
          name="ubicacion"
          type="text"
          required
          minLength={2}
          maxLength={60}
          defaultValue={value("ubicacion", mesa?.ubicacion ?? "Salón Principal")}
          placeholder="Ej.: Terraza Jardín"
          aria-invalid={!!error("ubicacion")}
          className={inputClass}
          list="ubicaciones-sugeridas"
        />
        <datalist id="ubicaciones-sugeridas">
          <option value="Salón Principal" />
          <option value="Terraza" />
          <option value="Balcón Criollo" />
          <option value="Área Familiar" />
          <option value="Zona Bar" />
        </datalist>
      </Field>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={
            state.valores ? state.valores.activo === "on" : (mesa?.activo ?? true)
          }
          className="mt-0.5 size-4 accent-(--terracotta)"
        />
        <span>
          <span className="block text-[13px] font-bold">Mesa activa</span>
          <span className="block text-[12px] text-(--muted)">
            Las mesas inactivas no aparecen en las búsquedas públicas ni pueden recibir nuevas reservas.
          </span>
        </span>
      </label>

      <div className="mt-2 flex items-center justify-end gap-3 border-t border-(--line) pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <SubmitButton>
          {mesa ? "Guardar cambios" : "Crear mesa"}
        </SubmitButton>
      </div>
    </form>
  );
};
