export function HomeIcon() {
    return <IconBox d="M4 10.8 12 4l8 6.8v7.4a1 1 0 0 1-1 1h-4.8v-5.4H9.8v5.4H5a1 1 0 0 1-1-1v-7.4Z" />
}

export function ListIcon() {
    return <IconBox d="M4 6h16M4 12h16M4 18h16" strokeOnly />
}

export function DatabaseIcon() {
    return <IconBox d="M5 7c0-2 3.1-3 7-3s7 1 7 3-3.1 3-7 3-7-1-7-3Zm0 5c0 2 3.1 3 7 3s7-1 7-3m-14 5c0 2 3.1 3 7 3s7-1 7-3" strokeOnly />
}

export function FileIcon() {
    return <IconBox d="M6 4h8l4 4v12H6V4Zm8 0v4h4" strokeOnly />
}

export function RocketPlayIcon() {
    return <IconBox d="M14.6 4c2 .4 3.9 2.3 4.3 4.3L14.8 12l-4.8-4.8L14.6 4ZM10 7.2l-3 3M14.4 12.4l-3 3M7 10.2l-1.2 3.8L9.6 12.8M20 17l-5 3V14l5 3Z" strokeOnly />
}

export function RocketIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M14.8 3.5c2.1.3 4.4 2.6 4.7 4.7l-4.3 4.3-4.7-4.7 4.3-4.3Z" />
            <path d="M10.5 7.8 7 11.3m8.2 1.2-3.5 3.5M7 11.3l-1.5 4.8 4.8-1.5m3.4-1 3.3 3.3" />
        </svg>
    )
}

export function MoonIcon() {
    return <IconBox d="M14.7 3.5a8.3 8.3 0 1 0 5.8 11.8 7.1 7.1 0 0 1-5.8-11.8Z" />
}

export function BookIcon() {
    return <IconBox d="M5 5.8A1.8 1.8 0 0 1 6.8 4H19v14H6.8A1.8 1.8 0 0 0 5 19.8V5.8Zm0 14V7.2" strokeOnly />
}

export function MenuIcon() {
    return <IconBox d="M4 7h16M4 12h16M4 17h16" strokeOnly />
}

function IconBox({ d, strokeOnly = false }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={strokeOnly ? 'none' : 'currentColor'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={d} />
        </svg>
    )
}
