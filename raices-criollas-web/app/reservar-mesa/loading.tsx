export default function ReservarMesaLoading() {
  return (
    <div className="min-h-screen bg-(--cream) pb-20">
      <div className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
        <div className="container mx-auto max-w-5xl animate-pulse">
          <div className="h-4 w-32 bg-(--line)" />
          <div className="mt-3 h-10 w-72 bg-(--line)" />
          <div className="mt-4 h-5 max-w-md bg-(--line)" />
          <div className="mt-8 h-28 w-full bg-(--line)/50" />
        </div>
      </div>

      <div className="container mx-auto mt-10 max-w-5xl px-6 md:px-8 animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-sm border border-(--line) bg-(--paper) p-5">
              <div className="h-6 w-3/4 bg-(--line)" />
              <div className="mt-3 h-4 w-1/2 bg-(--line)/60" />
              <div className="mt-8 h-9 w-full bg-(--line)/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
