export default function Legend({ color, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 font-light leading-none text-slate-500">
            <span className={['h-2 w-2 rounded-full', color].join(' ')} />
            {label}
        </span>
    )
}
