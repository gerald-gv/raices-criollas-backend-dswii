"use client"

import { ImagePlus, Loader2, X } from "lucide-react";
import { DragEvent, useEffect, useRef, useState } from "react";
import { subirImagen } from "@/app/actions/menu";
import { Field, inputClass } from "../../ui/field";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (limite del backend)

interface ImageFieldProps {
    defaultUrl?: string;
    error?: string;
}

/**
 * Campo de imagen con subida automática a Cloudinary.
 * Al seleccionar o soltar un archivo:
 *   1. Muestra una vista previa local inmediata.
 *   2. Llama a la Server Action subirImagen para subir el archivo.
 *   3. Cuando el backend responde, rellena el campo URL oculto
 *      con la URL de Cloudinary y borra la vista previa local.
 */
export const ImageField = ({ defaultUrl = "", error }: ImageFieldProps) => {
    const [url, setUrl] = useState(defaultUrl);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>();
    const [broken, setBroken] = useState(false);
    const [dragging, setDragging] = useState(false);
    const previewRef = useRef<string | null>(null);

    // Libera object URL al desmontar o al cambiar la vista previa
    useEffect(() => {
        return () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        };
    }, []);

    const subirArchivo = async (file: File) => {
        // Validaciones básicas en cliente (el backend las repite)
        if (!file.type.startsWith("image/")) {
            setUploadError("Elige un archivo de imagen (PNG o JPG).");
            return;
        }
        if (file.size > MAX_BYTES) {
            setUploadError("La imagen no debe superar los 5 MB.");
            return;
        }

        setUploadError(undefined);
        setBroken(false);

        // Vista previa local inmediata
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const objectUrl = URL.createObjectURL(file);
        previewRef.current = objectUrl;
        setPreview(objectUrl);
        setUrl(""); // limpia la URL anterior mientras sube

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("archivo", file);
            const resultado = await subirImagen(formData);

            if (resultado.error) {
                setUploadError(resultado.error);
                setPreview(null);
            } else {
                // Subida exitosa: usa la URL de Cloudinary
                setUrl(resultado.url!);
                // Libera la vista previa local (ya no se necesita)
                URL.revokeObjectURL(objectUrl);
                previewRef.current = null;
                setPreview(null);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) subirArchivo(file);
    };

    const quitarImagen = () => {
        if (previewRef.current) {
            URL.revokeObjectURL(previewRef.current);
            previewRef.current = null;
        }
        setPreview(null);
        setUrl("");
        setUploadError(undefined);
        setBroken(false);
    };

    // Qué mostrar en la zona de imagen
    const src = preview ?? (url && !broken ? url : null);
    const tieneImagen = !!src;

    return (
        <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">Imagen</span>

            {/* Input oculto que el formulario lee como campo "imagen" */}
            <input type="hidden" name="imagen" value={url} />

            <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer items-center gap-4 border border-dashed p-4 transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--terracotta) ${
                    dragging
                        ? "border-(--terracotta) bg-[#f8e9e2]"
                        : "border-(--line) bg-(--cream) hover:border-(--terracotta)"
                }`}
            >
                {/* Miniatura */}
                <span
                    className="flex size-24 shrink-0 items-center justify-center overflow-hidden bg-[#f2ebdc] text-(--terracotta)"
                    aria-hidden="true"
                >
                    {uploading ? (
                        <Loader2 size={28} strokeWidth={1.5} className="animate-spin" />
                    ) : src ? (
                        <img
                            key={src}
                            src={src}
                            alt=""
                            className="size-full object-cover animate-[fadeIn_300ms_ease]"
                            onError={() => setBroken(true)}
                        />
                    ) : (
                        <ImagePlus size={28} strokeWidth={1.25} />
                    )}
                </span>

                {/* Texto descriptivo */}
                <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold">
                        {uploading
                            ? "Subiendo imagen…"
                            : dragging
                            ? "Suelta la imagen aquí"
                            : tieneImagen
                            ? "Imagen cargada. Arrastra otra para reemplazarla."
                            : "Arrastra una imagen o haz clic para elegirla"}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-(--muted)">
                        PNG o JPG · máximo 5 MB
                    </span>
                </span>

                {/* Botón quitar */}
                {tieneImagen && !uploading && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); quitarImagen(); }}
                        aria-label="Quitar imagen"
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-(--line) bg-(--paper) text-(--muted) transition-colors duration-200 hover:border-(--terracotta) hover:text-(--terracotta)"
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                )}

                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) subirArchivo(file);
                        e.target.value = ""; // permite seleccionar el mismo archivo de nuevo
                    }}
                />
            </label>

            {/* Errores de subida */}
            {uploadError && (
                <p className="text-[12px] font-bold text-(--terracotta)" role="alert">
                    {uploadError}
                </p>
            )}

            {/* Error de validación del formulario (campo imagen) */}
            {error && (
                <p className="text-[12px] font-bold text-(--terracotta)" role="alert">
                    {error}
                </p>
            )}

            {/* Indicador de URL guardada (solo en desarrollo, ayuda a depurar) */}
            {process.env.NODE_ENV === "development" && url && (
                <p className="truncate text-[11px] text-(--muted)">
                    URL guardada: {url}
                </p>
            )}
        </div>
    );
};
