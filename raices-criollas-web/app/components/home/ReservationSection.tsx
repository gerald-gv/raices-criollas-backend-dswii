import { restaurantInfo } from "@/app/data/restaurantInfo"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"

export const ReservationSection = () => {
    return (
        <section className="bg-(--yellow) px-6 py-13.75 md:px-[8vw] md:py-17">

            <div className="container mx-auto flex flex-col gap-10 md:flex-row md:items-center md:justify-between md:gap-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                        Ven a visitarnos
                    </p>

                    <h2 className="mt-3.5 font-serif text-[38px] font-normal leading-[0.95] tracking-[-0.065em] sm:text-[44px] lg:text-[52px]">
                        Tu próxima historia{" "}
                        <span className="block text-(--terracotta) italic">
                            empieza en la mesa.
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-7.5">
                    <dl className="flex flex-col gap-4.5 text-[10px] leading-[1.6] sm:flex-row sm:gap-7.5">
                        <div className="flex items-start gap-2.5">

                            <CalendarDays size={20} className="shrink-0 text-(--terracotta)" aria-hidden="true"/>

                            <div>
                                <dt className="font-normal">
                                    {restaurantInfo.schedule}
                                </dt>
                                <dd className="font-extrabold">
                                    {restaurantInfo.hours}
                                </dd>
                            </div>

                        </div>

                        <div className="flex items-start gap-2.5">

                            <MapPin size={20} className="shrink-0 text-(--terracotta)" aria-hidden="true"/>

                            <div>
                                <dt className="font-normal">
                                    {restaurantInfo.address}
                                </dt>
                                <dd className="font-extrabold">
                                    {restaurantInfo.location}
                                </dd>
                            </div>
                            
                        </div>
                    </dl>

                    <Link href="/reservar-mesa" className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary">
                        Reservar una mesa
                        <ArrowRight size={16} />
                    </Link>

                </div>
            </div>
        </section>
    )
}

