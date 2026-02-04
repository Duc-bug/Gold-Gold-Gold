// ===================================================================
// CÁCH SỬ DỤNG API VNAPPMOB - CÓ SẴN API KEY
// ===================================================================

// COPY đoạn code này vào App.jsx thay function handleManualUpdate cũ

const handleManualUpdate = async () => {
    console.log('🔄 Đang lấy giá vàng thật từ VNAppMob API...')

    try {
        // API Key của bạn (hết hạn sau 15 ngày - ngày 18/2/2026)
        const VNAPPMOB_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzE0MTI2ODcsImlhdCI6MTc3MDExNjY4Nywic2NvcGUiOiJnb2xkIiwicGVybWlzc2lvbiI6MH0.3Cpq7L6Fv_lgN1HQ6eBEjZudCOhh40hISrvCkK4ADHg"
        const insertData = []

        // 1. LẤY GIÁ SJC
        try {
            console.log('📡 Fetching SJC...')
            const sjcResponse = await fetch('https://api.vnappmob.com/api/v2/gold/sjc', {
                headers: {
                    'Authorization': `Bearer ${VNAPPMOB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (sjcResponse.ok) {
                const sjcData = await sjcResponse.json()
                console.log('✅ SJC data:', sjcData)

                if (sjcData.results && sjcData.results.length > 0) {
                    const latest = sjcData.results[0]
                    insertData.push({
                        brand: 'SJC',
                        buy_price: parseFloat(latest.buy_1l) || 0,
                        sell_price: parseFloat(latest.sell_1l) || 0,
                        region: 'vietnam',
                        currency: 'VND',
                        updated_at: new Date().toISOString()
                    })
                }
            }
        } catch (err) {
            console.warn('⚠️ SJC error:', err.message)
        }

        // 2. LẤY GIÁ PNJ
        try {
            console.log('📡 Fetching PNJ...')
            const pnjResponse = await fetch('https://api.vnappmob.com/api/v2/gold/pnj', {
                headers: {
                    'Authorization': `Bearer ${VNAPPMOB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (pnjResponse.ok) {
                const pnjData = await pnjResponse.json()
                console.log('✅ PNJ data:', pnjData)

                if (pnjData.results && pnjData.results.length > 0) {
                    const latest = pnjData.results[0]
                    const buyPrice = parseFloat(latest.buy_sjc99_1l || latest.buy || 0)
                    const sellPrice = parseFloat(latest.sell_sjc99_1l || latest.sell || 0)

                    insertData.push({
                        brand: 'PNJ',
                        buy_price: buyPrice,
                        sell_price: sellPrice,
                        region: 'vietnam',
                        currency: 'VND',
                        updated_at: new Date().toISOString()
                    })
                }
            }
        } catch (err) {
            console.warn('⚠️ PNJ error:', err.message)
        }

        // 3. LẤY GIÁ DOJI
        try {
            console.log('📡 Fetching DOJI...')
            const dojiResponse = await fetch('https://api.vnappmob.com/api/v2/gold/doji', {
                headers: {
                    'Authorization': `Bearer ${VNAPPMOB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (dojiResponse.ok) {
                const dojiData = await dojiResponse.json()
                console.log('✅ DOJI data:', dojiData)

                if (dojiData.results && dojiData.results.length > 0) {
                    const latest = dojiData.results[0]
                    insertData.push({
                        brand: 'DOJI',
                        buy_price: parseFloat(latest.buy_hcm) || 0,
                        sell_price: parseFloat(latest.sell_hcm) || 0,
                        region: 'vietnam',
                        currency: 'VND',
                        updated_at: new Date().toISOString()
                    })
                }
            }
        } catch (err) {
            console.warn('⚠️ DOJI error:', err.message)
        }

        // 4. INSERT VÀO SUPABASE
        if (insertData.length > 0) {
            console.log('💾 Inserting:', insertData)

            const brands = insertData.map(d => d.brand).join(', ')
            let supabaseSuccess = false;
            let supabaseErrorMsg = '';

            try {
                const { error } = await supabase
                    .from('gold_prices')
                    .insert(insertData)

                if (error) {
                    throw error
                }
                supabaseSuccess = true;
            } catch (dbErr) {
                console.error('⚠️ Supabase Insert Error:', dbErr)
                supabaseErrorMsg = dbErr.message
            }

            if (supabaseSuccess) {
                alert(`✅ Thành công!\n\n🇻🇳 Đã lấy: ${brands}\n\nDashboard sẽ tự động cập nhật!`)
            } else {
                alert(`⚠️ Đã lấy được dữ liệu nhưng KHÔNG THỂ lưu vào Supabase (Lỗi Server).\n\n🇻🇳 Dữ liệu đã lấy: ${brands}\n\nLỗi: ${supabaseErrorMsg}`)
                console.log('Fetched Data (not saved):', insertData)
            }
        } else {
            throw new Error('Không lấy được dữ liệu từ nguồn VNAppMob')
        }

    } catch (error) {
        console.error('❌ Lỗi:', error)
        alert(`❌ Lỗi: ${error.message}`)
    }
}
