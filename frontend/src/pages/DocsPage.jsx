import Card from '../components/ui/Card'

export default function DocsPage() {
    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Documentation</h1>
            <Card>
                <h2 className="text-lg font-semibold text-slate-800">How EvalBoard Works</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] text-slate-600">
                    <li>Create datasets made of input / ideal_output pairs.</li>
                    <li>Save reusable prompts using {'{{input}}'} placeholders.</li>
                    <li>Run evaluations with selected provider/model/temperature.</li>
                    <li>View run-level and row-level scoring with latency details.</li>
                </ul>

                <h2 className="mt-5 text-lg font-semibold text-slate-800">Scoring</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-slate-600">
                    <li>1.0 means exact normalized match.</li>
                    <li>0.0 means no normalized match.</li>
                    <li>Buckets: perfect, partial, failed.</li>
                </ul>
            </Card>
        </div>
    )
}
