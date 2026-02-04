import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const AlertHistory = () => {
    const { user, profile } = useAuth()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', '7days', '30days'

    useEffect(() => {
        if (user) {
            fetchHistory()
        }
    }, [user, filter])

    const fetchHistory = async () => {
        try {
            let query = supabase
                .from('alert_history')
                .select('*')
                .eq('user_id', user.id)
                .order('triggered_at', { ascending: false })

            // Apply date filter
            if (filter === '7days') {
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                query = query.gte('triggered_at', sevenDaysAgo.toISOString())
            } else if (filter === '30days') {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                query = query.gte('triggered_at', thirtyDaysAgo.toISOString())
            }

            const { data, error } = await query

            if (error) throw error
            setHistory(data || [])
        } catch (error) {
            console.error('Error fetching alert history:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => {
        return parseFloat(value).toLocaleString('vi-VN') + '₫'
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) {
            return `${diffMins} minutes ago`
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`
        } else if (diffDays < 7) {
            return `${diffDays} days ago`
        } else {
            return date.toLocaleDateString('vi-VN')
        }
    }

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-16 bg-slate-700 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>📜</span>
                    Alert History
                </h2>

                <div className="flex items-center gap-2">
                    {/* Filter Dropdown */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field text-sm !py-2"
                    >
                        <option value="all">All Time</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* History List */}
            {history.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400">📋 No triggered alerts yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Create a price alert to get started
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-slate-800/50 p-4 rounded-lg hover:bg-slate-800/70 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-green-400 font-bold">✅</span>
                                        <span className="font-bold text-white">{alert.brand}</span>
                                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                            Triggered
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-300 space-y-1">
                                        <p>
                                            <span className="text-gray-400">Target:</span>{' '}
                                            {formatCurrency(alert.target_price)}
                                        </p>
                                        <p>
                                            <span className="text-gray-400">Actual:</span>{' '}
                                            <span className="text-green-400 font-medium">
                                                {formatCurrency(alert.actual_price)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {formatDate(alert.triggered_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AlertHistory
