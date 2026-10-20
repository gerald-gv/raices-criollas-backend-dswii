"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Loader2, Undo2 } from "lucide-react";
import { consultarPagoAction } from "@/app/actions/pagos";
import { EstadoPago, TipoPago } from "@/app/types/pagos";
import { cart } from "../pedidos/cartStore";

// Mercado Pago avisa al sistema de pagos por su cuenta y puede tardar unos segundos: se consulta cada 3 s, hasta 1 minuto
const CADA_MS = 3000;
const MAX_INTENTOS = 20;

interface PagoEstadoProps {
    pagoId: number | null;
    tipoInicial?: TipoPago | null;
    pedidoId?: number | null;
    reservaId?: number | null;
    estadoInicial: EstadoPago | null;
}

const linkPrimary = "inline-flex items-center justify-center rounded-sm bg-(--ink) px-6 py-3.5 text-xs font-extrabold text-white transition-colors hover:bg-(--terracotta)";
const linkSecondary = "inline-flex items-center justify-center rounded-sm border border-(--line) px-6 py-3.5 text-xs font-extrabold text-(--ink) transition-colors hover:border-(--ink)";

export const PagoEstado = ({ pagoId, tipoInicial = null, pedidoId, reservaId, estadoInicial }: PagoEstadoProps) => {
    const [estado, setEstado] = useState<EstadoPago | null>(estadoInicial);
    const [tipo, setTipo] = useState<TipoPago | null>(tipoInicial);
    const [intentos, setIntentos] = useState(0);

    const esperando = pagoId !== null && (estado === null || estado === "PENDIENTE");
    const agotado = intentos >= MAX_INTENTOS;

    useEffect(() => {
        if (!esperando || agotado || pagoId === null) return;

        const timer = setTimeout(async () => {
            const result = await consultarPagoAction(pagoId);
            if (result.estado) setEstado(result.estado);
            if (result.tipo) setTipo(result.tipo);
            setIntentos((n) => n + 1);
        }, CADA_MS);

        return () => clearTimeout(timer);
    }, [esperando, agotado, pagoId, intentos]);

    useEffect(() => {
        if (estado === "APROBADO" && tipo === "PEDIDO") cart.clear();
    }, [estado, tipo]);

    const esReserva = tipo === "RESERVA";
    const pedido = esReserva
        ? (reservaId ? `La reserva #${reservaId}` : "Tu reserva")
        : (pedidoId ? `Pedido #${pedidoId}` : "Tu pedido");
    const listaPropia = esReserva ? "/mis-reservas" : "/mis-pedidos";
    const verMis = esReserva ? "Ver mis reservas" : "Ver mis pedidos";
    const nombreLista = esReserva ? "Mis reservas" : "Mis pedidos";

    let icon: ReactNode;
    let tone = "bg-[#f3e6dd] text-(--terracotta)";
    let titulo: string;
    let texto: string;
    let acciones: ReactNode = (
        <>
            <Link href={listaPropia} className={linkPrimary}>{verMis}</Link>
            <Link href={esReserva ? "/" : "/carta"} className={linkSecondary}>{esReserva ? "Volver al inicio" : "Volver a la carta"}</Link>
        </>
    );

    if (estado === "APROBADO" && esReserva) {
        icon = <CheckCircle2 size={34} aria-hidden="true" />;
        tone = "bg-[#eef1e3] text-(--olive)";
        titulo = "¡Reserva confirmada!";
        texto = `${pedido} quedó pagada y tu mesa está asegurada. Te esperamos en Raíces Criollas.`;
    } else if (estado === "APROBADO") {
        icon = <CheckCircle2 size={34} aria-hidden="true" />;
        tone = "bg-[#eef1e3] text-(--olive)";
        titulo = "¡Pago aprobado!";
        texto = `${pedido} quedó pagado. Te avisaremos en «Mis pedidos» cuando cambie de estado.`;
    } else if (estado === "RECHAZADO" || estado === "CANCELADO") {
        icon = <AlertCircle size={34} aria-hidden="true" />;
        titulo = "No se pudo completar el pago";
        texto = esReserva
            ? `${pedido} sigue pendiente y no se te cobró. Puedes intentarlo de nuevo desde «Mis reservas» mientras no venza el plazo; si no se paga, la mesa se libera sola.`
            : `${pedido} sigue pendiente y no se te cobró. Puedes intentarlo de nuevo desde «Mis pedidos»; si no lo pagas, se cancela solo.`;
        acciones = (
            <>
                <Link href={esReserva ? "/mis-reservas?estado=PENDIENTE" : "/mis-pedidos?estado=PENDIENTE_PAGO"} className={linkPrimary}>Intentar de nuevo</Link>
                <Link href={esReserva ? "/" : "/carta"} className={linkSecondary}>{esReserva ? "Volver al inicio" : "Volver a la carta"}</Link>
            </>
        );
    } else if (estado === "REEMBOLSADO") {
        icon = <Undo2 size={34} aria-hidden="true" />;
        tone = "bg-(--cream) text-(--muted)";
        titulo = "Pago reembolsado";
        texto = `El cobro de ${esReserva ? "la reserva" : pedido.toLowerCase()} fue devuelto por Mercado Pago.`;
    } else if (esperando && !agotado) {
        icon = <Loader2 size={34} className="animate-spin" aria-hidden="true" />;
        tone = "bg-[#fef8e7] text-(--gold)";
        titulo = "Confirmando tu pago…";
        texto = "Estamos esperando la confirmación de Mercado Pago. Suele tardar unos segundos; no cierres esta página.";
        acciones = <Link href={listaPropia} className={linkSecondary}>{verMis}</Link>;
    } else {
        icon = <Clock size={34} aria-hidden="true" />;
        tone = "bg-[#fef8e7] text-(--gold)";
        titulo = pagoId === null ? "No encontramos tu pago" : "Tu pago sigue en proceso";
        texto = pagoId === null
            ? "Revisa «Mis pedidos» o «Mis reservas»: ahí verás el estado de lo que pagaste."
            : esReserva
                ? "Mercado Pago aún no confirma el pago. Cuando lo haga, tu reserva pasará a «Confirmada» en «Mis reservas»."
                : `Mercado Pago aún no confirma el pago. Cuando lo haga, tu pedido cambiará a «Pagado» en «${nombreLista}».`;
    }

    return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 border border-(--line) bg-(--paper) px-8 py-12 text-center">
            <div className={`flex size-16 items-center justify-center rounded-full ${tone}`}>{icon}</div>

            <div role="status" aria-live="polite">
                <h1 className="font-serif text-[clamp(26px,4vw,34px)] font-normal leading-tight tracking-tighter text-(--ink)">{titulo}</h1>
                <p className="mt-2 text-[14px] leading-relaxed text-(--muted)">{texto}</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{acciones}</div>
        </div>
    );
};
