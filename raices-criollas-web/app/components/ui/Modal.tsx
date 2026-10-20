"use client"

import { X } from "lucide-react";
import { ReactNode, useEffect, useId, useRef } from "react";


interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    size?: "sm" | "md";
    children: ReactNode;
}

// El contenido solo se monta mientras esta abierto, asi cada apertura empieza con el formulario limpio
export const Modal = ({ open, onClose, title, size = "md", children }: ModalProps) => {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={ref} aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            className={`modal m-auto max-h-[90vh] w-[92vw] ${size === "sm" ? "max-w-md" : "max-w-xl"} overflow-y-auto border border-(--line) bg-(--paper) p-0 text-(--ink)`}
        >
            {open && (
                <div className="p-6 sm:p-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <h2 id={titleId} className="font-serif text-[clamp(26px,3vw,32px)] font-normal leading-none tracking-tighter">
                            {title}
                        </h2>

                        <button type="button" onClick={onClose} aria-label="Cerrar"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-(--muted) transition-colors duration-200 hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)">
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>

                    {children}
                </div>
            )}
        </dialog>
    );
};
