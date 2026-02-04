import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const Settings = () => {
    const { user, profile } = useAuth()
    const { theme, setTheme } = useTheme()

    const [preferences, setPreferences] = useState({
        theme: 'dark',
        currency: 'VND',
        email_notifications: true,
        push_notifications: true,
        alert_sound: true
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load user preferences
    useEffect(() => {
        loadPreferences()
    }, [user])

    const loadPreferences = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setPreferences(data)
                setTheme(data.theme || 'dark')
            }
        } catch (error) {
            console.error('Error loading preferences:', error)
        } finally {
            setLoading(false)
        }
    }

    const savePreferences = async () => {
        if (!user) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            // Update theme immediately
            setTheme(preferences.theme)

            toast.success('✅ Settings saved successfully!')
        } catch (error) {
            console.error('Error saving preferences:', error)
            toast.error(`❌ Failed to save settings: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        to="/dashboard"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    <span className="text-white">Settings</span>
                </h1>
                <p className="text-gray-400">
                    Manage your preferences and notifications
                </p>
            </div>

            {/* Settings Form */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Appearance Section */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        🎨 Appearance
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Theme
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleChange('theme', 'dark')}
                                    className={`p-4 rounded-lg border-2 transition-all ${preferences.theme === 'dark'
                                            ? 'border-gold-500 bg-gold-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🌙</div>
                                    <div className="font-medium">Dark Mode</div>
                                    <div className="text-xs text-gray-400">Easy on the eyes</div>
                                </button>

                                <button
                                    onClick={() => handleChange('theme', 'light')}
                                    className={`p-4 rounded-lg border-2 transition-all ${preferences.theme === 'light'
                                            ? 'border-gold-500 bg-gold-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">☀️</div>
                                    <div className="font-medium">Light Mode</div>
                                    <div className="text-xs text-gray-400">Bright and clear</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Currency
                            </label>
                            <select
                                value={preferences.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="VND">🇻🇳 Vietnamese Dong (VND)</option>
                                <option value="USD">🇺🇸 US Dollar (USD)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        🔔 Notifications
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                                <div className="font-medium text-white">Email Notifications</div>
                                <div className="text-sm text-gray-400">Receive price alerts via email</div>
                            </div>
                            <button
                                onClick={() => handleChange('email_notifications', !preferences.email_notifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_notifications ? 'bg-gold-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                                <div className="font-medium text-white">Push Notifications</div>
                                <div className="text-sm text-gray-400">Browser notifications for alerts</div>
                            </div>
                            <button
                                onClick={() => handleChange('push_notifications', !preferences.push_notifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.push_notifications ? 'bg-gold-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                                <div className="font-medium text-white">Alert Sound</div>
                                <div className="text-sm text-gray-400">Play sound when alerts trigger</div>
                            </div>
                            <button
                                onClick={() => handleChange('alert_sound', !preferences.alert_sound)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.alert_sound ? 'bg-gold-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.alert_sound ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={savePreferences}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Saving...
                            </span>
                        ) : (
                            '💾 Save Settings'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings
