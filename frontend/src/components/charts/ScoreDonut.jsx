export default function ScoreDonut({ distribution }) {
  const perfect = Number(distribution?.perfect || 0)
  const partial = Number(distribution?.partial || 0)
  const failed = Number(distribution?.failed || 0)
  const total = perfect + partial + failed

  const pPerfect = total ? (perfect / total) * 100 : 0
  const pPartial = total ? (partial / total) * 100 : 0
  const pFailed = total ? (failed / total) * 100 : 0

  const emptyColor = 'oklch(0.78 0.004 172)'
  const gradient = total
    ? `conic-gradient(oklch(0.60 0.14 158) 0 ${pPerfect}%, oklch(0.72 0.14 78) ${pPerfect}% ${pPerfect + pPartial}%, oklch(0.58 0.14 20) ${pPerfect + pPartial}% ${pPerfect + pPartial + pFailed}%)`
    : `conic-gradient(${emptyColor} 0 100%)`

  return (
    <div className="relative h-56 w-56">
      <div className="h-full w-full rounded-full" style={{ background: gradient }} />
      <div
        className="absolute inset-6 grid place-items-center rounded-full text-center"
        style={{ background: 'var(--card)' }}
      >
        <div>
          <p className="text-[28px] font-normal" style={{ color: 'var(--foreground)' }}>{total}</p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
        </div>
      </div>
    </div>
  )
}
