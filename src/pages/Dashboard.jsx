import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserProfile from '../components/auth/UserProfile'
import Watchlist from '../components/dashboard/Watchlist'
import PortfolioTracker from '../components/dashboard/PortfolioTracker'
import AlertHistory from '../components/dashboard/AlertHistory'
import PriceAlertForm from '../components/PriceAlertForm'
import ThemeToggle from '../components/ThemeToggle'

const Dashboard = () => {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                await signOut()
                navigate('/login')
            } catch (error) {
                console.error('Logout error:', error)
                alert('Failed to logout. Please try again.')
            }
        }
    }

    return (
        <div className="min-h-screen">
            {/* Navigation Header */}
            <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold text-gold-500 hover:text-gold-400 transition-colors">
                            🏆 VinaGold AI
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                                Home
                            </Link>

                            <Link to="/dashboard" className="text-gold-400 font-medium">
                                Dashboard
                            </Link>

                            {/* User Display & Logout */}
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/settings"
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                    title="Settings"
                                >
                                    ⚙️
                                </Link>
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                                        {(profile?.display_name || user?.email)?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm hidden md:block">
                                        {profile?.display_name || user?.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="p-4 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        <span className="text-white">Welcome back, </span>
                        <span className="text-gold-500">{profile?.display_name || 'User'}!</span>
                    </h1>
                    <p className="text-gray-400">
                        Manage your gold portfolio and price alerts
                    </p>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Features */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Watchlist */}
                        <Watchlist />

                        {/* Portfolio Tracker */}
                        <PortfolioTracker />

                        {/* Alert History */}
                        <AlertHistory />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* User Profile */}
                        <UserProfile />

                        {/* Price Alert Form */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">
                                🔔 Create Price Alert
                            </h3>
                            <PriceAlertForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
