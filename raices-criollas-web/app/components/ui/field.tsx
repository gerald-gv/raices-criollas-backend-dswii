import { ReactNode } from "react";

export const inputClass = "w-full rounded-sm border border-(--line) bg-(--paper) px-4 py-3 text-[13px] transition-colors duration-200 placeholder:text-(--muted) focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta) aria-invalid:border-(--terracotta)";

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}

export const Field = ({ label, htmlFor, error, hint, children }: FieldProps) => {
    return (
        <div className="flex flex-col gap-1.5">

            <label htmlFor={htmlFor} className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">
                {label}
            </label>

            {children}

            {error ? (

                <p id={`${htmlFor}-error`} className="text-[12px] font-bold text-(--terracotta)" role="alert">
                    {error}
                </p>

            ) : hint ? (

                <p className="text-[12px] text-(--muted)">{hint}</p>
                
            ) : null
            }
        </div>
    );
};
