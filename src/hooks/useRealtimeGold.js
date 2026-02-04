import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to subscribe to real-time gold price updates from Supabase
 * Listens for INSERT events on the 'gold_prices' table
 * 
 * @param {String} region - Filter by region: 'vietnam', 'global', or 'all' (default)
 * @returns {Object} - { data: Array, loading: Boolean, error: String|null }
 */
export const useRealtimeGold = (region = 'all') => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Initial fetch of historical data
        const fetchInitialData = async () => {
            try {
                setLoading(true)

                // Build query with optional region filter
                let query = supabase
                    .from('gold_prices')
                    .select('*')
                    .order('updated_at', { ascending: true })
                    .limit(50) // Get last 50 records for trend analysis

                // Filter by region if specified
                if (region && region !== 'all') {
                    query = query.eq('region', region)
                }

                const queryPromise = query

                // Create a timeout promise that resolves to null instead of rejecting
                const timeoutPromise = new Promise((resolve) =>
                    setTimeout(() => {
                        console.warn('⚠️ Data fetch timed out - using offline/cached mode')
                        resolve({ data: null, error: null })
                    }, 5000) // Reduced to 5s
                )

                const result = await Promise.race([
                    queryPromise.then(res => ({ ...res, isReal: true })),
                    timeoutPromise
                ])

                const { data: goldPrices, error: fetchError } = result

                if (fetchError) throw fetchError

                // If goldPrices is null (timeout), we just start with empty data
                // The user can trigger Manual Update
                setData(goldPrices || [])
                setError(null)
            } catch (err) {
                if (err.name === 'AbortError' || err.message.includes('aborted')) {
                    console.log('Fetch aborted')
                } else {
                    console.warn('⚠️ Error fetching initial prices (Offline/Guest mode active):', err.message)
                    // Do NOT set global error to avoid blocking UI with red banner
                    // setError(err.message) 
                }
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()

        // Set up real-time subscription
        console.log(`🔔 Setting up real-time subscription for region: ${region}`)

        const channel = supabase
            .channel(`gold_prices_${region}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'gold_prices'
                },
                (payload) => {
                    console.log('🆕 New gold price received:', payload.new)

                    // Only add if matches region filter
                    if (region === 'all' || payload.new.region === region) {
                        // Add the new record to the data array
                        setData((prevData) => {
                            // Keep only the last 50 records for performance
                            const newData = [...prevData, payload.new]
                            if (newData.length > 50) {
                                return newData.slice(-50)
                            }
                            return newData
                        })

                        // Optional: Show notification or play sound
                        if ('Notification' in window && Notification.permission === 'granted') {
                            const regionEmoji = payload.new.region === 'vietnam' ? '🇻🇳' : '🌍'
                            new Notification(`${regionEmoji} Gold Price Update!`, {
                                body: `${payload.new.brand}: ${payload.new.buy_price} ${payload.new.currency}`,
                                icon: '/vite.svg'
                            })
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status)
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('🔕 Cleaning up real-time subscription...')
            supabase.removeChannel(channel)
        }
    }, [region]) // Re-subscribe when region changes

    return { data, loading, error, setData }
}

/**
 * Hook to fetch all gold price records (not real-time)
 * Useful for historical analysis
 */
export const useGoldPrices = (limit = 50, region = 'all') => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                let query = supabase
                    .from('gold_prices')
                    .select('*')
                    .order('updated_at', { ascending: true })
                    .limit(limit)

                if (region && region !== 'all') {
                    query = query.eq('region', region)
                }

                const { data: goldPrices, error: fetchError } = await query

                if (fetchError) throw fetchError
                setData(goldPrices || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [limit, region])

    return { data, loading, error }
}

/**
 * Hook to save user price alerts
 */
export const useCreateAlert = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const createAlert = async (email, targetPrice, region = 'all') => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: insertError } = await supabase
                .from('user_alerts')
                .insert([
                    {
                        email,
                        target_price: targetPrice,
                        region: region,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()

            if (insertError) throw insertError

            return { success: true, data }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    return { createAlert, loading, error }
}
