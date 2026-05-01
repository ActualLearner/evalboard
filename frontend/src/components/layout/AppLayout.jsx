import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { navItems } from '../../constants/navItems'
import { MenuIcon, RocketIcon } from '../icons/AppIcons'
import DashboardPage from '../../pages/DashboardPage'
import RunsPage from '../../pages/RunsPage'
import NewRunPage from '../../pages/NewRunPage'
import RunDetailPage from '../../pages/RunDetailPage'
import DatasetsPage from '../../pages/DatasetsPage'
import NewDatasetPage from '../../pages/NewDatasetPage'
import DatasetEditPage from '../../pages/DatasetEditPage'
import PromptsPage from '../../pages/PromptsPage'
import DocsPage from '../../pages/DocsPage'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 3.5a8.3 8.3 0 1 0 5.8 11.8 7.1 7.1 0 0 1-5.8-11.8Z" />
    </svg>
  )
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const uiScale = 0.80
  const scaledWidth = `calc(${100 / uiScale}% - 2px)`
  const scaledMinHeight = `calc((100vh - 48px) / ${uiScale})`

  return (
    <div className="app-backdrop min-h-screen overflow-x-hidden overflow-y-auto p-2 sm:p-3">
      <div style={{ zoom: uiScale, width: scaledWidth, maxWidth: '100%' }}>
        <div
          className="app-shell relative flex w-full overflow-hidden rounded-3xl border"
          style={{ minHeight: scaledMinHeight }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="absolute left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:-translate-y-0.5 hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          {mobileOpen ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 z-20 bg-slate-900/35 lg:hidden"
              aria-label="Close sidebar"
            />
          ) : null}

          <aside
            className={[
              'app-sidebar absolute z-30 flex h-full w-60 flex-col border-r p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 rounded-xl px-1 py-1 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Go to home"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <RocketIcon />
                </span>
                <span className="text-base font-semibold text-foreground">EvalBoard</span>
              </button>
              <button
                onClick={toggle}
                aria-label="Toggle dark mode"
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={label}
                  to={path}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'app-nav-item group flex items-center gap-2 rounded-xl px-3 py-2 text-[18px]',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                    ].join(' ')
                  }
                >
                  <span className="text-current opacity-80">
                    <Icon />
                  </span>
                  <span className="text-base font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto" />
          </aside>

          <main className="app-main w-full flex-1 overflow-x-hidden overflow-y-auto p-4 pt-16 text-base sm:p-5 sm:pt-20 lg:pt-5">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/runs" element={<RunsPage />} />
              <Route path="/runs/new" element={<NewRunPage />} />
              <Route path="/runs/:id" element={<RunDetailPage />} />
              <Route path="/datasets" element={<DatasetsPage />} />
              <Route path="/datasets/new" element={<NewDatasetPage />} />
              <Route path="/datasets/:id" element={<DatasetEditPage />} />
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}
