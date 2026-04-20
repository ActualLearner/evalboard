export default function ScoreDonut({ distribution }) {
    const perfect = Number(distribution?.perfect || 0)
    const partial = Number(distribution?.partial || 0)
    const failed = Number(distribution?.failed || 0)
    const total = perfect + partial + failed

    const pPerfect = total ? (perfect / total) * 100 : 0
    const pPartial = total ? (partial / total) * 100 : 0
    const pFailed = total ? (failed / total) * 100 : 0

    const gradient = `conic-gradient(#22c55e 0 ${pPerfect}%, #f59e0b ${pPerfect}% ${pPerfect + pPartial}%, #ef4444 ${pPerfect + pPartial}% ${pPerfect + pPartial + pFailed}%)`

    return (
        <div className="relative h-56 w-56">
            <div className="h-full w-full rounded-full" style={{ background: gradient }} />
            <div className="absolute inset-6 grid place-items-center rounded-full bg-[#f8fafc] text-center">
                <div>
                    <p className="text-[28px] font-normal text-slate-900">{total}</p>
                    <p className="text-sm text-slate-500">Total Items</p>
                </div>
            </div>
        </div>
    )
}
