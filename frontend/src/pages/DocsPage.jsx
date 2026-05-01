import Card from '../components/ui/Card'

export default function DocsPage() {
    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">EvalBoard Documentation</h1>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">What is EvalBoard?</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    EvalBoard is a <strong>single-turn LLM evaluation platform</strong>. You define a dataset of
                    <span className="font-medium"> input </span>
                    and
                    <span className="font-medium"> ideal_output </span>
                    pairs, write a prompt template, pick a model, and run the eval. EvalBoard scores every response and
                    surfaces the results in a dashboard.
                </p>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    Single-turn means each row is one isolated prompt to response exchange. No conversation history,
                    no tool use.
                </p>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">How It Works</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[16px] text-slate-600">
                    <li>Create a dataset of <span className="font-medium">input</span> and <span className="font-medium">ideal_output</span> rows. Import CSV or type directly.</li>
                    <li>Write a prompt and use <span className="font-medium">{'{{input}}'}</span> as the placeholder. Save for reuse or write inline.</li>
                    <li>Run an eval by choosing provider, model, and temperature. EvalBoard evaluates every row and stores each result.</li>
                    <li>Read results with per-row scores and latency, plus run-level summary insights.</li>
                </ol>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">Scoring</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    Responses are scored using <strong>normalized exact match</strong>.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-slate-600">
                    <li>Strip punctuation, lowercase, trim whitespace, then compare.</li>
                    <li><span className="font-medium">1.0</span> means match after normalization.</li>
                    <li><span className="font-medium">0.0</span> means no match.</li>
                </ul>
                <p className="mt-3 rounded-lg border border-[#d7dde5] px-3 py-2 text-[15px] text-slate-600 bg-white">
                    Example: model responds <span className="font-medium">Paris.</span>, ideal is
                    <span className="font-medium"> Paris</span>{' -> '}both normalize to
                    <span className="font-medium"> paris</span>{' -> '}score <span className="font-medium">1.0</span>
                </p>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    Keep ideal outputs short and precise. Single words or short phrases usually work best.
                </p>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">Latency</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">Latency is measured in milliseconds at two levels:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-slate-600">
                    <li>Row-level: time for one LLM call (network round-trip to the provider).</li>
                    <li>Run-level: total wall-clock time for the entire run.</li>
                </ul>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    Groq is typically the fastest provider by a significant margin due to its custom LPU hardware.
                </p>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">Providers</h2>
                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-120 w-full border-collapse text-[16px]">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Provider</th>
                                <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Key Required?</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            <tr className="border-b border-[#e4e9f0]">
                                <td className="px-2 py-2">Groq</td>
                                <td className="px-2 py-2">No - free, recommended</td>
                            </tr>
                            <tr className="border-b border-[#e4e9f0]">
                                <td className="px-2 py-2">Anthropic</td>
                                <td className="px-2 py-2">Yes - required for all models</td>
                            </tr>
                            <tr className="border-b border-[#e4e9f0]">
                                <td className="px-2 py-2">Gemini</td>
                                <td className="px-2 py-2">Model-dependent</td>
                            </tr>
                            <tr className="border-b border-[#e4e9f0]">
                                <td className="px-2 py-2">DeepSeek</td>
                                <td className="px-2 py-2">No</td>
                            </tr>
                            <tr className="border-b border-[#e4e9f0]">
                                <td className="px-2 py-2">OpenAI</td>
                                <td className="px-2 py-2">Yes - required for all models</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
                    API keys are stored in your browser localStorage only and are never saved to the database.
                </p>
                <p className="mt-2 text-[16px] leading-relaxed text-slate-600">
                    Current Gemini models requiring a key are: gemini-3-flash-preview, gemini-3.1-pro-preview, and gemini-3.1-flash-lite-preview.
                </p>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-600">Tips</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] text-slate-600">
                    <li>Set temperature to <span className="font-medium">0</span> for factual evals to keep reruns consistent.</li>
                    <li>Run the same dataset against multiple models to compare them directly.</li>
                    <li>Keep datasets under 50 rows to avoid long wait times.</li>
                </ul>
            </Card>
        </div>
    )
}
