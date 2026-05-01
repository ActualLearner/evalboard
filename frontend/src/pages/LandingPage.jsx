import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  return (
    <div className="landing-root relative min-h-screen overflow-hidden">
      {/* Ambient background blobs */}
      <div className="landing-blob landing-blob-1" />
      <div className="landing-blob landing-blob-2" />
      <div className="landing-blob landing-blob-3" />

      {/* Top-right theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="landing-theme-btn fixed right-6 top-6 z-20"
      >
        {dark ? <SunIcon /> : <MoonIconLanding />}
      </button>

      {/* Main content — pt-24 ensures logo clears any browser chrome */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        {/* Logo mark */}
        <div className="landing-logo-wrap mb-8">
          <div className="landing-logo-inner">
            <RocketLandingIcon />
          </div>
          <div className="landing-logo-ring" />
        </div>

        {/* Eyebrow */}
        <p className="landing-eyebrow mb-4">LLM Evaluation Platform</p>

        {/* Headline */}
        <h1 className="landing-headline">
          Measure what<br />
          <span className="landing-headline-accent">models actually do.</span>
        </h1>

        {/* Subline */}
        <p className="landing-subline mt-6 max-w-xl">
          EvalBoard lets you run structured evaluations across providers and models,
          track score trends, and understand latency — all in one place.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="landing-cta-primary group"
          >
            <span>Open Dashboard</span>
            <ArrowRightIcon />
          </button>
          <button
            onClick={() => navigate('/runs/new')}
            className="landing-cta-secondary"
          >
            Start a run
          </button>
        </div>

        {/* Feature strip */}
        <div className="landing-features mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<ChartIcon />}
            title="Real-time Scores"
            desc="Track perfect, partial, and failed rates across every evaluation run."
          />
          <FeatureCard
            icon={<ProviderIcon />}
            title="Multi-provider"
            desc="Compare OpenAI, Anthropic, and others side by side on the same dataset."
          />
          <FeatureCard
            icon={<SpeedIcon />}
            title="Latency Insights"
            desc="Surface which models are fast and which are dragging your pipeline down."
          />
        </div>

        {/* Footer note */}
        <p className="landing-footer-note mt-16">
          Built for teams who care about model quality.
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="landing-feature-card">
      <div className="landing-feature-icon">{icon}</div>
      <h3 className="landing-feature-title">{title}</h3>
      <p className="landing-feature-desc">{desc}</p>
    </div>
  )
}

function RocketLandingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.8 3.5c2.1.3 4.4 2.6 4.7 4.7l-4.3 4.3-4.7-4.7 4.3-4.3Z" />
      <path d="M10.5 7.8 7 11.3m8.2 1.2-3.5 3.5M7 11.3l-1.5 4.8 4.8-1.5m3.4-1 3.3 3.3" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

function MoonIconLanding() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 3.5a8.3 8.3 0 1 0 5.8 11.8 7.1 7.1 0 0 1-5.8-11.8Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18M7 16l4-4 4 4 4-7" />
    </svg>
  )
}

function ProviderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12 8 7M12 2a10 10 0 1 1-7.07 2.93" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}
