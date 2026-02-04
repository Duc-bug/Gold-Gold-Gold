import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const validatePassword = (pass) => {
        if (pass.length < 8) {
            return 'Password must be at least 8 characters'
        }
        if (!/[A-Z]/.test(pass)) {
            return 'Password must contain at least one uppercase letter'
        }
        if (!/[a-z]/.test(pass)) {
            return 'Password must contain at least one lowercase letter'
        }
        if (!/[0-9]/.test(pass)) {
            return 'Password must contain at least one number'
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            setLoading(false)
            return
        }

        const { error } = await signUp(
            email,
            password,
            displayName || email.split('@')[0]
        )

        if (error) {
            setError(error.message || 'Failed to create account')
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4 font-display">
                        Account Created!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please check your email to verify your account.
                    </p>
                    <p className="text-sm text-gray-500">
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
                    <h1 className="text-3xl font-bold text-gold-500 mb-2 font-display">
                        Join VinaGold AI 🚀
                    </h1>
                    <p className="text-gray-600">
                        Create your account to start tracking gold prices
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Display Name (Optional) */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-navy-700 mb-2">
                            Display Name <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="input-field w-full"
                            placeholder="John Doe"
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field w-full"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full shadow-gold"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Already have an account?
                        </span>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-gold-600 hover:text-gold-700 font-bold transition-colors"
                    >
                        Sign in instead →
                    </Link>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Signup
