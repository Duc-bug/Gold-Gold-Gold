import React from 'react'

const StatCard = ({ label, value, icon, color = 'gold', trend = null }) => {
    const colorStyles = {
        blue: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2))',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textColor: '#60a5fa'
        },
        green: {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.2))',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            textColor: '#4ade80'
        },
        red: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            textColor: '#f87171'
        },
        purple: {
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.2))',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            textColor: '#c084fc'
        },
        gold: {
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(202, 138, 4, 0.2))',
            borderColor: 'rgba(234, 179, 8, 0.3)',
            textColor: '#facc15'
        }
    }

    const style = colorStyles[color] || colorStyles.gold

    return (
        <div
            className="stat-card group"
            style={{
                background: style.background,
                borderColor: style.borderColor
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p
                        className="text-xs font-semibold tracking-wider uppercase mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {label}
                    </p>
                    <h3
                        className="text-3xl font-bold tracking-tight"
                        style={{
                            color: 'var(--text-primary)',
                            fontFamily: 'Poppins, Inter, sans-serif'
                        }}
                    >
                        {value}
                    </h3>

                    {trend && (
                        <div
                            className="flex items-center gap-1 mt-3 text-xs font-semibold"
                            style={{
                                color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                            }}
                        >
                            <span>{trend >= 0 ? '↗' : '↘'}</span>
                            <span>{Math.abs(trend)}%</span>
                            <span style={{ color: 'var(--text-muted)' }} className="ml-1">vs last</span>
                        </div>
                    )}
                </div>
                <div
                    className="p-4 rounded-xl transition-transform group-hover:scale-110"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        color: style.textColor,
                        fontSize: '1.75rem'
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    )
}

export default StatCard
