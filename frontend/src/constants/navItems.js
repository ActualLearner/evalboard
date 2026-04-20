import { DatabaseIcon, FileIcon, HomeIcon, ListIcon, RocketPlayIcon } from '../components/icons/AppIcons'

export const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: HomeIcon, end: true },
  { label: 'Runs', path: '/runs', icon: ListIcon, end: true },
  { label: 'Datasets', path: '/datasets', icon: DatabaseIcon, end: false },
  { label: 'Prompts', path: '/prompts', icon: FileIcon, end: true },
  { label: 'New Run', path: '/runs/new', icon: RocketPlayIcon, end: true },
]
