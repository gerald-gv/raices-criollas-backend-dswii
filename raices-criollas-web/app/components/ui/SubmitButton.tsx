"use client"

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
    children: ReactNode;
    pendingText?: string;
    variant?: "primary" | "outline" | "danger";
    className?: string;
    disabled?: boolean;
}

// Deshabilita el boton y muestra un spinner mientras la Server Action responde
export const SubmitButton = ({ children, pendingText = "Guardando…", variant = "primary", className = "", disabled = false }: SubmitButtonProps) => {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" variant={variant} disabled={disabled || pending} aria-busy={pending} className={`disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}>
            {pending ? (
                <>
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    {pendingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
};
