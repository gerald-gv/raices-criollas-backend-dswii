// Se muestra mientras el servidor espera la respuesta del gateway
export default function CartaLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Cargando la carta">
      <div className="px-6 pb-9 pt-13.75 md:px-[8vw] lg:pt-20">
        <div className="container mx-auto">
          <div className="h-3 w-24 bg-(--line)" />
          <div className="mt-4 h-16 w-72 max-w-full bg-(--line)" />
          <div className="mt-5 h-4 w-96 max-w-full bg-(--line)" />
        </div>
      </div>

      <div className="h-14.5 border-y border-(--line)" />

      <div className="bg-(--paper) px-6 py-14 md:px-[8vw]">
        <div className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-(--line) bg-(--paper)">
              <div className="aspect-4/3 bg-[#f2ebdc]" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 bg-(--line)" />
                <div className="h-3 w-full bg-(--line)" />
                <div className="h-3 w-4/5 bg-(--line)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
