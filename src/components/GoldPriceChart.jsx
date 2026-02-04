import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts'


const GoldPriceChart = ({ data, metalType = 'gold', currency = 'USD' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="shimmer-bg w-16 h-16 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Waiting for gold price data...</p>
                </div>
            </div>
        )
    }

    // Filter data based on metal type
    let filteredData = []
    if (metalType === 'silver') {
        filteredData = data.filter(d => d.brand === 'SILVER' || d.brand === 'SILVER (W)')
    } else {
        // Gold (default)
        filteredData = data.filter(d => d.brand !== 'SILVER' && d.brand !== 'SILVER (W)')
    }

    // Prepare chart data - ONLY REAL PRICES
    const chartData = filteredData.map(item => ({
        time: new Date(item.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        updated_at: item.updated_at,
        buyPrice: parseFloat(item.buy_price),
        sellPrice: parseFloat(item.sell_price),
        brand: item.brand
    }))

    // Custom tooltip - ONLY REAL PRICES
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload

            return (
                <div className="glass-card p-4 border-gold-500">
                    <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>{label}</p>

                    {/* Buy Price */}
                    {data.buyPrice && (
                        <div className="mb-2">
                            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                💰 Buy Price
                            </p>
                            <p className="text-lg font-bold" style={{ color: 'var(--accent-red)' }}>
                                {currency === 'VND'
                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.buyPrice)
                                    : `$${data.buyPrice}`}
                            </p>
                        </div>
                    )}

                    {/* Sell Price */}
                    {data.sellPrice && (
                        <div>
                            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                <span className={`w-2 h-2 rounded-full ${metalType === 'silver' ? 'bg-slate-400' : 'bg-green-500'}`}></span>
                                🏷️ Sell Price
                            </p>
                            <p className={`text-lg font-bold`} style={{ color: metalType === 'silver' ? '#94a3b8' : 'var(--accent-green)' }}>
                                {currency === 'VND'
                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.sellPrice)
                                    : `$${data.sellPrice}`}
                            </p>
                        </div>
                    )}
                </div>
            )
        }
        return null
    }


    return (
        <div className="glass-card p-6">
            {/* Header - SIMPLIFIED */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, Inter, sans-serif' }}>
                        {metalType === 'silver' ? '📊 Silver Price History' : '📊 Gold Price History'}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Real-time price tracking
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Buy Price</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${metalType === 'silver' ? 'bg-slate-400' : 'bg-green-500'}`}></div>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sell Price</span>
                    </div>
                </div>
            </div>

            {/* Chart - ONLY REAL PRICES */}
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metalType === 'silver' ? '#94a3b8' : '#22c55e'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metalType === 'silver' ? '#94a3b8' : '#22c55e'} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />

                    {/* Main Y Axis */}
                    <YAxis
                        stroke="#64748b"
                        orientation="left"
                        style={{ fontSize: '12px' }}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`
                            return value
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Buy Price Area */}
                    <Area
                        name="Buy Price"
                        type="monotone"
                        dataKey="buyPrice"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#colorBuy)"
                        connectNulls
                    />

                    {/* Sell Price Area */}
                    <Area
                        name="Sell Price"
                        type="monotone"
                        dataKey="sellPrice"
                        stroke={metalType === 'silver' ? '#94a3b8' : '#22c55e'}
                        strokeWidth={3}
                        fill="url(#colorSell)"
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}

export default GoldPriceChart
