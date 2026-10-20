export default function AdminLoading() {
    return (
        <div className="animate-pulse" aria-busy="true" aria-label="Cargando el panel">
            <div className="h-3 w-28 bg-(--line)" />
            <div className="mt-4 h-12 w-72 max-w-full bg-(--line)" />
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-36 border border-(--line) bg-(--paper)" />
                ))}
            </div>
            <div className="mt-10 h-72 border border-(--line) bg-(--paper)" />
        </div>
    );
}
