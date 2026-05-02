export default function SummaryPill({ label, value }) {
  return (
    <div
      className="rounded-lg border px-2 py-2"
      style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
    >
      <p className="text-sm uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="mt-1 text-base font-semibold" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  )
}
