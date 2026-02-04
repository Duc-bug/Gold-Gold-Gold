import React from 'react'
import { Toaster } from 'react-hot-toast'

const ToastContainer = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: 'var(--bg-glass)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'var(--shadow-xl)',
                    borderRadius: '1rem',
                    padding: '16px',
                },
                // Success toast
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                    },
                },
                // Error toast
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                    },
                },
                // Loading toast
                loading: {
                    iconTheme: {
                        primary: '#f59e0b',
                        secondary: '#ffffff',
                    },
                },
            }}
        />
    )
}

export default ToastContainer
