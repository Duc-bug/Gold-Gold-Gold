import React from 'react'

const PriceCard = ({ title, price, change, icon, currency = 'USD', loading = false }) => {
    const isPositive = change >= 0

    // Format giá theo currency
    const formatPrice = (price, currency) => {
        if (currency === 'VND') {
            // VND: Không có decimal, có dấu phẩy ngăn cách
            return Math.round(price).toLocaleString('vi-VN')
        } else {
            // USD: Có 2 chữ số thập phân
            return parseFloat(price).toFixed(2)
        }
    }

    // Symbol cho currency
    const getCurrencySymbol = (currency) => {
        return currency === 'VND' ? '₫' : '$'
    }

    if (loading) {
        return (
            <div className="price-card">
                <div className="shimmer-bg h-24 rounded-lg"></div>
            </div>
        )
    }

    return (
        <div className="price-card group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl transform group-hover:scale-110 transition-transform">{icon}</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
                        {title}
                    </h3>
                </div>
                <div
                    className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide"
                    style={{
                        backgroundColor: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                        color: '#ffffff',
                        opacity: 0.9
                    }}
                >
                    {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(2)}%
                </div>
            </div>

            <div className="flex items-baseline gap-3">
                <span
                    className="text-5xl font-black text-gold glow-gold-strong"
                    style={{
                        fontFamily: 'Poppins, Inter, sans-serif',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {formatPrice(price, currency)}
                </span>
                <span
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    {getCurrencySymbol(currency)}
                </span>
            </div>
        </div>
    )
}

export default PriceCard
