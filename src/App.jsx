import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGold } from './context/GoldContext'
import GoldPriceChart from './components/GoldPriceChart'
import PriceCard from './components/PriceCard'
import StatCard from './components/StatCard'
import PriceAlertForm from './components/PriceAlertForm'
// import GeminiAnalysis from './components/GeminiAnalysis'  // TODO: Implement later (avoid rate limit)

function App() {
    const { user, profile, signOut } = useAuth()
    const { data, loading, error, handleManualUpdate } = useGold()
    const navigate = useNavigate()
    const [lastUpdate, setLastUpdate] = useState(null)

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    // Update last update time when data changes
    useEffect(() => {
        if (data && data.length > 0) {
            setLastUpdate(new Date())
        }
    }, [data])

    // Calculate statistics
    const getLatestPrice = () => {
        if (!data || data.length === 0) return { buy: 0, sell: 0, brand: 'N/A', currency: 'VND' }

        // Filter out SILVER to get only Gold prices for the main cards
        const goldData = data.filter(d => !d.brand.includes('SILVER'))

        if (goldData.length === 0) return { buy: 0, sell: 0, brand: 'N/A', currency: 'VND' }

        const latest = goldData[goldData.length - 1]
        return {
            buy: parseFloat(latest.buy_price) || 0,
            sell: parseFloat(latest.sell_price) || 0,
            brand: latest.brand || 'N/A',
            currency: latest.currency || 'VND'
        }
    }

    const calculateChange = (priceType) => {
        if (!data || data.length < 2) return 0

        // Filter out SILVER to compare only Gold prices
        const goldData = data.filter(d => !d.brand.includes('SILVER'))

        if (goldData.length < 2) return 0

        const current = parseFloat(goldData[goldData.length - 1][priceType]) || 0
        const previous = parseFloat(goldData[goldData.length - 2][priceType]) || 0

        if (previous === 0) return 0
        return ((current - previous) / previous) * 100
    }

    const latest = getLatestPrice()
    const buyChange = calculateChange('buy_price')
    const sellChange = calculateChange('sell_price')

    return (
        <div className="min-h-screen">
            {/* Navigation Header - Navy Like GoldSpot */}
            {/* Navigation Header - Navy Like GoldSpot */}
            <nav className="bg-slate-900 border-b border-white/10 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold text-white hover:text-gold-200 transition-colors flex items-center gap-2">
                            <span className="text-3xl">🏆</span>
                            <span>VinaGold AI</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-white/80 hover:text-white transition-colors font-medium">
                                Home
                            </Link>

                            {user ? (
                                <>
                                    <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors font-medium">
                                        Dashboard
                                    </Link>

                                    {/* Simple User Display & Logout */}
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to="/settings"
                                            className="p-2 text-white/80 hover:text-white transition-colors"
                                            title="Settings"
                                        >
                                            ⚙️
                                        </Link>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {(profile?.display_name || user.email)?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-white text-sm hidden md:block font-medium">
                                                {profile?.display_name || user.email?.split('@')[0]}
                                            </span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to logout?')) {
                                                    try {
                                                        await signOut()
                                                        navigate('/login')
                                                    } catch (error) {
                                                        console.error('Logout error:', error)
                                                        alert('Failed to logout. Please try again.')
                                                    }
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-all font-semibold shadow-md hover:shadow-lg"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white/80 hover:text-white transition-colors font-medium">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="btn-primary text-sm shadow-lg">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="p-4 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                                <span className="text-gold">GoldSpot</span> <span style={{ color: 'var(--text-primary)' }}>Analytics</span>
                            </h1>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                📊 Cập nhật liên tục giá vàng và bạc • ⚡ Chính xác • 🔒 Đáng tin cậy
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* Manual Update Button */}
                            <button
                                onClick={() => handleManualUpdate(false)}
                                className="btn-primary text-sm shadow-lg hover:shadow-xl"
                                title="Cập nhật thủ công"
                            >
                                🔄 Cập Nhật Ngay
                            </button>

                            {lastUpdate && (
                                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                    Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Error State */}
                {error && (
                    <div className="glass-card p-6 mb-8 border-red-200 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Lỗi Kết Nối</span>
                        </h3>
                        <p className="text-sm text-red-600 mb-4">{error}</p>
                        {!error.includes('aborted') && (
                            <div className="bg-white p-4 rounded-lg border border-red-200">
                                <p className="text-xs text-gray-600 font-mono">
                                    Vui lòng kiểm tra cấu hình Supabase trong{' '}
                                    <code className="text-navy font-semibold">src/lib/supabase.js</code>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Space */}
                <div className="space-y-8 mb-8">
                    {/* Top Section: Stats & Charts */}
                    <div className="space-y-6">
                        {/* Latest Prices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PriceCard
                                title="Buy Price"
                                price={latest.buy}
                                change={buyChange}
                                icon="💰"
                                currency={latest.currency}
                                loading={loading && data.length === 0}
                            />
                            <PriceCard
                                title="Sell Price"
                                price={latest.sell}
                                change={sellChange}
                                icon="💵"
                                currency={latest.currency}
                                loading={loading && data.length === 0}
                            />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Data Points"
                                value={data.length}
                                icon="📊"
                                color="blue"
                            />
                            <StatCard
                                label="Brand"
                                value={latest.brand}
                                icon="🏷️"
                                color="gold"
                            />
                            <StatCard
                                label="Spread"
                                value={latest.currency === 'VND' ? `${Math.round(latest.sell - latest.buy).toLocaleString('vi-VN')}₫` : `$${(latest.sell - latest.buy).toFixed(2)}`}
                                icon="📈"
                                color="green"
                            />
                            <StatCard
                                label="Status"
                                value={loading ? 'Loading' : 'Live'}
                                icon={loading ? '⏳' : '🟢'}
                                color="purple"
                            />
                        </div>

                        {/* Charts - Now Full Width */}
                        <div className="space-y-6">
                            <GoldPriceChart data={data} metalType="gold" currency={latest.currency} />
                            <GoldPriceChart data={data} metalType="silver" currency={latest.currency} />
                        </div>
                    </div>

                    {/* Bottom Section: Alerts & Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Price Alert */}
                        <div>
                            <PriceAlertForm />
                        </div>

                        {/* Right Column: Info Card */}
                        <div className="glass-card p-6 h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, Inter, sans-serif' }}>
                                <span className="text-2xl">💡</span>
                                <span>Cách Thức Hoạt Động</span>
                            </h3>
                            <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start gap-4 p-3 bg-white/50 rounded-lg border border-gray-100">
                                    <span className="text-gold font-bold text-xl flex-shrink-0 bg-gold-100 w-8 h-8 flex items-center justify-center rounded-full text-gold-600">1</span>
                                    <div className="pt-1">
                                        <span className="font-semibold block text-navy-700 mb-1">Dữ liệu thời gian thực</span>
                                        <span>Cập nhật liên tục từ thị trường thế giới qua kết nối WebSocket siêu tốc.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-3 bg-white/50 rounded-lg border border-gray-100">
                                    <span className="text-gold font-bold text-xl flex-shrink-0 bg-gold-100 w-8 h-8 flex items-center justify-center rounded-full text-gold-600">2</span>
                                    <div className="pt-1">
                                        <span className="font-semibold block text-navy-700 mb-1">Phân tích đa chiều</span>
                                        <span>Theo dõi biến động giá Vàng (Gold) và Bạc (Silver) cùng lúc.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-3 bg-white/50 rounded-lg border border-gray-100">
                                    <span className="text-gold font-bold text-xl flex-shrink-0 bg-gold-100 w-8 h-8 flex items-center justify-center rounded-full text-gold-600">3</span>
                                    <div className="pt-1">
                                        <span className="font-semibold block text-navy-700 mb-1">Thông báo thông minh</span>
                                        <span>Đặt cảnh báo giá và nhận email ngay khi thị trường đạt mức kỳ vọng.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-gray-500 text-sm mt-12 pt-6 border-t border-gray-200">
                    <p className="font-medium text-gray-600">
                        Được xây dựng với ❤️ bằng React + Vite + Tailwind CSS + Supabase + Recharts
                    </p>
                    <p className="mt-2 text-navy font-semibold">
                        © 2024 VinaGold AI - Sản phẩm của Nguyễn Thiện Đức
                    </p>
                </footer>
            </div>
        </div>
    )
}

export default App
