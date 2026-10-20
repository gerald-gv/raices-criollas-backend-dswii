type IlustracionProps = {
    className?: string;
};

export const Ingredientes = ({ className }: IlustracionProps) => {
    return (

        <svg viewBox="0 0 520 200" className={className} role="img" aria-label="Ilustración de ingredientes de la cocina criolla: ají, limones, choclo y cebolla roja">
            <line x1="10" y1="172" x2="510" y2="172" className="stroke-(--line)" strokeWidth="2" />

            {/* Aji */}
            <path d="M60 60 C90 50 110 80 100 120 C95 145 80 160 62 168 C75 140 70 110 52 92 C44 80 48 66 60 60 Z" className="fill-(--gold)" />
            <path
                d="M60 60 C58 48 66 40 78 38"
                className="fill-none stroke-(--olive)"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* Limon entero */}
            <circle cx="170" cy="134" r="36" className="fill-(--olive)" />
            <path
                d="M150 112 C158 106 168 104 178 106"
                className="fill-none stroke-white opacity-40"
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Medio limon */}
            <g transform="translate(244 140)">
                <circle r="30" className="fill-(--olive)" />
                <circle r="26" className="fill-[#eef1e3]" />
                <g className="stroke-(--olive)" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="-22" y1="0" x2="22" y2="0" />
                    <line x1="-11" y1="-19" x2="11" y2="19" />
                    <line x1="11" y1="-19" x2="-11" y2="19" />
                </g>
                <circle r="4" className="fill-[#dfe6c9]" />
            </g>

            {/* Choclo */}
            <g transform="rotate(-14 335 120)">
                <rect x="305" y="62" width="60" height="112" rx="30" className="fill-(--yellow) stroke-(--gold)" strokeWidth="2" />
                {[82, 98, 114, 130, 146].map((y) =>
                    [320, 335, 350].map((x) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" className="fill-(--gold) opacity-70" />
                    ))
                )}
                <path d="M305 150 C295 176 315 188 335 185 C355 188 377 176 365 150 C355 168 315 168 305 150 Z" className="fill-(--olive)" />
            </g>

            {/* Cebolla roja */}
            <circle cx="448" cy="134" r="35" fill="#8a3b57" />
            <path d="M432 106 C422 128 428 152 448 162" className="fill-none stroke-white opacity-30" strokeWidth="2" strokeLinecap="round" />
            <path d="M464 106 C474 128 468 152 448 162" className="fill-none stroke-white opacity-30" strokeWidth="2" strokeLinecap="round"/>
            <path d="M448 100 C444 86 452 76 460 72" className="fill-none stroke-(--olive)" strokeWidth="5" strokeLinecap="round"/>
        </svg>
    );
};
