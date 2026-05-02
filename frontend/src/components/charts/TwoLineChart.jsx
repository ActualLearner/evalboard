export default function TwoLineChart({ labels, first, second, secondAsFraction = false }) {
  const width = 760
  const height = 220
  const left = 6
  const right = 754
  const top = 20
  const bottom = 196
  const rangeY = bottom - top
  const steps = Math.max(1, (labels || []).length - 1)

  const maxFirst = Math.max(1, ...first)
  const maxSecond = secondAsFraction ? 1 : Math.max(1, ...second)

  const pointsFirst = first
    .map((v, i) => {
      const x = left + ((right - left) * i) / steps
      const y = bottom - (v / maxFirst) * rangeY
      return `${x},${y}`
    })
    .join(' ')

  const pointsSecond = second
    .map((v, i) => {
      const x = left + ((right - left) * i) / steps
      const y = bottom - (v / maxSecond) * rangeY
      return `${x},${y}`
    })
    .join(' ')

  const firstDots = first.map((v, i) => {
    const x = left + ((right - left) * i) / steps
    const y = bottom - (v / maxFirst) * rangeY
    return { x, y }
  })

  const secondDots = second.map((v, i) => {
    const x = left + ((right - left) * i) / steps
    const y = bottom - (v / maxSecond) * rangeY
    return { x, y }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-56 w-full">
      {[0, 1, 2, 3, 4].map((n) => {
        const y = bottom - (rangeY / 4) * n
        return <line key={n} x1={left} y1={y} x2={right} y2={y} stroke="var(--border)" strokeWidth="1.5" />
      })}

      {first.length > 0 ? <polyline fill="none" stroke="oklch(0.58 0.12 158)" strokeWidth="2.5" points={pointsFirst} /> : null}
      {second.length > 0 ? <polyline fill="none" stroke="oklch(0.58 0.12 240)" strokeWidth="2.5" points={pointsSecond} /> : null}
      {firstDots.map((p, i) => (
        <circle key={`first-${i}`} cx={p.x} cy={p.y} r="2.2" fill="oklch(0.58 0.12 158)" />
      ))}
      {secondDots.map((p, i) => (
        <circle key={`second-${i}`} cx={p.x} cy={p.y} r="2.2" fill="oklch(0.58 0.12 240)" />
      ))}

      <text x={left} y="218" fill="var(--muted-foreground)" fontSize="11">{labels[0] || '-'}</text>
      <text x={right - 58} y="218" fill="var(--muted-foreground)" fontSize="11">{labels[labels.length - 1] || '-'}</text>
    </svg>
  )
}
