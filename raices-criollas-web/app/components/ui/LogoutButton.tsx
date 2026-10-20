"use client"


import { logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
    variant?: "icon" | "menu" | "button";
    className?: string;
    onBeforeLogout?: () => void;
};

export function LogoutButton({
    variant = "icon",
    className = "",
    onBeforeLogout,
}: LogoutButtonProps) {
    const styles = {
        icon: "flex size-9 cursor-pointer shrink-0 items-center justify-center rounded-sm border border-[#46443d] text-[#b7b0a2] transition-colors duration-200 hover:border-(--yellow) hover:text-(--yellow)",

        menu: "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-bold text-(--terracotta) transition-colors hover:bg-(--cream)",

        button: "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-sm border border-[#46443d] px-3 text-xs font-bold text-[#b7b0a2] transition-colors duration-200 hover:border-(--yellow) hover:text-(--yellow)",
    };

    return (
        <form
            action={logout}
            onSubmit={() => onBeforeLogout?.()}
            className={variant === "menu" ? "w-full" : undefined}
        >
            <button
                type="submit"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className={`${styles[variant]} ${className}`}
            >
                <LogOut
                    size={variant === "menu" ? 17 : 15}
                    aria-hidden="true"
                />

                {variant !== "icon" && (
                    <span>Cerrar sesión</span>
                )}
            </button>
        </form>
    );
}