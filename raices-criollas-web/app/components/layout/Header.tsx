
'use client'
import { useState } from "react";
import BrandMark from "../brand-mark";
import { CalendarDays, ChevronDown, Menu, Package, Settings, ShieldCheck, UserRound, UserRoundPlus, X } from "lucide-react";
import Link from "next/link";
import { navigationLinks } from "@/app/data/Navigation";
import { AccountLink } from "../AccountLink";
import { LogoutButton } from "../ui/LogoutButton";
import { CartLink } from "../pedidos/CartLink";

type HeaderUser = {
    email: string;
    isAdmin: boolean;
};

type HeaderProps = {
    user?: HeaderUser | null;
};

export const Header = ({ user = null }: HeaderProps) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const handleMenuToggle = () => {
        setMenuOpen((open) => !open);
    };

    const handleNavigation = () => {
        setMenuOpen(false);
    };

    const isAdmin = user?.isAdmin === true;

    return (
        <header className="sticky top-0 z-5 flex h-17.5 items-center justify-between bg-(--cream) px-6 sm:h-20.5 sm:px-[clamp(24px,6vw,88px)]">

            <Link href="/" className=" flex items-center gap-2.5 uppercase leading-[0.85]">

                <BrandMark />

                <div className="text-sm font-extrabold tracking-[0.08em] leading-[0.85]">
                    Raices
                    <span className="block font-serif text-[17px] font-normal italic tracking-normal text-(--terracotta) normal-case">
                        Criollas
                    </span>
                </div>

            </Link>

            <nav className={`nav-links ${menuOpen ? "nav-open" : "hidden"} ml-auto gap-[clamp(20px,3vw,44px)] md:mr-11.5 md:flex md:flex-row md:bg-transparent md:p-0 md:shadow-none`} aria-label="Navegación principal">
                {navigationLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={handleNavigation}
                        className=" text-[13px] font-bold text-[#625e54] transition-colors duration-200 hover:text-(--terracotta)">
                        {link.label}
                    </Link>
                ))}

                <div className="flex flex-col gap-2.5 border-t border-(--line) pt-4 md:hidden">

                    {!user ? (
                        <>
                            <Link href="/login" onClick={handleNavigation} className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-(--ink) hover:bg-(--cream) hover:text-(--terracotta)">
                                <UserRound size={18} />
                                Ingresar
                            </Link>

                            <Link href="/register" onClick={handleNavigation} className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-(--terracotta) px-4 py-3 text-sm font-extrabold text-(--paper) transition-colors hover:bg-(--ink)">
                                <UserRoundPlus size={18} />
                                Crear cuenta
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 px-3 py-2">
                                {isAdmin ? (
                                        <ShieldCheck size={20} className="text-(--terracotta)"/>
                                    ) : (
                                        <UserRound size={20} className="text-(--olive)"/>
                                    )}

                                    <div>
                                        <p className="text-sm font-bold text-(--ink)">
                                            {user.email}
                                        </p>
                                        
                                        <p className="text-xs text-(--muted)">
                                            {isAdmin ? "Administrador" : "Cliente"}
                                        </p>
                                    </div>
                            </div>

                                {isAdmin ? (
                                    <Link href="/admin" onClick={handleNavigation} className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-(--ink) hover:bg-(--cream)">
                                        <ShieldCheck size={18} />
                                        Panel de administración
                                    </Link>
                                ) : (
                                        <>
                                            <Link href="/cuenta" onClick={handleNavigation} className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-(--ink) hover:bg-(--cream)">
                                                <Settings size={18} />
                                                Mi perfil
                                            </Link>

                                            <Link href="/mis-pedidos" onClick={handleNavigation} className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-(--ink) hover:bg-(--cream)">
                                                <Package size={18} />
                                                Mis pedidos
                                            </Link>

                                            <Link href="/mis-reservas" onClick={handleNavigation} className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-(--ink) hover:bg-(--cream)">
                                                <CalendarDays size={18} />
                                                Mis reservas
                                            </Link>
                                        </>
                                )}
                                    <LogoutButton variant="menu" onBeforeLogout={handleNavigation} />
                                </>
                            )}
                </div>

                <Link href="/reservar-mesa" className="md:hidden inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary">
                    Reservar mesa
                </Link>
            </nav>

            <div className="hidden items-center gap-4.25 md:flex">

                {!user ? (
                    <div className="flex items-center gap-2">

                        <Link href="/login" className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-2.5 text-[13px] font-bold text-(--ink) transition-colors hover:text-(--terracotta)">
                            <UserRound size={17} strokeWidth={1.8} />
                            Ingresar
                        </Link>

                        <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-sm bg-(--terracotta) px-4 py-3.5 text-xs font-extrabold tracking-[0.02em] text-(--paper) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--ink)">
                            <UserRoundPlus size={16} />
                            Crear cuenta
                        </Link>
                    </div>
                ) : (
                    <div className="relative">
                        
                        <button type="button" aria-expanded={accountOpen} aria-haspopup="true" onClick={() => setAccountOpen((open) => !open)} className="flex items-center gap-2 rounded-sm border border-(--line) bg-(--paper) px-3 py-2.5 transition-colors hover:border-(--terracotta)">
                            {isAdmin ? (
                                <ShieldCheck size={19} className="text-(--terracotta)" />
                            ) : (
                                <UserRound size={19} className="text-(--olive)" />
                            )}

                            <span className="max-w-28 truncate text-[13px]
                                font-bold text-(--ink)">
                                {user.email}
                            </span>

                            <ChevronDown size={15} className={`text-(--muted) transition-transform ${accountOpen ? "rotate-180" : ""}`}/>
                        </button>

                        {accountOpen && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-md border border-(--line) bg-(--paper) py-2 shadow-[0_12px_30px_rgba(38,37,31,0.10)]">

                                <div className="border-b border-(--line) px-4 py-3">
                                    <p className="truncate text-sm font-bold text-(--ink)">
                                        {user.email}
                                    </p>
                                    <p className="mt-1 text-xs text-(--muted)">
                                        {isAdmin ? "Administrador" : "Mi cuenta"}
                                    </p>
                                </div>

                                {isAdmin ? (
                                    <AccountLink href="/admin" icon={<ShieldCheck size={17} />} onClick={handleNavigation}>
                                        Panel de administración
                                    </AccountLink>
                                ) : (
                                    <>
                                        <AccountLink href="/cuenta" icon={<Settings size={17} />} onClick={handleNavigation} >
                                            Mi perfil
                                        </AccountLink>

                                        <AccountLink href="/mis-pedidos" icon={<Package size={17} />} onClick={handleNavigation} >
                                            Mis pedidos
                                        </AccountLink>

                                        <AccountLink href="/mis-reservas" icon={<CalendarDays size={17} />} onClick={handleNavigation}>
                                            Mis reservas
                                        </AccountLink>
                                    </>
                                )}

                                <div className="my-2 border-t border-(--line)" />

                                <LogoutButton variant="menu" onBeforeLogout={handleNavigation} />
                            </div>
                        )}
                    </div>
                )}
                
                {!isAdmin && <CartLink loggedIn={!!user} />}

                <Link href="/reservar-mesa" className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary">
                    Reservar mesa
                </Link>
            </div>

            <button className=" cursor-pointer border-0 bg-transparent p-0 md:hidden" onClick={handleMenuToggle}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>

                {menuOpen ? (<X size={24} />) : (<Menu size={24} />)}

            </button>
        </header>
    );
};