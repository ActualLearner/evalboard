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
        return <line key={n} x1={left} y1={y} x2={right} y2={y} stroke="var(--border)" strokeWidth="1.3" />
      })}
      {values.length > 0 ? <polyline fill="oklch(0.55 0.08 240 / 0.12)" stroke="none" points={areaPoints} /> : null}
      {values.length > 0 ? <polyline fill="none" stroke="oklch(0.60 0.10 240)" strokeWidth="2.3" points={points} /> : null}
      <text x="8" y="178" fill="var(--muted-foreground)" fontSize="11">{labels[0] || '-'}</text>
      <text x="300" y="178" fill="var(--muted-foreground)" fontSize="11">{labels[labels.length - 1] || '-'}</text>
    </svg>
  )
}
