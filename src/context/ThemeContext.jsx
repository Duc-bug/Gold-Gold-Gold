import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark')
    const [mounted, setMounted] = useState(false)

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('vinagold-theme') || 'dark'
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
        setMounted(true)
    }, [])

    // Update theme and save to localStorage
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('vinagold-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    const setThemeMode = (mode) => {
        if (mode !== 'dark' && mode !== 'light') return
        setTheme(mode)
        localStorage.setItem('vinagold-theme', mode)
        document.documentElement.setAttribute('data-theme', mode)
    }

    const value = {
        theme,
        toggleTheme,
        setTheme: setThemeMode,
        isDark: theme === 'dark',
        isLight: theme === 'light'
    }

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
