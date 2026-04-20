export function scoreTextClass(score) {
  const n = Number(score || 0)
  if (n >= 0.75) return 'text-emerald-600 font-semibold'
  if (n <= 0.25) return 'text-rose-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

export function formatMs(v) {
  if (v == null) return '-'
  return `${Number(v).toFixed(1)} ms`
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleString()
}

export function formatShortDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
}

export function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.detail || error?.message || fallback
}
