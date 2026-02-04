import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const PriceAlertForm = () => {
    const { user } = useAuth()
    const [targetPrice, setTargetPrice] = useState('')
    const [notifyEmail, setNotifyEmail] = useState(true)
    const [notifyBrowser, setNotifyBrowser] = useState(false)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [alerts, setAlerts] = useState([])

    useEffect(() => {
        if (user) {
            fetchAlerts()
        }
    }, [user])

    const fetchAlerts = async () => {
        try {
            const { data, error } = await supabase
                .from('user_alerts')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_triggered', false)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAlerts(data || [])
        } catch (err) {
            console.error('Error fetching alerts:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (!user) {
            setError('Please log in to create alerts')
            setLoading(false)
            return
        }

        if (!targetPrice) {
            setError('Please enter a target price')
            setLoading(false)
            return
        }

        const price = parseFloat(targetPrice)
        if (isNaN(price) || price <= 0) {
            setError('Please enter a valid price')
            setLoading(false)
            return
        }

        try {
            // Create alert
            const { error: insertError } = await supabase
                .from('user_alerts')
                .insert([{
                    user_id: user.id,
                    email: user.email,
                    target_price: price,
                    notify_email: notifyEmail,
                    notify_browser: notifyBrowser
                }])

            if (insertError) throw insertError

            setSuccess(true)
            setTargetPrice('')

            // Refresh alerts list
            fetchAlerts()

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message || 'Failed to create alert')
        } finally {
            setLoading(false)
        }
    }

    const deleteAlert = async (id) => {
        try {
            const { error } = await supabase
                .from('user_alerts')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchAlerts()
        } catch (err) {
            console.error('Error deleting alert:', err)
            alert('Failed to delete alert')
        }
    }

    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="glass-card p-6 text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Please log in to create price alerts
                </p>
                <Link to="/login" className="btn-primary inline-block text-sm">
                    Log In
                </Link>
            </div>
        )
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Price Alerts</h2>
                    <p className="text-sm text-gray-400">Get notified when price reaches your target</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Price Input */}
                <div>
                    <label htmlFor="target-price" className="block text-sm font-medium text-gray-300 mb-2">
                        Target Price (₫)
                    </label>
                    <input
                        type="number"
                        id="target-price"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="85000000"
                        step="1000"
                        min="0"
                        className="input-field w-full"
                        disabled={loading}
                    />
                </div>

                {/* Notification Preferences */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notification Method
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-slate-700 text-gold-500 focus:ring-gold-500"
                            />
                            <span className="text-sm text-gray-300">📧 Email ({user.email})</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyBrowser}
                                onChange={(e) => setNotifyBrowser(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-slate-700 text-gold-500 focus:ring-gold-500"
                            />
                            <span className="text-sm text-gray-300">🔔 Browser Notification</span>
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-sm text-red-400">❌ {error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 animate-pulse">
                        <p className="text-sm text-green-400">✅ Alert created successfully!</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || (!notifyEmail && !notifyBrowser)}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            Creating Alert...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>🔔</span>
                            Create Alert
                        </span>
                    )}
                </button>
            </form>

            {/* Active Alerts List */}
            {alerts.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Alerts ({alerts.length})</h3>
                    <div className="space-y-2">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"
                            >
                                <div>
                                    <p className="text-white font-medium">
                                        {parseFloat(alert.target_price).toLocaleString('vi-VN')}₫
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(alert.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-gray-400">
                    💡 <span className="font-semibold text-blue-400">How it works:</span> You'll receive a
                    notification when the gold price reaches or exceeds your target price. Make sure to check your
                    inbox and spam folder.
                </p>
            </div>
        </div>
    )
}

export default PriceAlertForm
