import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const Watchlist = () => {
    const { user } = useAuth()
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newBrand, setNewBrand] = useState('')

    const availableBrands = ['SJC', 'PNJ', 'DOJI', 'BERJAYA', 'SILVER (W)']

    useEffect(() => {
        if (user) {
            fetchWatchlist()
        }
    }, [user])

    const fetchWatchlist = async () => {
        try {
            const { data, error } = await supabase
                .from('user_watchlist')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            if (error) throw error
            setWatchlist(data || [])
        } catch (error) {
            console.error('Error fetching watchlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToWatchlist = async () => {
        if (!newBrand) return

        try {
            const { error } = await supabase
                .from('user_watchlist')
                .insert([{ user_id: user.id, brand: newBrand }])

            if (error) throw error

            setNewBrand('')
            setAdding(false)
            fetchWatchlist()
        } catch (error) {
            console.error('Error adding to watchlist:', error)
            alert(error.message)
        }
    }

    const removeFromWatchlist = async (id) => {
        try {
            const { error } = await supabase
                .from('user_watchlist')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchWatchlist()
        } catch (error) {
            console.error('Error removing from watchlist:', error)
        }
    }

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>⭐</span>
                    My Watchlist
                </h2>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="text-sm px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-900 rounded-lg font-medium transition-colors"
                    >
                        + Add Brand
                    </button>
                )}
            </div>

            {/* Add Brand Form */}
            {adding && (
                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex gap-2">
                        <select
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            className="input-field flex-1"
                        >
                            <option value="">Select a brand...</option>
                            {availableBrands
                                .filter(brand => !watchlist.find(w => w.brand === brand))
                                .map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))
                            }
                        </select>
                        <button
                            onClick={addToWatchlist}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setAdding(false)
                                setNewBrand('')
                            }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Watchlist Items */}
            {watchlist.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">📋 No brands in your watchlist yet</p>
                    <button
                        onClick={() => setAdding(true)}
                        className="text-gold-400 hover:text-gold-300"
                    >
                        Add your first brand →
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {watchlist.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-full"
                        >
                            <span className="text-gold-400 font-medium">{item.brand}</span>
                            <button
                                onClick={() => removeFromWatchlist(item.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Watchlist
