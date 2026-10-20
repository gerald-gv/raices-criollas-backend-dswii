import type { Metadata } from "next";
import { ArrowRight, CookingPot, Leaf, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Ingredientes } from "@/app/components/historia/Ilustraciones";
import { Reveal } from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
    title: "Nuestra historia | Raices Criollas",
    description: "De la cocina de una abuela en Chincha a una mesa en el Centro de Lima: la historia de Raíces Criollas.",
};

const hitos = [
    {
        epoca: "De niña · Chincha",
        titulo: "La cocina de la abuela Rosario",
        texto: "Emilia aprende a cocinar los domingos, parada en un banquito junto al fogón, midiendo con la mano y probando con el corazón.",
    },
    {
        epoca: "1998 · Barrios Altos",
        titulo: "Domingos de mesa larga",
        texto: "Ya en Lima, cocina cada domingo para la familia y los vecinos. Siempre llega alguien más, y siempre alcanza.",
    },
    {
        epoca: "2012 · Jr. de la Unión",
        titulo: "Se abren las primeras seis mesas",
        texto: "La mesa ya no cabía en casa. Con tres platos en la pizarra, nace Raíces Criollas en el Centro de Lima.",
    },
    {
        epoca: "2019 · Segunda generación",
        titulo: "Las recetas se escriben",
        texto: "Los hijos de Emilia se suman a la cocina y, por primera vez, las recetas pasan del recuerdo al papel.",
    },
    {
        epoca: "Hoy",
        titulo: "Más de 2,000 historias compartidas",
        texto: "Creció la carta y cambió el delantal, pero la sazón sigue siendo la que Rosario le enseñó a Emilia.",
    },
];

const cifras = [
    { valor: "2012", etiqueta: "Abrimos nuestras puertas" },
    { valor: "6", etiqueta: "Mesas el primer día" },
    { valor: "3", etiqueta: "Generaciones en la cocina" },
];

const valores = [
    {
        icon: Leaf,
        titulo: "Ingredientes locales",
        texto: "Cocinamos con lo que llega del mercado: productos de temporada, elegidos uno a uno, para que cada plato sepa a su tierra.",
    },
    {
        icon: CookingPot,
        titulo: "Sazón de siempre",
        texto: "Las recetas pasan de generación en generación y las cuidamos como se cuida lo que importa: sin atajos y con memoria.",
    },
    {
        icon: UtensilsCrossed,
        titulo: "Hecho al momento",
        texto: "Cada plato se prepara cuando lo pides. Tarda lo que tiene que tardar, porque así es como debe ser.",
    },
];

export default function NuestraHistoriaPage() {
    return (
        <>
            {/* Portada */}
            <section className="px-6 py-14 md:px-[8vw] md:py-20 lg:px-[13vw]">
                <div className="container mx-auto grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_0.8fr] md:gap-14">

                    <div>
                        <p className="rc-fade-up text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Nuestra historia
                        </p>

                        <h1 className="rc-fade-up mt-4 font-serif text-[44px] font-normal leading-[0.92] tracking-[-0.065em] [--rc-delay:0.1s] sm:text-[56px] lg:text-[72px]">
                            Una sobremesa{" "}
                            <span className="italic text-(--terracotta)">
                                que no quiso terminar.
                            </span>
                        </h1>

                        <p className="rc-fade-up mt-6 max-w-xl font-serif text-[16px] leading-[1.7] text-(--muted) [--rc-delay:0.2s]">
                            Raíces Criollas nació de una de esas sobremesas largas
                            donde nadie quiere levantarse. De ahí viene todo lo
                            demás: la idea de cocinar para compartir, sin apuro y
                            con el corazón contento.
                        </p>
                    </div>

                    <div className="rc-fade-up relative mx-auto w-full max-w-lg [--rc-delay:0.3s]">
                        <div
                            className="absolute -bottom-3 -right-3 size-full rounded-md bg-(--yellow)"
                            aria-hidden="true"
                        />

                        <Image
                            src="/mesa-familiar.webp"
                            alt="Una familia peruana comparte platos criollos en una gran mesa de madera"
                            width={1200}
                            height={896}
                            priority
                            sizes="(min-width: 768px) 40vw, 100vw"
                            className="relative h-auto w-full rounded-md object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Relato */}
            <section className="bg-(--paper) px-6 py-14 md:px-[8vw] md:py-20 lg:px-[13vw]">
                <div className="container mx-auto grid grid-cols-1 gap-10 md:grid-cols-[0.5fr_0.8fr] md:gap-16">

                    <Reveal>
                        <h2 className="font-serif text-[32px] font-normal leading-[0.98] tracking-tighter sm:text-[40px]">
                            Perú se sirve{" "}
                            <span className="block italic text-(--terracotta)">
                                en familia.
                            </span>
                        </h2>

                        <Ingredientes className="mt-8 w-full max-w-sm" />
                    </Reveal>

                    <Reveal className="space-y-5 font-serif text-[16px] leading-[1.8] text-(--ink)" delay={120}>
                        <p>
                            Todo empezó en una cocina de Chincha, con una abuela
                            llamada Rosario y un fogón que los domingos nunca se
                            apagaba. Emilia, de niña, se subía a un banquito para
                            alcanzar la olla y aprendió a medir con la mano: una
                            pizca de comino, un chorrito de vinagre, el ají justo
                            cuando huele a punto.
                        </p>

                        <p>
                            Años después, ya en Lima, esas recetas seguían sin
                            estar escritas en ninguna parte. Cada domingo Emilia
                            cocinaba para la familia y los vecinos de Barrios
                            Altos, y la mesa siempre se alargaba: llegaba un
                            primo, un amigo del primo, alguien que pasaba por el
                            olor.
                        </p>

                        <p>
                            En 2012 la mesa se volvió tan larga que ya no cabía
                            en casa. Así nacieron las primeras seis mesas de
                            Raíces Criollas, en el Jr. de la Unión, con tres
                            platos en la pizarra y una sola regla: nadie se va
                            con hambre ni con apuro.
                        </p>

                        <p>
                            Hoy la cocina la comparten tres generaciones.
                            Cambió el local y creció la carta, pero la sazón
                            sigue siendo la misma.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Cifras */}
            <section className="bg-(--yellow) px-6 py-12 md:px-[8vw] lg:px-[13vw]">
                <dl className="container mx-auto grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                    {cifras.map((cifra, i) => (
                        <Reveal key={cifra.etiqueta} delay={i * 120}>
                            <dd className="font-serif text-[56px] leading-none tracking-tighter text-(--ink)">
                                {cifra.valor}
                            </dd>
                            <dt className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--terracotta)">
                                {cifra.etiqueta}
                            </dt>
                        </Reveal>
                    ))}
                </dl>
            </section>

            {/* Línea de tiempo */}
            <section className="px-6 py-14 md:px-[8vw] md:py-20 lg:px-[13vw]">
                <div className="container mx-auto grid grid-cols-1 gap-10 md:grid-cols-[0.5fr_0.8fr] md:gap-16">

                    <Reveal>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            El camino
                        </p>

                        <h2 className="mt-3 font-serif text-[32px] font-normal leading-[0.98] tracking-tighter sm:text-[40px]">
                            De un fogón en Chincha{" "}
                            <span className="italic text-(--terracotta)">
                                a tu mesa.
                            </span>
                        </h2>
                    </Reveal>

                    <ol className="relative border-l border-(--line) pl-8">
                        {hitos.map((hito, i) => (
                            <li key={hito.titulo} className="relative pb-10 last:pb-0">
                                <Reveal delay={i * 100}>
                                    <span
                                        className="absolute -left-9.75 top-1.5 size-3 rounded-full border-2 border-(--terracotta) bg-(--cream)"
                                        aria-hidden="true"
                                    />

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-(--gold)">
                                        {hito.epoca}
                                    </p>

                                    <h3 className="mt-1 font-serif text-[22px] leading-tight tracking-[-0.03em]">
                                        {hito.titulo}
                                    </h3>

                                    <p className="mt-2 max-w-md text-[13px] leading-[1.7] text-(--muted)">
                                        {hito.texto}
                                    </p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Valores */}
            <section className="bg-[#f2ebdc] px-6 py-14 md:px-[8vw] md:py-20 lg:px-[13vw]">
                <div className="container mx-auto">
                    <Reveal>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">
                            Lo que nos mueve
                        </p>
                    </Reveal>

                    <ul className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
                        {valores.map(({ icon: Icon, titulo, texto }, i) => (
                            <li key={titulo} className="border-t border-(--line) pt-6">
                                <Reveal delay={i * 120}>
                                    <Icon
                                        size={26}
                                        strokeWidth={1.5}
                                        className="text-(--terracotta)"
                                        aria-hidden="true"
                                    />

                                    <h3 className="mt-4 font-serif text-[22px] leading-tight tracking-[-0.03em]">
                                        {titulo}
                                    </h3>

                                    <p className="mt-2 text-[13px] leading-[1.7] text-(--muted)">
                                        {texto}
                                    </p>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Cita */}
            <section className="relative overflow-hidden bg-[#c96a46] px-6 py-16 text-[#fff7e6] md:px-[8vw] md:py-20 lg:px-[13vw]">
                <blockquote className="container relative z-1 mx-auto max-w-3xl">
                    <Reveal>
                        <span
                            className="block font-serif text-[70px] leading-[0.4] text-(--yellow)"
                            aria-hidden="true"
                        >
                            “
                        </span>

                        <p className="mt-6 font-serif text-[30px] leading-[1.15] tracking-[-0.03em] sm:text-[40px]">
                            La mejor receta siempre{" "}
                            <span className="block italic text-(--yellow)">
                                lleva un poquito de hogar.
                            </span>
                        </p>

                        <footer className="mt-6 text-[11px] text-[#f5d5c0]">
                            — Doña Emilia, fundadora
                        </footer>
                    </Reveal>
                </blockquote>

            </section>

            <section className="px-6 py-14 text-center md:px-[8vw] md:py-20">
                <Reveal className="container mx-auto flex flex-col items-center">
                    <h2 className="font-serif text-[32px] font-normal leading-[0.98] tracking-tighter sm:text-[44px]">
                        Ven a vivirlo{" "}
                        <span className="italic text-(--terracotta)">
                            en la mesa.
                        </span>
                    </h2>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                        <Link
                            href="/carta"
                            className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-transparent px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] transition-all duration-200 hover:-translate-y-0.5 button-primary"
                        >
                            Ver la carta
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href="/visitanos"
                            className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-sm border border-(--ink) px-5.25 py-3.5 text-xs font-extrabold tracking-[0.03em] text-(--ink) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--ink) hover:text-white"
                        >
                            Cómo llegar
                        </Link>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
