import { ArrowDownRight, ArrowUpRight, PackageX } from "lucide-react";

interface StockChangeNoticeProps {
    actual: number;
    nuevo: number;
}

export const StockChangeNotice = ({
    actual,
    nuevo,
}: StockChangeNoticeProps) => {
    const diff = nuevo - actual;
    if (diff === 0) return null;

    const agotado = nuevo === 0;
    const aumenta = diff > 0;

    const tono = agotado
        ? {
            caja: "stock-notice--agotado",
            icono: "stock-notice__icon",
            pill: "stock-notice__pill",
            etiqueta: "Stock agotado",
        }
        : aumenta
            ? {
                caja: "stock-notice--aumenta",
                icono: "stock-notice__icon",
                pill: "stock-notice__pill",
                etiqueta: "Stock aumenta",
            }
            : {
                caja: "stock-notice--disminuye",
                icono: "stock-notice__icon",
                pill: "stock-notice__pill",
                etiqueta: "Stock disminuye",
            };

    return (
        <div role="status" className={`-mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-md border px-3 py-2 ${tono.caja}`}>
            
            <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${tono.icono}`}>
                {agotado ? (
                    <PackageX size={15} strokeWidth={1.8} />
                ) : aumenta ? (
                    <ArrowUpRight size={16} strokeWidth={2} />
                ) : (
                    <ArrowDownRight size={16} strokeWidth={2} />
                )}
            </span>

            <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.07em] ${tono.pill}`}>
                {tono.etiqueta}
            </span>

            <span className="text-[12px] text-(--ink)">
                <strong className={`font-bold ${tono.icono}`}>

                    {agotado ? "0 unidades" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} ${Math.abs(diff) === 1 ? "unidad" : "unidades" }`}

                </strong>

                <span className="mx-1 text-(--ink)/35">·</span>
                
                <span className="text-(--ink)/70">
                    {actual} <span aria-hidden="true">→</span> {nuevo}
                
                </span>
            </span>

            {(agotado || (actual === 0 && nuevo > 0)) && (
                <p className="w-full pl-6.5 text-[11px] leading-relaxed text-(--ink)/75">
                    {agotado
                        ? "El plato se ocultará de la carta."
                        : "Volverá a la carta si «Disponible» sigue marcada."
                    }
                </p>
            )}
        </div>
    );
};