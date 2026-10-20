"use client"

import { CalendarCheck, Grid2X2, LayoutDashboard, ShoppingBag, Tags, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { label: "Resumen", href: "/admin", icon: LayoutDashboard },
    { label: "Reservas", href: "/admin/reservas", icon: CalendarCheck },
    { label: "Mesas", href: "/admin/mesas", icon: Grid2X2 },
    { label: "Platos", href: "/admin/platos", icon: UtensilsCrossed },
    { label: "Categorías", href: "/admin/categorias", icon: Tags },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
];

export const AdminNav = () => {
    const pathname = usePathname();

    return (
        <nav aria-label="Panel de administración" className="flex gap-1.5 overflow-x-auto px-6 pb-3 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-0">
            {items.map(({ label, href, icon: Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

                return (
                    <Link key={href} href={href} aria-current={active ? "page" : undefined}
                        className={`flex shrink-0 items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-[12px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--yellow) ${active
                            ? "bg-(--yellow) text-(--ink)"
                            : "text-[#b7b0a2] hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
};
