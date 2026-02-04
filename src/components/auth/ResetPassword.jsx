import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { updatePassword } = useAuth()
    const navigate = useNavigate()

    const validatePassword = (pass) => {
        if (pass.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(pass)) return 'Must contain uppercase letter'
        if (!/[a-z]/.test(pass)) return 'Must contain lowercase letter'
        if (!/[0-9]/.test(pass)) return 'Must contain a number'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!password || !confirmPassword) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        const validationError = validatePassword(password)
        if (validationError) {
            setError(validationError)
            setLoading(false)
            return
        }

        const { error } = await updatePassword(password)

        if (error) {
            setError(error.message || 'Failed to update password')
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-400 mb-4">
                        Password Updated!
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Your password has been successfully reset.
                    </p>
                    <p className="text-sm text-gray-400">
                        Redirecting to login...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gold-500 mb-2">
                        Set New Password 🔐
                    </h1>
                    <p className="text-gray-400">
                        Choose a strong password for your account
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Updating...
                            </span>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
