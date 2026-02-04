import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        checkUser()

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user ?? null
                setUser(currentUser)

                if (currentUser) {
                    // Fetch user profile
                    await fetchProfile(currentUser.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            authListener?.subscription?.unsubscribe()
        }
    }, [])

    const checkUser = async () => {
        try {
            console.log('🔍 Checking session...')

            // Create a timeout promise
            const timeoutPromise = new Promise((resolve) =>
                setTimeout(() => {
                    console.warn('⚠️ Session check timed out - defaulting to guest mode')
                    resolve({ data: { session: null } })
                }, 5000) // Reduced to 5s for faster UI response
            )

            // Race the session check against the timeout
            const { data: { session } } = await Promise.race([
                supabase.auth.getSession(),
                timeoutPromise
            ])

            const currentUser = session?.user ?? null
            console.log('👤 CheckUser found:', currentUser?.email || 'No user')
            setUser(currentUser)

            if (currentUser) {
                await fetchProfile(currentUser.id)
            }
        } catch (error) {
            console.error('❌ Error checking user:', error)
            // If timeout or error, we assume no user to unblock the UI
            setUser(null)
        } finally {
            console.log('✅ Auth check complete, setLoading(false)')
            setLoading(false)
        }
    }

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const signUp = async (email, password, displayName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName
                    }
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signIn = async (email, password) => {
        try {
            // Create a timeout promise (reduced to 8 seconds for better UX)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your internet.')), 8000)
            )

            const { data, error } = await Promise.race([
                supabase.auth.signInWithPassword({
                    email,
                    password
                }),
                timeoutPromise
            ])

            if (error) throw error

            // OPTIMISTIC UPDATE: Set user immediately to avoid waiting for the listener
            // This fixes the "stuck loading" feeling
            if (data?.session?.user) {
                setUser(data.session.user)
                // Fetch profile in background, don't await blocking
                fetchProfile(data.session.user.id)
            }

            return { data, error: null }
        } catch (error) {
            console.error('Login error:', error)
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            // OPTIMISTIC UPDATE: Clear state immediately for instant feedback
            setUser(null)
            setProfile(null)

            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Error signing out:', error)
            // Even if server error, we keep local cleared
        }
    }

    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    const updatePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    const updateProfile = async (updates) => {
        try {
            if (!user) throw new Error('No user logged in')

            const { error } = await supabase
                .from('user_profiles')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', user.id)

            if (error) throw error

            // Refresh profile
            await fetchProfile(user.id)
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
