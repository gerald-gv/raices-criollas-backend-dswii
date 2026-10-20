"use client"

import { Perfil } from "@/app/types/auth";
import { useState } from "react";
import { Button } from "../ui/button";
import { CheckCircle2, MapPin, Phone } from "lucide-react";
import { RealizarPagoButton } from "./RealizarPagoButton";
import { Modal } from "../ui/Modal";
import { DireccionForm } from "../perfil/DireccionForm";

interface EntregaPagoProps {
    perfil: Perfil;
    bloqueado?: boolean;
}

// Paso final de la compra: confirmar adónde se envía el pedido y recién entonces pagar.
// Sin dirección se pide en un modal (se guarda en el perfil); con dirección se pregunta si es la correcta.
export const EntregaPago = ({ perfil, bloqueado = false }: EntregaPagoProps) => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [confirmada, setConfirmada] = useState(false);

    const tieneDireccion = Boolean(perfil.direccion && perfil.distrito && perfil.telefono);

    return (
        <>
            <div className="mt-5 border-t border-(--line) pt-5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">Entrega</h3>

                {!tieneDireccion ? (
                    <div className="mt-3">
                        <p className="text-[12px] leading-relaxed text-(--muted)">
                            Para llevarte el pedido necesitamos tu dirección. Se guardará en tu perfil para tus próximas compras.
                        </p>
                        <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setModalAbierto(true)}>
                            <MapPin size={14} aria-hidden="true" />
                            Registrar dirección
                        </Button>
                    </div>
                ) : (
                    <div className="mt-3">
                        <div className={`border p-3.5 text-[13px] leading-relaxed ${confirmada ? "border-(--olive)/50 bg-[#eef1e3]/60" : "border-(--line) bg-(--cream)"}`}>
                            <p className="flex items-start gap-2 font-bold text-(--ink)">
                                {confirmada ? (
                                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-(--olive)" aria-hidden="true" />
                                ) : (
                                    <MapPin size={15} className="mt-0.5 shrink-0 text-(--terracotta)" aria-hidden="true" />
                                )}
                                <span>
                                    {perfil.direccion}, {perfil.distrito}
                                    {perfil.referencia && <span className="block text-[12px] font-normal text-(--muted)">Ref.: {perfil.referencia}</span>}
                                </span>
                            </p>
                            <p className="mt-1.5 flex items-center gap-2 text-[12px] text-(--muted)">
                                <Phone size={13} className="shrink-0" aria-hidden="true" />
                                {perfil.telefono}
                            </p>
                        </div>

                        {confirmada ? (
                            <button type="button" onClick={() => setModalAbierto(true)}
                                className="mt-2.5 cursor-pointer text-[11px] font-extrabold text-(--ink) underline underline-offset-4 hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)">
                                Cambiar dirección
                            </button>
                        ) : (
                            <div className="mt-3">
                                <p className="text-[12px] font-bold text-(--ink)">¿Enviamos tu pedido a esta dirección?</p>
                                <div className="mt-2.5 flex items-center gap-4">
                                    <Button type="button" className="px-4! py-2.5!" onClick={() => setConfirmada(true)}>
                                        Sí, es esta
                                    </Button>
                                    <button type="button" onClick={() => setModalAbierto(true)}
                                        className="cursor-pointer text-[11px] font-extrabold text-(--ink) underline underline-offset-4 hover:text-(--terracotta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--terracotta)">
                                        Cambiar dirección
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <RealizarPagoButton disabled={bloqueado || !confirmada} />

                {!bloqueado && !confirmada && (
                    <p className="text-center text-[11px] text-(--muted)">
                        {tieneDireccion ? "Confirma tu dirección para poder pagar." : "Registra tu dirección para poder pagar."}
                    </p>
                )}
            </div>

            <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Dirección de entrega">
                <DireccionForm
                    perfil={perfil}
                    bare
                    onSaved={() => {
                        // Guardarla ya es confirmarla: es la que el cliente acaba de escribir
                        setConfirmada(true);
                        setModalAbierto(false);
                    }}
                />
            </Modal>
        </>
    );
};
