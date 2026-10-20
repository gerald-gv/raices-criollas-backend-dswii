export default function MisPedidosLoading() {
    return (
        <div className="min-h-screen bg-(--cream) pb-24">
            <div className="border-b border-(--line) bg-(--paper) px-6 py-12 md:px-[8vw] lg:py-16">
                <div className="container mx-auto max-w-5xl animate-pulse">
                    <div className="h-4 w-28 bg-(--line)" />
                    <div className="mt-3 h-10 w-64 bg-(--line)" />
                    <div className="mt-8 flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-7 w-20 rounded-full bg-(--line)/50" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-10 max-w-5xl animate-pulse px-6 md:px-8">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 rounded-sm border border-(--line) bg-(--paper) p-6">
                            <div className="flex justify-between">
                                <div className="h-6 w-32 bg-(--line)" />
                                <div className="h-5 w-20 rounded-full bg-(--line)/60" />
                            </div>
                            <div className="mt-6 h-4 w-48 bg-(--line)/40" />
                            <div className="mt-2 h-4 w-32 bg-(--line)/40" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
