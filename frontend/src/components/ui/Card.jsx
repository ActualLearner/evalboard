export default function Card({ children, className = '' }) {
    return (
        <article className={['app-card min-w-0 overflow-hidden rounded-2xl border p-5', className].join(' ')}>
            {children}
        </article>
    )
}
