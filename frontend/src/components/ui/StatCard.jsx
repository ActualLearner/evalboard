import Card from './Card'

export default function StatCard({ title, value, className, loading }) {
    return (
        <Card className={className}>
            <h2 className="text-[18px] font-light leading-none text-slate-500">{title}</h2>
            <p className="mt-3 text-[22px] font-normal leading-none tracking-tight text-slate-900">
                {loading ? '...' : value}
            </p>
        </Card>
    )
}
