"use client"

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Kind = "ok" | "error";

interface ToastItem {
    id: string;
    kind: Kind;
    message: string;
    exiting?: boolean;
}

interface ToastContextValue {
    notify: (kind: Kind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3000;
const EXIT_DURATION = 350;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ToastItem[]>([]);
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);

        timers.current.delete(id);

        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, exiting: true } : item
            )
        );

        const removalTimer = setTimeout(() => {
            setItems((current) => current.filter((item) => item.id !== id));
            timers.current.delete(id);
        }, EXIT_DURATION);

        timers.current.set(id, removalTimer);
    }, []);

    const notify = useCallback((kind: Kind, message: string) => {
        const id = crypto.randomUUID();

        setItems((current) => [...current, { id, kind, message }]);

        const timer = setTimeout(() => dismiss(id), TOAST_DURATION);
        timers.current.set(id, timer);
    }, [dismiss]);

    useEffect(() => {
        return () => {
            timers.current.forEach(clearTimeout);
            timers.current.clear();
        };
    }, []);

    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="toast-viewport pointer-events-none fixed right-3 top-3 z-100 w-[calc(100vw-24px)] sm:right-6 sm:top-6 sm:w-[min(400px,calc(100vw-48px))]" aria-label="Notificaciones">
                <div className="flex flex-col gap-3" aria-live="polite" aria-relevant="additions">

                    {items.map((item) => {
                        const isError = item.kind === "error";

                        return (
                            <article key={item.id} role={isError ? "alert" : "status"}
                                className={["toast pointer-events-auto relative flex items-start gap-3 overflow-hidden border border-(--line) border-l-[3px] bg-(--paper) p-3.5 pb-5 text-(--ink) shadow-[0_12px_35px_rgba(38,37,31,0.10),0_2px_8px_rgba(38,37,31,0.04)] sm:p-4.25 sm:pb-4.75",
                                    isError
                                        ? "toast--error border-l-(--terracotta)"
                                        : "toast--success border-l-(--olive)",
                                    item.exiting ? "toast--exit" : "",
                                ].filter(Boolean).join(" ")}
                            >
                                <div className={["flex size-9 shrink-0 items-center justify-center rounded-full",
                                    isError
                                        ? "bg-[#b95836]/10 text-(--terracotta)"
                                        : "bg-[#5b6b2f]/10 text-(--olive)",
                                ].join(" ")}
                                    aria-hidden="true"
                                >
                                    {isError
                                        ? <AlertCircle size={19} strokeWidth={2} />
                                        : <CheckCircle2 size={19} strokeWidth={2} />}
                                </div>

                                <div className="min-w-0 flex-1 pt-px">
                                    <p className="text-[13px] font-extrabold leading-[1.4] tracking-[-0.01em]">
                                        {isError
                                            ? "No se pudo completar"
                                            : "Operación exitosa"}
                                    </p>

                                    <p className="mt-1 wrap-break-word text-xs leading-relaxed text-(--muted)">
                                        {item.message}
                                    </p>
                                </div>

                                <button type="button" className="flex size-7 shrink-0 -mr-1 -mt-1 cursor-pointer items-center justify-center text-(--muted) transition-colors hover:bg-(--cream) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)"
                                    onClick={() => dismiss(item.id)}
                                    aria-label="Cerrar notificación"
                                >
                                    <X size={16} />
                                </button>

                                {!item.exiting && (
                                    <div className="toast__progress absolute inset-x-0 bottom-0 h-0.75 bg-(--line)" aria-hidden="true">
                                        <span
                                            className={["toast__progress-bar block h-full w-full origin-left",
                                                isError
                                                    ? "bg-(--terracotta)"
                                                    : "bg-(--olive)",
                                            ].join(" ")}
                                        />
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </ToastContext.Provider>
    );
};


export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>");
    return context;
};
