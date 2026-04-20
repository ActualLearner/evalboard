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
                className={[
                    'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-base',
                    disabled
                        ? 'cursor-not-allowed border-[#d6dde6] bg-[#f2f5f8] text-slate-500'
                        : 'border-[#d3dae3] bg-[#fbfcfd]',
                ].join(' ')}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    if (disabled) return
                    setOpen((prev) => !prev)
                }}
                disabled={disabled}
            >
                <span className="truncate pr-3">{selected?.label || placeholder}</span>
                <span className="text-slate-500">▾</span>
            </button>

            {open ? (
                <ul
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#d3dae3] bg-white py-1 shadow-[0_8px_22px_rgba(15,23,42,0.12)]"
                >
                    {normalizedOptions.map((opt) => (
                        <li key={opt.value || opt.label}>
                            <button
                                type="button"
                                className={[
                                    'w-full px-3 py-2 text-left text-base hover:bg-[#eef2f7]',
                                    opt.value === String(value || '') ? 'bg-[#eaf0f8] text-slate-900' : 'text-slate-700',
                                ].join(' ')}
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
