export default function AvgScoreBars({ labels, values }) {
    const width = 360
    const height = 190
    const left = 8
    const right = 352
    const top = 24
    const bottom = 150
    const rangeY = bottom - top
    const steps = Math.max(1, values.length - 1)

    const points = values
        .map((v, i) => {
            const x = left + ((right - left) * i) / steps
            const y = bottom - Math.max(0, Math.min(1, v || 0)) * rangeY
            return `${x},${y}`
        })
        .join(' ')

    const areaPoints = `${points} ${right},160 ${left},160`

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-44 w-full">
            {[0, 1, 2, 3].map((n) => {
                const y = bottom - (rangeY / 3) * n
                return <line key={n} x1={left} y1={y} x2={right} y2={y} className="stroke-slate-200" strokeWidth="1.3" />
            })}
            {values.length > 0 ? <polyline fill="rgba(77,142,240,0.12)" stroke="none" points={areaPoints} /> : null}
            {values.length > 0 ? <polyline fill="none" stroke="#4d8ef0" strokeWidth="2.3" points={points} /> : null}
            <text x="8" y="178" className="fill-slate-400 text-base">{labels[0] || '-'}</text>
            <text x="300" y="178" className="fill-slate-400 text-base">{labels[labels.length - 1] || '-'}</text>
        </svg>
    )
}
