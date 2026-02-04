import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtimeGold } from '../../hooks/useRealtimeGold'

const PortfolioTracker = () => {
    const { user, profile } = useAuth()
    const { data: priceData } = useRealtimeGold()
    const [portfolio, setPortfolio] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [formData, setFormData] = useState({
        brand: '',
        quantity: '',
        purchase_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    useEffect(() => {
        if (user) {
            fetchPortfolio()
        }
    }, [user])

    const fetchPortfolio = async () => {
        try {
            const { data, error } = await supabase
                .from('user_portfolio')
                .select('*')
                .eq('user_id', user.id)
                .order('purchase_date', { ascending: false })

            if (error) throw error
            setPortfolio(data || [])
        } catch (error) {
            console.error('Error fetching portfolio:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentPrice = (brand) => {
        if (!priceData || priceData.length === 0) return 0

        const latestForBrand = priceData
            .filter(d => d.brand === brand)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]

        return latestForBrand ? parseFloat(latestForBrand.buy_price) : 0
    }

    const calculateProfitLoss = (item) => {
        const currentPrice = getCurrentPrice(item.brand)
        const purchasePrice = parseFloat(item.purchase_price)
        const quantity = parseFloat(item.quantity)

        const currentValue = currentPrice * quantity
        const purchaseValue = purchasePrice * quantity
        const profit = currentValue - purchaseValue
        const percentage = purchaseValue > 0 ? ((profit / purchaseValue) * 100) : 0

        return { profit, percentage, currentValue, currentPrice }
    }

    const getTotalStats = () => {
        let totalCurrent = 0
        let totalPurchase = 0

        portfolio.forEach(item => {
            const { currentValue } = calculateProfitLoss(item)
            const purchaseValue = parseFloat(item.purchase_price) * parseFloat(item.quantity)
            totalCurrent += currentValue
            totalPurchase += purchaseValue
        })

        const totalProfit = totalCurrent - totalPurchase
        const totalPercentage = totalPurchase > 0 ? ((totalProfit / totalPurchase) * 100) : 0

        return { totalCurrent, totalProfit, totalPercentage }
    }

    const handleSubmit = async () => {
        if (!formData.brand || !formData.quantity || !formData.purchase_price) {
            alert('Please fill in required fields')
            return
        }

        try {
            const { error } = await supabase
                .from('user_portfolio')
                .insert([{
                    user_id: user.id,
                    ...formData,
                    quantity: parseFloat(formData.quantity),
                    purchase_price: parseFloat(formData.purchase_price)
                }])

            if (error) throw error

            setFormData({
                brand: '',
                quantity: '',
                purchase_price: '',
                purchase_date: new Date().toISOString().split('T')[0],
                notes: ''
            })
            setAdding(false)
            fetchPortfolio()
        } catch (error) {
            console.error('Error adding to portfolio:', error)
            alert(error.message)
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const { error } = await supabase
                .from('user_portfolio')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchPortfolio()
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    const formatCurrency = (value) => {
        return value.toLocaleString('vi-VN') + '₫'
    }

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                </div>
            </div>
        )
    }

    const stats = getTotalStats()

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>💼</span>
                    My Portfolio
                </h2>
                <div className="flex items-center gap-2">
                    {!adding && (
                        <button
                            onClick={() => setAdding(true)}
                            className="text-sm px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-medium transition-colors"
                        >
                            + Add Holding
                        </button>
                    )}
                </div>
            </div>

            {/* Portfolio Summary */}
            {portfolio.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Total Value</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCurrent)}</p>
                    </div>
                    <div className={`bg-slate-800/50 p-4 rounded-lg`}>
                        <p className="text-gray-400 text-sm mb-1">Total Profit/Loss</p>
                        <p className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Return</p>
                        <p className={`text-xl font-bold ${stats.totalPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.totalPercentage >= 0 ? '+' : ''}{stats.totalPercentage.toFixed(2)}%
                        </p>
                    </div>
                </div>
            )}

            {/* Add Form */}
            {adding && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Brand *</label>
                            <select
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="input-field w-full"
                            >
                                <option value="">Select...</option>
                                <option value="SJC">SJC</option>
                                <option value="PNJ">PNJ</option>
                                <option value="DOJI">DOJI</option>
                                <option value="BERJAYA">BERJAYA</option>
                                <option value="SILVER (W)">SILVER (W)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Quantity (lượng) *</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="input-field w-full"
                                placeholder="1.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Purchase Price (VND) *</label>
                            <input
                                type="number"
                                value={formData.purchase_price}
                                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                className="input-field w-full"
                                placeholder="85000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Purchase Date *</label>
                            <input
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                className="input-field w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notes</label>
                        <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field w-full"
                            placeholder="Optional notes..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSubmit} className="btn-primary">
                            Add to Portfolio
                        </button>
                        <button
                            onClick={() => setAdding(false)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Portfolio Table */}
            {portfolio.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">📊 No holdings yet</p>
                    <button
                        onClick={() => setAdding(true)}
                        className="text-gold-400 hover:text-gold-300"
                    >
                        Add your first holding →
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 text-gray-400 text-sm">Brand</th>
                                <th className="text-right py-3 px-2 text-gray-400 text-sm">Qty</th>
                                <th className="text-right py-3 px-2 text-gray-400 text-sm">Buy Price</th>
                                <th className="text-right py-3 px-2 text-gray-400 text-sm">Current</th>
                                <th className="text-right py-3 px-2 text-gray-400 text-sm">P/L</th>
                                <th className="text-right py-3 px-2 text-gray-400 text-sm"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map((item) => {
                                const { profit, percentage, currentPrice } = calculateProfitLoss(item)
                                return (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-2 text-white font-medium">{item.brand}</td>
                                        <td className="py-3 px-2 text-right text-gray-300">{item.quantity}</td>
                                        <td className="py-3 px-2 text-right text-gray-300">
                                            {formatCurrency(parseFloat(item.purchase_price))}
                                        </td>
                                        <td className="py-3 px-2 text-right text-gray-300">
                                            {formatCurrency(currentPrice)}
                                        </td>
                                        <td className={`py-3 px-2 text-right font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {profit >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default PortfolioTracker
