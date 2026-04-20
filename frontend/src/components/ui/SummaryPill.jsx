export default function SummaryPill({ label, value }) {
    return (
        <div className="rounded-lg border border-[#d7dde5] bg-[#fbfcfd] px-2 py-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{value}</p>
        </div>
    )
}
