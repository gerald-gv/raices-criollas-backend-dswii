import { getPago } from "@/app/lib/pagos";
import { getSession } from "@/app/lib/session";
import { Pago } from "@/app/types/pagos";
import { redirect, unstable_rethrow } from "next/navigation";
import { PagoEstado } from "./PagoEstado";

type Param = string | string[] | undefined;

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

// Mercado Pago devuelve al cliente a /pago/exito, /pago/pendiente o /pago/error con ?external_reference=<id del pago>
// La URL solo dice que pago, el estado real se consulta al sistema de pagos
export async function PagoResultadoPage({ searchParams }: { searchParams: Promise<Record<string, Param>> }) {
    const session = await getSession();

    if (!session) {
        redirect("/login?next=/mis-pedidos");
    }

    const params = await searchParams;
    const referencia = Number(first(params.external_reference));
    const pagoId = Number.isInteger(referencia) && referencia > 0 ? referencia : null;

    let pago: Pago | null = null;

    if (pagoId !== null) {
        try {
            pago = await getPago(pagoId);
        } catch (error) {
            unstable_rethrow(error);
            pago = null;
        }
    }

    return (
        <div className="min-h-[70vh] bg-(--cream) px-6 py-16 md:py-24">
            <PagoEstado pagoId={pagoId} pedidoId={pago?.pedidoId} estadoInicial={pago?.estado ?? null} />
        </div>
    );
}
