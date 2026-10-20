import { restaurantInfo } from "@/app/data/restaurantInfo"
import BrandMark from "../brand-mark"
import { Camera, Clock3, Phone } from "lucide-react"
import Link from "next/link"
import { navigationLinks } from "@/app/data/Navigation"

export const Footer = () => {
    return (
        <footer className="bg-(--ink) px-[clamp(24px,8vw,128px)] pb-5 pt-14.5 text-[#f8f3e7]">
            <div>
                <Link className="flex items-center gap-2.5 uppercase leading-[0.85]" href="/">
                    <BrandMark />

                    <div className="text-sm font-extrabold tracking-[0.08em] leading-[0.85]">
                        Raices
                        <span className="block font-serif text-[17px] font-normal italic tracking-normal text-(--yellow) normal-case">
                            Criollas
                        </span>
                    </div>
                </Link>

                <p className="mt-7 font-serif text-sm leading-normal text-[#aaa496]">
                    Un pedacito de Perú
                    <span className="block">
                        en cada bocado.
                    </span>
                </p>
            </div>

            <div className="mt-11.25 flex justify-start gap-12 md:-mt-18.75 md:justify-end xl:gap-38.75">
                <div className="flex flex-col gap-2">

                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-(--yellow)">
                        Explora
                    </span>

                    {navigationLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-1.5 text-[11px] text-[#b7b0a2]">
                            {link.label}
                        </Link>
                    ))}

                </div>

                <div className="flex flex-col gap-2">

                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-(--yellow)">
                        Contacto
                    </span>

                    <a href={`tel:${restaurantInfo.phone}`} className="flex items-center gap-1.5 text-[11px] text-[#b7b0a2]">
                        <Phone size={14} />
                        {restaurantInfo.phone}
                    </a>

                    <a href={`mailto:${restaurantInfo.email}`} className="flex items-center gap-1.5 text-[11px] text-[#b7b0a2]">
                        {restaurantInfo.email}
                    </a>

                </div>

                <div className="flex flex-col gap-2">
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-(--yellow)">
                        Síguenos
                    </span>

                    <a className="flex items-center gap-1.5 text-[11px] text-[#b7b0a2]">
                        <Camera size={15} />
                        {restaurantInfo.instagram}
                    </a>

                    <span className="flex items-center gap-1.5 text-[11px] text-[#b7b0a2]">
                        <Clock3 size={14} />
                        Reservas hasta 9:30 pm
                    </span>
                </div>
            </div>

            <div className="mt-13.75 flex flex-col gap-2 border-t border-[#46443d] pt-4.25 text-[10px] text-[#777269] md:flex-row md:items-center md:justify-between">
                <span>©{new Date().getFullYear()} Raices Criollas</span>
                <span>Hecho con amor en Lima</span>
            </div>

        </footer>
    )
}

