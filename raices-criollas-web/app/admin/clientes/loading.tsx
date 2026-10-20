export default function AdminClientesLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-9">
        <div className="h-4 w-28 bg-(--line)" />
        <div className="mt-3 h-10 w-64 bg-(--line)" />
        <div className="mt-3 h-4 w-80 bg-(--line)/60" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-sm border border-(--line) bg-(--paper) p-4" />
        ))}
      </div>

      <div className="border border-(--line) bg-(--paper) p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-(--line)/40 pb-4">
              <div className="h-5 w-40 bg-(--line)" />
              <div className="h-4 w-24 bg-(--line)/60" />
              <div className="h-4 w-20 bg-(--line)/60" />
              <div className="h-4 w-20 bg-(--line)/60" />
              <div className="h-8 w-24 bg-(--line)/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
