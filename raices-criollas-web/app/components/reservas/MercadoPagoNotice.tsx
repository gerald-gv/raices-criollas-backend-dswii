import { CreditCard, ExternalLink, Lock } from "lucide-react";

interface MercadoPagoNoticeProps {
  montoTotal: number;
  reservaId: number | string;
}

/**
 * Componente visual reutilizable que prepara la experiencia de usuario
 * para la futura integración transaccional con Mercado Pago (raices-criollas-payment).
 * NO realiza cobros, no simula pagos ni redirige a pasarelas falsas.
 */
export const MercadoPagoNotice = ({ montoTotal, reservaId }: MercadoPagoNoticeProps) => {
  return (
    <div className="rounded-sm border border-(--line) bg-(--cream) p-5 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-(--line) pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-sm bg-[#009ee3]/15 text-[#009ee3]">
            <CreditCard size={18} aria-hidden="true" />
          </div>
          <div>
            <span className="block text-[13px] font-bold text-(--ink)">
              Pago en línea con Mercado Pago
            </span>
            <span className="text-[11px] text-(--muted)">
              Tarjetas de crédito, débito y transferencias electrónicas
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#fef8e7] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-(--gold)">
          <Lock size={11} aria-hidden="true" />
          Próximamente disponible
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-[12px] text-(--muted)">
        <p>
          La pasarela de pago seguro estará habilitada en la siguiente etapa del sistema. Una vez
          integrada, podrás abonar los <strong className="text-(--ink)">S/ {montoTotal.toFixed(2)}</strong> directamente
          desde esta pantalla para confirmar y asegurar definitivamente tu mesa.
        </p>
        <p className="font-mono text-[11px] text-(--muted)">
          Referencia de transacción vinculada: <span className="font-bold text-(--ink)">RC-RES-{reservaId}</span>
        </p>
      </div>

      <div className="mt-5 pt-1">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex w-full sm:w-auto cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-(--ink)/30 px-6 py-3 text-xs font-extrabold text-white opacity-70"
          title="El módulo de pago con Mercado Pago se integrará en la siguiente fase"
        >
          <CreditCard size={15} aria-hidden="true" />
          Pagar con Mercado Pago (En desarrollo)
          <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
