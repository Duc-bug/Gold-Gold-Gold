import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const UserProfile = () => {
    const { user, profile, updateProfile, signOut } = useAuth()
    const [displayName, setDisplayName] = useState(profile?.display_name || '')
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        setLoading(true)
        setError('')
        setSuccess(false)

        const { error } = await updateProfile({ display_name: displayName })

        if (error) {
            setError(error.message || 'Failed to update profile')
        } else {
            setSuccess(true)
            setEditing(false)
            setTimeout(() => setSuccess(false), 3000)
        }

        setLoading(false)
    }

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>👤</span>
                My Profile
            </h2>

            {/* Success Message */}
            {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-green-400 text-sm">✅ Profile updated successfully!</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Profile Info */}
            <div className="space-y-6">
                {/* Email (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email
                    </label>
                    <div className="bg-slate-800/50 px-4 py-3 rounded-lg text-white">
                        {user?.email}
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Display Name
                    </label>
                    {editing ? (
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="input-field w-full"
                            placeholder="Your name"
                        />
                    ) : (
                        <div className="bg-slate-800/50 px-4 py-3 rounded-lg text-white">
                            {profile?.display_name || 'Not set'}
                        </div>
                    )}
                </div>

                {/* Account Created */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Member Since
                    </label>
                    <div className="bg-slate-800/50 px-4 py-3 rounded-lg text-white">
                        {new Date(user?.created_at).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false)
                                    setDisplayName(profile?.display_name || '')
                                }}
                                disabled={loading}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="btn-primary flex-1"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Logout Button */}
                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-medium"
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
