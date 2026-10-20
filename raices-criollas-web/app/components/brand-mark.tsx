const BrandMark = () => {
    return (
        <div className="brand-mark relative flex size-9.5 items-center justify-center rounded-full" aria-label="Raices Criollas">
            <span className="text-[12px] font-black tracking-[-0.08em]">
                RC
            </span>

            <i className="absolute inset-1 rounded-full border border-(--ink) opacity-45" />
        </div>
    );
};

export default BrandMark