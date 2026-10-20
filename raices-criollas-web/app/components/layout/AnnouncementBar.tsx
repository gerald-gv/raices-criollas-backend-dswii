import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const AnnouncementBar = () => {
    return (
        <div className="flex items-center justify-center gap-2.5 bg-(--yellow) p-2.5 text-[9px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]">
            <span className="text-[9px]">●</span>

            <span>
                Cocina criolla hecha con memoria, sazón y cariño
            </span>

            <Link
                href="/"
                className="announcement-link ml-3.5 hidden items-center gap-1.25 pl-3.5 sm:flex"
            >
                Pide para llevar
                <ArrowRight size={14} />
            </Link>
        </div>
    );
};