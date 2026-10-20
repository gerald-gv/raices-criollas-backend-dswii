import { EntregaPago } from "@/app/components/pedidos/EntregaPago";
import { ToastProvider } from "@/app/components/ui/Toast";
import { formatPrice } from "@/app/lib/format";
import { getCarrito } from "@/app/lib/pedidos";
import { getPerfil } from "@/app/lib/perfil";
import { getSession } from "@/app/lib/session";
import { AlertTriangle, ArrowLeft, Info, UtensilsCrossed } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Continuar compra | Raíces Criollas",
    description: "Revisa el resumen de tu pedido antes de pagar con Mercado Pago.",
};

export default async function ContinuarCompraPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login?next=/carrito/continuar");
    }

    // El carrito ya quedo sincronizado en el backend al pulsar "Continuar compra"
    const carrito = await getCarrito();

    if (carrito.items.length === 0) {
        redirect("/carrito");
    }

    // Dirección y teléfono guardados en el perfil: se confirman aquí antes de pagar
    const perfil = await getPerfil();

    const noDisponibles = carrito.items.filter((item) => !item.disponible).length;
    const unidades = carrito.items.filter((item) => item.disponible).reduce((suma, item) => suma + item.cantidad, 0);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-(--cream) pb-24">
                <section className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
                    <div className="container mx-auto max-w-5xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Último paso</p>
                        <h1 className="mt-2 font-serif text-[clamp(34px,4vw,52px)] font-normal leading-[0.98] tracking-tighter text-(--ink)">
                            Resumen de tu <span className="text-(--terracotta) italic">compra</span>
                        </h1>
                    </div>
                </section>

                <main className="container mx-auto mt-10 grid max-w-5xl items-start gap-8 px-6 md:px-8 lg:grid-cols-[1fr_360px]">
                    <section aria-labelledby="resumen-items" className="border border-(--line) bg-(--paper) px-5 sm:px-6">
                        <h2 id="resumen-items" className="sr-only">Platos de tu compra</h2>

                        <ul>
                            {carrito.items.map((item) => {
                                const nombre = item.nombre ?? `Plato #${item.platoId}`;

                                return (
                                    <li key={item.platoId} className="flex items-center gap-4 border-b border-(--line) py-4 last:border-b-0">
                                        <div className={`relative size-16 shrink-0 overflow-hidden bg-[#f2ebdc] ${item.disponible ? "" : "grayscale"}`}>
                                            {item.imagen ? (
                                                <Image src={item.imagen} alt={nombre} fill sizes="64px" className="object-cover" />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-(--terracotta)">
                                                    <UtensilsCrossed size={20} strokeWidth={1.25} aria-hidden="true" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-serif text-[17px] leading-tight tracking-[-0.03em]">{nombre}</p>
                                            {item.disponible && item.precioUnitario !== null ? (
                                                <p className="mt-0.5 text-[12px] text-(--muted)">{item.cantidad} × {formatPrice(item.precioUnitario)}</p>
                                            ) : (
                                                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-(--terracotta)">
                                                    <AlertTriangle size={12} aria-hidden="true" />
                                                    Ya no está disponible
                                                </p>
                                            )}
                                        </div>

                                        {item.disponible && item.subtotal !== null && (
                                            <span className="shrink-0 text-[14px] font-extrabold text-(--terracotta)">{formatPrice(item.subtotal)}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <aside aria-labelledby="resumen-total" className="border border-(--line) bg-(--paper) p-6 lg:sticky lg:top-28">
                        <h2 id="resumen-total" className="font-serif text-[24px] font-normal tracking-[-0.04em]">Total a pagar</h2>

                        <dl className="mt-5 flex flex-col gap-2.5 border-b border-(--line) pb-5 text-[13px]">
                            <div className="flex justify-between">
                                <dt className="text-(--muted)">Platos</dt>
                                <dd className="font-bold">{unidades}</dd>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <dt className="text-(--muted)">Total</dt>
                                <dd className="font-serif text-[26px] tracking-[-0.04em] text-(--terracotta)">{formatPrice(carrito.total)}</dd>
                            </div>
                        </dl>

                        {noDisponibles > 0 ? (
                            <div role="alert" className="mt-5 flex items-start gap-2.5 border border-(--terracotta) bg-[#f8e9e2] p-3.5 text-[12px] font-bold leading-relaxed text-(--terracotta)">
                                <AlertTriangle size={15} className="mt-px shrink-0" aria-hidden="true" />
                                {noDisponibles === 1 ? "Un plato ya no está disponible." : `${noDisponibles} platos ya no están disponibles.`} Vuelve al carrito y quítalos para continuar.
                            </div>
                        ) : (
                            <div className="mt-5 flex items-start gap-2.5 border-l-2 border-(--yellow) bg-(--cream) p-3.5 text-[12px] leading-relaxed text-(--muted)">
                                <Info size={15} className="mt-px shrink-0 text-(--gold)" aria-hidden="true" />
                                Pagarás de forma segura en Mercado Pago. Tu pedido se confirma cuando el pago sea aprobado; si no lo completas, se cancela solo.
                            </div>
                        )}

                        <EntregaPago perfil={perfil} bloqueado={noDisponibles > 0} />

                        <Link href="/carrito" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-extrabold text-(--ink) underline-offset-4 hover:underline">
                            <ArrowLeft size={13} aria-hidden="true" />
                            Volver al carrito
                        </Link>
                    </aside>
                </main>
            </div>
        </ToastProvider>
    );
}
