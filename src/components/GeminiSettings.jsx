import React, { useState, useEffect } from 'react'
import { getGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey } from '../services/geminiService'

const GeminiSettings = () => {
    const [apiKey, setApiKey] = useState('')
    const [isConfigured, setIsConfigured] = useState(false)
    const [showKey, setShowKey] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const savedKey = getGeminiApiKey()
        if (savedKey) {
            setApiKey(savedKey)
            setIsConfigured(true)
        }
    }, [])

    const handleSave = () => {
        if (saveGeminiApiKey(apiKey)) {
            setIsConfigured(true)
            setMessage('✅ API Key saved successfully!')
            setTimeout(() => setMessage(''), 3000)
        } else {
            setMessage('❌ Please enter a valid API key')
            setTimeout(() => setMessage(''), 3000)
        }
    }

    const handleRemove = () => {
        if (window.confirm('Remove Gemini API key?')) {
            removeGeminiApiKey()
            setApiKey('')
            setIsConfigured(false)
            setMessage('🗑️ API Key removed')
            setTimeout(() => setMessage(''), 3000)
        }
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, Inter, sans-serif' }}>
                        🤖 Gemini AI Settings
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Configure Gemini Pro for AI price analysis
                    </p>
                </div>
                {isConfigured && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-lg text-xs font-semibold">
                        ✓ Configured
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* API Key Input */}
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Gemini API Key
                    </label>
                    <div className="flex gap-2">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            className="input-field flex-1"
                        />
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Get your API key from{' '}
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-500 hover:underline font-semibold"
                        >
                            Google AI Studio
                        </a>
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{message}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="btn-primary flex-1"
                        disabled={!apiKey}
                    >
                        💾 Save API Key
                    </button>
                    {isConfigured && (
                        <button
                            onClick={handleRemove}
                            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                        >
                            🗑️ Remove
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        💡 How to get Gemini API Key:
                    </h4>
                    <ol className="text-sm space-y-1" style={{ color: 'var(--text-tertiary)' }}>
                        <li>1. Visit <strong>aistudio.google.com/app/apikey</strong></li>
                        <li>2. Sign in with your Google account</li>
                        <li>3. Click "Create API Key"</li>
                        <li>4. Copy and paste here</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}

export default GeminiSettings
