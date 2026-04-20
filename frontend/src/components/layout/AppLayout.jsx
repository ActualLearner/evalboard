import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { navItems } from '../../constants/navItems'
import { MenuIcon, MoonIcon, RocketIcon } from '../icons/AppIcons'
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

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
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
                        className="absolute left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5dae1] bg-[#fbfcfd] text-slate-700 hover:-translate-y-0.5 hover:bg-[#f2f6fb] lg:hidden"
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
                            <div className="flex items-center gap-3">
                                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e6eef8] text-[#40689f]">
                                    <RocketIcon />
                                </span>
                                <span className="text-base font-semibold text-slate-900">EvalBoard</span>
                            </div>
                            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#d4d8de] bg-[#fbfcfd] text-slate-700">
                                <MoonIcon />
                            </span>
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
                                                ? 'bg-[#e5ebf3] text-[#111827]'
                                                : 'text-[#8f96a3] hover:bg-[#eceff3] hover:text-[#697280]',
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
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
