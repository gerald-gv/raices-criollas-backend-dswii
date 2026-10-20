const moneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export const formatPrice = (value: number) => moneda.format(value);

export const formatFechaPedido = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    return `${date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })} · ${date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
};
