import React from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 group"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Sun Icon (Light Mode) */}
            <svg
                className={`w-5 h-5 transition-all duration-300 ${isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0 absolute inset-0 m-auto'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Moon Icon (Dark Mode) */}
            <svg
                className={`w-5 h-5 transition-all duration-300 ${isDark
                        ? 'rotate-90 scale-0 opacity-0 absolute inset-0 m-auto'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>

            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isDark ? '☀️ Light' : '🌙 Dark'}
            </span>
        </button>
    )
}

export default ThemeToggle
