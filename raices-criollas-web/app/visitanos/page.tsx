import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Camera, CalendarDays, Mail, MapPin, Phone, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { restaurantInfo } from "@/app/data/restaurantInfo";
import { Reveal } from "@/app/components/ui/Reveal";
import { ReservationSection } from "../components/home/ReservationSection";

export const metadata: Metadata = {
    title: "Visítanos | Raices Criollas",
    description: "Dirección, horarios y contacto de Raíces Criollas, en el Centro de Lima.",
};

const direccionCompleta = `${restaurantInfo.address}, ${restaurantInfo.location}, Perú`;
const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;
const comoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta)}`;
const telefono = restaurantInfo.phone.replace(/[^\d+]/g, "");
const instagramUrl = `https://www.instagram.com/${restaurantInfo.instagram.replace("@", "")}`;

const enlaceAccion = "mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-(--terracotta) underline-offset-4 transition-colors hover:underline";

type InfoCardProps = {
    icon: ReactNode;
    titulo: string;
    children: ReactNode;
};

const InfoCard = ({ icon, titulo, children }: InfoCardProps) => (
    <div className="h-full rounded-md border border-(--line) bg-(--paper) p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(38,37,31,0.08)]">
        <span className="grid size-11 place-items-center rounded-full bg-(--cream) text-(--terracotta)">
            {icon}
        </span>

        <h2 className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-(--muted)">
            {titulo}
        </h2>

        {children}
    </div>
);

export default function VisitanosPage() {
    return (
        <>
            <section className="relative overflow-hidden px-6 pb-10 pt-14 md:px-[8vw] md:pb-14 md:pt-20 lg:px-[13vw]">
                <div className="container relative z-1 mx-auto">
                    <p className="rc-fade-up text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                        Ven a visitarnos
                    </p>

                    <h1 className="rc-fade-up mt-4 max-w-3xl font-serif text-[44px] font-normal leading-[0.92] tracking-[-0.065em] [--rc-delay:0.1s] sm:text-[56px] lg:text-[72px]">
                        Tu mesa{" "}
                        <span className="italic text-(--terracotta)">
                            te está esperando.
                        </span>
                    </h1>

                    <p className="rc-fade-up mt-6 max-w-xl font-serif text-[16px] leading-[1.7] text-(--muted) [--rc-delay:0.2s]">
                        Estamos en el corazón de Lima. Pasa por una sobremesa
                        larga o reserva y te guardamos tu lugar.
                    </p>

                    <p className="rc-fade-up mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#eef1e3] px-3.5 py-2 text-[11px] font-extrabold text-(--olive) [--rc-delay:0.3s]">
                        <span className="size-2 rounded-full bg-(--olive)" aria-hidden="true" />
                        {restaurantInfo.schedule} · {restaurantInfo.hours}
                    </p>
                </div>

            </section>

            <section className="px-6 pb-12 md:px-[8vw] md:pb-16 lg:px-[13vw]">
                <div className="container mx-auto grid grid-cols-1 gap-5 md:grid-cols-3">

                    <Reveal>
                        <InfoCard icon={<MapPin size={20} aria-hidden="true" />} titulo="Dirección">
                            <p className="mt-2 font-serif text-[24px] leading-tight tracking-[-0.03em]">
                                {restaurantInfo.address}
                            </p>
                            <p className="mt-1 text-[13px] text-(--muted)">
                                {restaurantInfo.location}
                            </p>

                            <a
                                href={comoLlegar}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={enlaceAccion}
                            >
                                Cómo llegar
                                <ArrowRight size={14} aria-hidden="true" />
                            </a>
                        </InfoCard>
                    </Reveal>

                    <Reveal delay={120}>
                        <InfoCard icon={<CalendarDays size={20} aria-hidden="true" />} titulo="Horario">
                            <p className="mt-2 font-serif text-[24px] leading-tight tracking-[-0.03em]">
                                {restaurantInfo.hours}
                            </p>
                            <p className="mt-1 text-[13px] text-(--muted)">
                                {restaurantInfo.schedule} · Reservas hasta las 9:30 pm
                            </p>

                            <Link href="/reservar-mesa" className={enlaceAccion}>
                                Reservar una mesa
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </InfoCard>
                    </Reveal>

                    <Reveal delay={240}>
                        <InfoCard icon={<Phone size={20} aria-hidden="true" />} titulo="Contacto">
                            <a
                                href={`tel:${telefono}`}
                                className="mt-2 block font-serif text-[24px] leading-tight tracking-[-0.03em] transition-colors hover:text-(--terracotta)"
                            >
                                {restaurantInfo.phone}
                            </a>

                            <a
                                href={`mailto:${restaurantInfo.email}`}
                                className="mt-1 inline-flex items-center gap-2 text-[13px] text-(--muted) transition-colors hover:text-(--terracotta)"
                            >
                                <Mail size={14} aria-hidden="true" />
                                {restaurantInfo.email}
                            </a>
                        </InfoCard>
                    </Reveal>

                </div>
            </section>

            <section className="px-6 pb-14 md:px-[8vw] md:pb-20 lg:px-[13vw]">
                <Reveal className="container relative mx-auto overflow-hidden rounded-md border border-(--line) bg-(--paper)">
                    <iframe
                        title={`Mapa de ${restaurantInfo.address}, ${restaurantInfo.location}`}
                        src={mapaEmbed}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block h-95 w-full filter-[sepia(0.18)_saturate(0.9)] md:h-115"
                    />

                    <div className="absolute left-4 top-4 hidden max-w-70 rounded-md border border-(--line) bg-(--paper) p-4 shadow-[0_12px_30px_rgba(38,37,31,0.12)] sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Raices Criollas
                        </p>

                        <p className="mt-1.5 font-serif text-[18px] leading-tight tracking-[-0.02em]">
                            {restaurantInfo.address}
                        </p>
                        <p className="text-[12px] text-(--muted)">
                            {restaurantInfo.location}
                        </p>

                        <a
                            href={comoLlegar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={enlaceAccion}
                        >
                            Abrir en Google Maps
                            <ArrowRight size={14} aria-hidden="true" />
                        </a>
                    </div>
                </Reveal>
            </section>

            <section className="bg-[#f2ebdc] px-6 py-14 md:px-[8vw] md:py-20 lg:px-[13vw]">
                <div className="container mx-auto">
                    <Reveal>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Antes de venir
                        </p>
                    </Reveal>

                    <ul className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
                        <li className="border-t border-(--line) pt-6">
                            <Reveal>
                                <ShoppingBag size={26} strokeWidth={1.5} className="text-(--terracotta)" aria-hidden="true" />
                                <h3 className="mt-4 font-serif text-[22px] leading-tight tracking-[-0.03em]">
                                    Pide para llevar
                                </h3>
                                <p className="mt-2 text-[13px] leading-[1.7] text-(--muted)">
                                    Mira la carta, arma tu pedido y llévate la sazón a casa.
                                </p>
                                <Link href="/carta" className={enlaceAccion}>
                                    Ver la carta
                                    <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </Reveal>
                        </li>

                        <li className="border-t border-(--line) pt-6">
                            <Reveal delay={120}>
                                <Users size={26} strokeWidth={1.5} className="text-(--terracotta)" aria-hidden="true" />
                                <h3 className="mt-4 font-serif text-[22px] leading-tight tracking-[-0.03em]">
                                    ¿Vienen muchos?
                                </h3>
                                <p className="mt-2 text-[13px] leading-[1.7] text-(--muted)">
                                    Escríbenos y armamos la mesa larga para todos.
                                </p>
                                <a href={`mailto:${restaurantInfo.email}`} className={enlaceAccion}>
                                    Escribir un correo
                                    <ArrowRight size={14} aria-hidden="true" />
                                </a>
                            </Reveal>
                        </li>

                        <li className="border-t border-(--line) pt-6">
                            <Reveal delay={240}>
                                <Camera size={26} strokeWidth={1.5} className="text-(--terracotta)" aria-hidden="true" />
                                <h3 className="mt-4 font-serif text-[22px] leading-tight tracking-[-0.03em]">
                                    Síguenos
                                </h3>
                                <p className="mt-2 text-[13px] leading-[1.7] text-(--muted)">
                                    Platos del día, novedades y lo que pasa en nuestra mesa.
                                </p>
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={enlaceAccion}
                                >
                                    {restaurantInfo.instagram}
                                    <ArrowRight size={14} aria-hidden="true" />
                                </a>
                            </Reveal>
                        </li>
                    </ul>
                </div>
            </section>

            <Reveal>
                <ReservationSection />
            </Reveal>
        </>
    );
}
