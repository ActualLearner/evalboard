export default function LatencyChart({ labels, values }) {
  const width = 760
  const height = 220
  const left = 8
  const right = 752
  const top = 26
  const bottom = 196
  const rangeY = bottom - top
  const steps = Math.max(1, values.length - 1)
  const maxVal = Math.max(1, ...values)

  const linePoints = values
    .map((v, i) => {
      const x = left + ((right - left) * i) / steps
      const y = bottom - (v / maxVal) * rangeY
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `${linePoints} ${right},202 ${left},202`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-56 w-full max-w-full">
      {[0, 1, 2, 3, 4].map((n) => {
        const y = bottom - (rangeY / 4) * n
        return <line key={n} x1={left} y1={y} x2={right} y2={y} stroke="var(--border)" strokeWidth="1.5" />
      })}

      <polyline fill="oklch(0.60 0.08 200 / 0.11)" stroke="none" points={areaPoints} />
      <polyline fill="none" stroke="oklch(0.62 0.10 200)" strokeWidth="2.5" points={linePoints} />

      <text x="8" y="218" fill="var(--muted-foreground)" fontSize="11">{labels[0] || '-'}</text>
      <text x="692" y="218" fill="var(--muted-foreground)" fontSize="11">{labels[labels.length - 1] || '-'}</text>
    </svg>
  )
}
