import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { getCarrito } from "../lib/pedidos";
import { CarritoView } from "../components/pedidos/CarritoView";
import { ToastProvider } from "../components/ui/Toast";

export const metadata: Metadata = {
    title: "Mi pedido | Raíces Criollas",
    description: "Revisa los platos de tu pedido, ajusta las cantidades y continúa con tu compra.",
};

export default async function CarritoPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login?next=/carrito");
    }

    const carrito = await getCarrito();

    return (
        <ToastProvider>
            <div className="min-h-screen bg-(--cream) pb-24">

                <section className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
                    <div className="container mx-auto max-w-5xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Antes de pagar</p>
                        <h1 className="mt-2 font-serif text-[clamp(34px,4vw,52px)] font-normal leading-[0.98] tracking-tighter text-(--ink)">
                            Mi <span className="text-(--terracotta) italic">pedido</span>
                        </h1>
                    </div>
                </section>

                <section className="container mx-auto mt-10 max-w-5xl px-6 md:px-8">
                    <CarritoView carrito={carrito} />
                </section>
            </div>
        </ToastProvider>
    );
}
