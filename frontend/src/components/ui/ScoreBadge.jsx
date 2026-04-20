export default function ScoreBadge({ score }) {
    const cls =
        score === 1
            ? 'bg-emerald-500 text-white'
            : score === 0
                ? 'bg-rose-500 text-white'
                : 'bg-amber-400 text-slate-900'

    return <span className={['rounded px-2 py-1 text-xs font-semibold', cls].join(' ')}>{score.toFixed(2)}</span>
}
