import { useEffect, useRef, useState } from 'react'

export default function ScrollableSelect({ options, value, onChange, placeholder = 'Select option', disabled = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const normalizedOptions = options.map((opt) => (typeof opt === 'string'
    ? { value: opt, label: opt }
    : { value: String(opt.value), label: opt.label }))

  const selected = normalizedOptions.find((opt) => opt.value === String(value || ''))

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        style={{
          background: disabled ? 'var(--muted)' : 'var(--card)',
          borderColor: 'var(--border)',
          color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
          opacity: disabled ? 0.7 : 1,
        }}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-base transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
        disabled={disabled}
      >
        <span className="truncate pr-3">{selected?.label || placeholder}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>▾</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border py-1"
          style={{
            background: 'var(--popover)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 22px oklch(0 0 0 / 0.18)',
          }}
        >
          {normalizedOptions.map((opt) => (
            <li key={opt.value || opt.label}>
              <button
                type="button"
                style={{
                  background: opt.value === String(value || '') ? 'var(--muted)' : 'transparent',
                  color: opt.value === String(value || '') ? 'var(--foreground)' : 'var(--foreground)',
                }}
                className="w-full px-3 py-2 text-left text-base transition-colors hover:bg-[var(--muted)]"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
