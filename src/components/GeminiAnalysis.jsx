import React, { useState, useEffect } from 'react'
import { analyzeGoldPriceWithGemini } from '../services/geminiService'

const GeminiAnalysis = ({ data, metalType = 'gold' }) => {
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const runAnalysis = async () => {
        if (!data || data.length < 5) {
            setError('Need at least 5 data points for analysis')
            return
        }

        setLoading(true)
        setError(null)

        const result = await analyzeGoldPriceWithGemini(data)

        setLoading(false)

        if (result.success) {
            setAnalysis(result)
        } else {
            setError(result.error || 'Analysis failed')
        }
    }

    // Auto-run on mount if has data
    useEffect(() => {
        if (data && data.length >= 5) {
            runAnalysis()
        }
    }, [data?.length])

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return '📈'
            case 'down': return '📉'
            case 'stable': return '➡️'
            default: return '❓'
        }
    }

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return 'var(--accent-green)'
            case 'down': return 'var(--accent-red)'
            default: return 'var(--text-tertiary)'
        }
    }

    const getRiskBadge = (level) => {
        const colors = {
            low: { bg: '#10b98120', text: '#10b981', label: 'Low Risk' },
            medium: { bg: '#f9731620', text: '#f97316', label: 'Medium Risk' },
            high: { bg: '#ef444420', text: '#ef4444', label: 'High Risk' }
        }
        const config = colors[level] || colors.medium
        return (
            <span
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: config.bg, color: config.text }}
            >
                {config.label}
            </span>
        )
    }

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, Inter, sans-serif' }}>
                        <span>🤖</span>
                        <span>Gemini AI Analysis</span>
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Powered by Google Gemini 2.5 Flash
                    </p>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="btn-primary text-sm"
                >
                    {loading ? '⏳ Analyzing...' : '🔄 Analyze'}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin text-4xl mb-2">🤖</div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Gemini AI is analyzing...
                    </p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-semibold text-red-700">
                        ❌ {error}
                    </p>
                </div>
            )}

            {/* Analysis Result */}
            {analysis && !loading && (
                <div className="space-y-4">
                    {/* Trend & Confidence */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Trend</p>
                            <p className="text-2xl font-bold" style={{ color: getTrendColor(analysis.trend) }}>
                                {getTrendIcon(analysis.trend)} {analysis.trend.toUpperCase()}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Confidence</p>
                            <p className="text-2xl font-bold text-gold">
                                {analysis.confidence}%
                            </p>
                        </div>
                    </div>

                    {/* Prediction */}
                    {analysis.prediction && (
                        <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--gold-500), var(--gold-400))', color: 'var(--navy-900)' }}>
                            <p className="text-xs font-semibold mb-1 opacity-80">🔮 PREDICTION</p>
                            <p className="font-semibold">{analysis.prediction}</p>
                        </div>
                    )}

                    {/* Analysis */}
                    {analysis.analysis && (
                        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>📊 ANALYSIS</p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {analysis.analysis}
                            </p>
                        </div>
                    )}

                    {/* Key Insights */}
                    {analysis.key_insights && analysis.key_insights.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>💡 KEY INSIGHTS</p>
                            <div className="space-y-2">
                                {analysis.key_insights.map((insight, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg flex items-start gap-2"
                                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                                    >
                                        <span className="text-gold-500 font-bold">{idx + 1}.</span>
                                        <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendation */}
                    {analysis.recommendation && (
                        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--gold-500)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>💼 RECOMMENDATION</p>
                                {analysis.risk_level && getRiskBadge(analysis.risk_level)}
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {analysis.recommendation}
                            </p>
                        </div>
                    )}

                    {/* Timestamp */}
                    {analysis.timestamp && (
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                            Last analyzed: {new Date(analysis.timestamp).toLocaleString('vi-VN')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default GeminiAnalysis
