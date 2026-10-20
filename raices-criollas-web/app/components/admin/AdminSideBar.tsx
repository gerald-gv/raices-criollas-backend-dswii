import Link from "next/link";
import BrandMark from "../brand-mark";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { LogoutButton } from "../ui/LogoutButton";

interface AdminSidebarProps {
    email: string;
}

export const AdminSidebar = ({ email }: AdminSidebarProps) => {
    return (
        <aside className="flex flex-col bg-(--ink) pt-5 text-[#f8f3e7] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:pt-7">

            <div className="flex items-center justify-between gap-4 px-6 pb-4 lg:px-7 lg:pb-8">
                <Link href="/admin" className="flex items-center gap-2.5 uppercase leading-[0.85]">
                    <BrandMark />

                    <div className="text-sm font-extrabold tracking-[0.08em] leading-[0.85]">
                        Raices
                        <span className="block font-serif text-[17px] font-normal italic tracking-normal text-(--yellow) normal-case">
                            Criollas
                        </span>
                    </div>
                </Link>

                <span className="hidden items-center gap-1.5 rounded-full border border-[#46443d] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-(--yellow) sm:flex lg:hidden">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Admin
                </span>
            </div>

            <p className="hidden px-7 pb-3 text-[10px] font-bold uppercase tracking-widest text-(--yellow) lg:block">
                Administración
            </p>

            <AdminNav />

            <div className="mt-auto flex flex-col gap-3 border-t border-[#46443d] p-4 sm:p-5 lg:p-5">


                <Link href="/" className="flex items-center gap-2 text-[11px] text-[#b7b0a2] transition-colors duration-200 hover:text-white">
                    <ExternalLink size={14} aria-hidden="true" />
                    Ver el sitio
                </Link>

                <div className="flex items-center justify-between gap-3">

                    <span className="min-w-0 truncate text-[11px] text-[#777269]" title={email}>
                        {email}
                    </span>

                    <LogoutButton variant="icon" />
                </div>

            </div>

        </aside>
    );
};
