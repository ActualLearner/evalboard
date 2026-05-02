export default function ScoreBadge({ score }) {
  const style =
    score === 1
      ? { background: 'oklch(0.55 0.12 158)', color: 'oklch(0.97 0.01 158)' }
      : score === 0
        ? { background: 'oklch(0.52 0.12 20)', color: 'oklch(0.97 0.01 20)' }
        : { background: 'oklch(0.68 0.14 78)', color: 'oklch(0.15 0.03 78)' }

  return (
    <span className="rounded px-2 py-1 text-xs font-semibold" style={style}>
      {score.toFixed(2)}
    </span>
  )
}
