import React, { createContext, useContext, useEffect, useCallback } from 'react'
import { useRealtimeGold } from '../hooks/useRealtimeGold'
import { supabase } from '../lib/supabase'

const GoldContext = createContext(null)

export const useGold = () => {
    return useContext(GoldContext)
}

export const GoldProvider = ({ children }) => {
    const { data, loading, error, setData } = useRealtimeGold()

    const handleManualUpdate = useCallback(async (isAuto = false) => {
        if (!isAuto) {
            console.log('🔄 Đang lấy giá vàng thật từ VNAppMob API...')
        }

        try {
            const VNAPPMOB_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzE0MTI2ODcsImlhdCI6MTc3MDExNjY4Nywic2NvcGUiOiJnb2xkIiwicGVybWlzc2lvbiI6MH0.3Cpq7L6Fv_lgN1HQ6eBEjZudCOhh40hISrvCkK4ADHg'
            const newRecords = [] // Store all new records

            // Lấy SJC
            try {
                // console.log('📡 Fetching SJC...')
                const res = await fetch('https://api.vnappmob.com/api/v2/gold/sjc', {
                    headers: { 'Authorization': `Bearer ${VNAPPMOB_API_KEY}`, 'Content-Type': 'application/json' }
                })
                if (res.ok) {
                    const data = await res.json()
                    // console.log('✅ SJC:', data)
                    if (data.results?.[0]) {
                        newRecords.push({
                            brand: 'SJC',
                            buy_price: parseFloat(data.results[0].buy_1l) || 0,
                            sell_price: parseFloat(data.results[0].sell_1l) || 0,
                            metal_type: 'gold',
                            currency: 'VND',
                            updated_at: new Date().toISOString()
                        })
                    }
                }
            } catch (err) { console.warn('⚠️ SJC:', err.message) }

            // Lấy giá Bạc (SILVER) thật từ quốc tế (GoldPrice.org)
            try {
                // console.log('📡 Fetching Real Silver Price...')
                const targetUrl = 'https://data-asg.goldprice.org/dbXRates/USD'
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}&timestamp=${new Date().getTime()}`

                const res = await fetch(proxyUrl)

                if (res.ok) {
                    const data = await res.json()
                    if (data.items && data.items.length > 0) {
                        const priceUSD = data.items[0].xagPrice
                        const exchangeRate = 25480
                        const priceVNDPerTael = (priceUSD * exchangeRate) / 0.829426

                        newRecords.push({
                            brand: 'SILVER (W)',
                            buy_price: parseFloat(priceVNDPerTael.toFixed(0)),
                            sell_price: parseFloat((priceVNDPerTael + 50000).toFixed(0)),
                            metal_type: 'silver',
                            currency: 'VND',
                            updated_at: new Date().toISOString()
                        })
                    }
                }
            } catch (err) {
                // Silver API often fails with CORS, suppress warning in auto mode
                if (!isAuto) console.warn('⚠️ SILVER API:', err.message)
            }

            // Lấy PNJ
            try {
                // console.log('📡 Fetching PNJ...')
                const res = await fetch('https://api.vnappmob.com/api/v2/gold/pnj', {
                    headers: { 'Authorization': `Bearer ${VNAPPMOB_API_KEY}`, 'Content-Type': 'application/json' }
                })
                if (res.ok) {
                    const data = await res.json()
                    // console.log('✅ PNJ:', data)
                    if (data.results?.[0]) {
                        newRecords.push({
                            brand: 'PNJ',
                            buy_price: parseFloat(data.results[0].buy_sjc99_1l || data.results[0].buy || 0),
                            sell_price: parseFloat(data.results[0].sell_sjc99_1l || data.results[0].sell || 0),
                            metal_type: 'gold',
                            currency: 'VND',
                            updated_at: new Date().toISOString()
                        })
                    }
                }
            } catch (err) { console.warn('⚠️ PNJ:', err.message) }

            // Lấy DOJI
            try {
                // console.log('📡 Fetching DOJI...')
                const res = await fetch('https://api.vnappmob.com/api/v2/gold/doji', {
                    headers: { 'Authorization': `Bearer ${VNAPPMOB_API_KEY}`, 'Content-Type': 'application/json' }
                })
                if (res.ok) {
                    const data = await res.json()
                    // console.log('✅ DOJI:', data)
                    if (data.results?.[0]) {
                        newRecords.push({
                            brand: 'DOJI',
                            buy_price: parseFloat(data.results[0].buy_hcm) || 0,
                            sell_price: parseFloat(data.results[0].sell_hcm) || 0,
                            metal_type: 'gold',
                            currency: 'VND',
                            updated_at: new Date().toISOString()
                        })
                    }
                }
            } catch (err) { console.warn('⚠️ DOJI:', err.message) }

            // CRITICAL CHANGE: Update Valid Data Locally FIRST
            if (newRecords.length > 0) {
                if (!isAuto) console.log('⚡ Updating Local UI State immediately...')

                // Update local state via hook's setData
                setData(prev => {
                    const updated = [...prev, ...newRecords];
                    // Keep only last 50
                    return updated.length > 50 ? updated.slice(-50) : updated;
                });

                const brands = newRecords.map(d => d.brand).join(', ')

                // Then try to save to DB (Background Sync)
                try {
                    const { error } = await supabase.from('gold_prices').insert(newRecords)
                    if (error) {
                        if (!isAuto) {
                            console.warn('⚠️ Could not save to DB (Guest mode or RLS blocked):', error.message)
                            alert(`✅ Đã lấy dữ liệu thành công! (Guest Mode)\n\n🇻🇳 Giá: ${brands}\n\nLưu ý: Bạn đang xem ở chế độ Khách (Guest). Dữ liệu này chỉ hiển thị trên máy của bạn.`)
                        }
                    } else {
                        if (!isAuto) alert(`✅ Thành công!\n\n🇻🇳 Đã cập nhật: ${brands}\n\nDữ liệu đã được lưu vào hệ thống.`)
                    }
                } catch (dbErr) {
                    console.warn('⚠️ DB Error:', dbErr)
                }

            } else {
                if (!isAuto) {
                    // Only throw if manual, otherwise just silent fail
                    throw new Error('Không lấy được dữ liệu từ nguồn VNAppMob')
                }
            }
        } catch (error) {
            console.error('❌:', error)
            if (!isAuto) alert(`❌ Lỗi: ${error.message}`)
        }
    }, [setData])

    // Auto-update every 60 seconds
    useEffect(() => {
        // Initial fetch if empty
        if (!data || data.length === 0) {
            handleManualUpdate(true)
        }

        const interval = setInterval(() => {
            handleManualUpdate(true)
        }, 60000) // 60 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <GoldContext.Provider value={{ data, loading, error, handleManualUpdate }}>
            {children}
        </GoldContext.Provider>
    )
}
