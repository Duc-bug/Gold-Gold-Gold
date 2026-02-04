/**
 * Gemini AI Service - Real AI Analysis for Gold Prices
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'
const GEMINI_API_KEY = 'AIzaSyBn7CRWqszOOHYRduAPAwlvOQjJT4oqe-s'  // Hardcoded API Key

/**
 * Analyze gold price trends using Gemini AI
 * @param {Array} priceData - Historical price data
 * @returns {Object} AI analysis result
 */
export async function analyzeGoldPriceWithGemini(priceData) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured')
    }

    if (!priceData || priceData.length < 5) {
        throw new Error('Need at least 5 data points for analysis')
    }

    // Prepare data summary for AI
    const latest = priceData[priceData.length - 1]
    const first = priceData[0]
    const highestBuy = Math.max(...priceData.map(d => parseFloat(d.buy_price)))
    const lowestBuy = Math.min(...priceData.map(d => parseFloat(d.buy_price)))

    // Calculate recent trend
    const recentPrices = priceData.slice(-5).map(d => parseFloat(d.buy_price))
    const priceChange = ((latest.buy_price - first.buy_price) / first.buy_price * 100).toFixed(2)

    // Build prompt for Gemini - STRICT JSON OUTPUT
    const prompt = `You are a JSON API. Return ONLY valid JSON with gold price analysis in Vietnamese.

DATA:
- Points: ${priceData.length}
- Current: ${parseFloat(latest.buy_price).toLocaleString()} VND  
- Change: ${priceChange}%
- High: ${highestBuy.toLocaleString()} VND
- Low: ${lowestBuy.toLocaleString()} VND

OUTPUT (Vietnamese text, valid JSON):
{"trend":"up","confidence":85,"prediction":"Xu huong tang nhe","analysis":"Phan tich chi tiet","recommendation":"Khuyen nghi","risk_level":"low","key_insights":["Diem 1","Diem 2","Diem 3"]}

Return ONLY JSON. No markdown, no extra text.`.trim()

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,  // Very low for consistent output
                    topK: 10,
                    topP: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Gemini API request failed')
        }

        const data = await response.json()
        const aiText = data.candidates[0]?.content?.parts[0]?.text

        if (!aiText) {
            throw new Error('No response from Gemini AI')
        }

        // Parse JSON - AGGRESSIVE CLEANING
        let cleanText = aiText.trim()

        // Remove markdown
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '')

        // Extract JSON object
        const jsonStart = cleanText.indexOf('{')
        const jsonEnd = cleanText.lastIndexOf('}')

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanText = cleanText.substring(jsonStart, jsonEnd + 1)
        }

        // Fix common issues
        cleanText = cleanText
            .replace(/'/g, '"')  // Single to double quotes
            .replace(/(\w+):/g, '"$1":')  // Add quotes to keys if missing
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays

        // Try to parse
        let analysis
        try {
            analysis = JSON.parse(cleanText)
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message)
            console.error('📄 Raw AI Response:', aiText)
            console.error('🧹 Cleaned Text:', cleanText)

            throw new Error('AI trả về định dạng không hợp lệ. Vui lòng thử lại.')
        }

        // Validate required fields
        if (!analysis.trend || !analysis.confidence) {
            throw new Error('AI response missing required fields')
        }

        return {
            success: true,
            ...analysis,
            timestamp: new Date().toISOString()
        }

    } catch (error) {
        console.error('🚨 Gemini AI Error:', error.message)
        return {
            success: false,
            error: error.message,
            trend: 'unknown',
            confidence: 0,
            analysis: 'Không thể phân tích: ' + error.message
        }
    }
}
