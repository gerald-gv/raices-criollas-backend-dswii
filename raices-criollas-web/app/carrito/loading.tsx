export default function CarritoLoading() {
  return (
    <div className="min-h-screen bg-(--cream) pb-24">
      <div className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
        <div className="container mx-auto max-w-5xl animate-pulse">
          <div className="h-4 w-28 bg-(--line)" />
          <div className="mt-3 h-10 w-56 bg-(--line)" />
        </div>
      </div>

      <div className="container mx-auto mt-10 grid max-w-5xl animate-pulse gap-8 px-6 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="border border-(--line) bg-(--paper) p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border-b border-(--line) py-5 last:border-b-0">
              <div className="size-24 bg-(--line)/60" />
              <div className="flex-1">
                <div className="h-5 w-40 bg-(--line)" />
                <div className="mt-3 h-4 w-24 bg-(--line)/50" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-72 border border-(--line) bg-(--paper)" />
      </div>
    </div>
  );
}
