import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "text" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) => {
    return (
        <button {...props} className={` inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-${variant} ${className}`.trim()}>
            {children}
        </button>
    );
};