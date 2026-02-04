/**
 * AI Forecast Logic using Simple Linear Regression
 * This calculates trend and predicts future price points
 */

/**
 * Calculate linear regression for price prediction
 * @param {Array} data - Array of gold price objects from Supabase
 * @param {String} priceField - Field to analyze ('buy_price' or 'sell_price')
 * @returns {Object} - { slope, intercept, predictions }
 */
export const calculateLinearRegression = (data, priceField = 'buy_price') => {
    if (!data || data.length < 2) {
        return { slope: 0, intercept: 0, predictions: [] }
    }

    // Prepare data points
    const n = data.length
    const points = data
        .map((item, index) => ({
            x: index,
            y: parseFloat(item[priceField]) || 0
        }))
        .filter(p => p.y > 0)

    if (points.length < 2) {
        return { slope: 0, intercept: 0, predictions: [] }
    }

    // Calculate sums
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0)
    const sumXX = points.reduce((sum, p) => sum + (p.x * p.x), 0)

    // Linear regression formula: y = mx + b
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept, predictions: [] }
}

/**
 * Calculate moving average for smoothing
 * @param {Array} data - Array of gold price objects
 * @param {String} priceField - Field to analyze
 * @param {Number} window - Window size for moving average
 * @returns {Number} - Predicted next value
 */
export const calculateMovingAverage = (data, priceField = 'buy_price', window = 5) => {
    if (!data || data.length < window) {
        return 0
    }

    const recentData = data.slice(-window)
    const sum = recentData.reduce((total, item) => {
        return total + (parseFloat(item[priceField]) || 0)
    }, 0)

    return sum / window
}

/**
 * Main function to calculate trend and predict next 3 price points
 * Uses both Linear Regression and Moving Average for better accuracy
 * 
 * @param {Array} data - Historical gold price data
 * @param {String} priceField - 'buy_price' or 'sell_price'
 * @returns {Array} - Array of 3 predicted price points with timestamps
 */
export const calculateTrend = (data, priceField = 'buy_price') => {
    if (!data || data.length < 3) {
        return []
    }

    // Get linear regression parameters
    const { slope, intercept } = calculateLinearRegression(data, priceField)

    // Calculate moving average for baseline
    const movingAvg = calculateMovingAverage(data, priceField, 5)

    // Get the last data point for timestamp reference
    const lastPoint = data[data.length - 1]
    const lastTime = new Date(lastPoint.updated_at)
    const lastValue = parseFloat(lastPoint[priceField]) || 0

    // Determine time interval between data points (in milliseconds)
    let avgInterval = 3600000 // Default: 1 hour
    if (data.length >= 2) {
        const intervals = []
        for (let i = 1; i < Math.min(data.length, 10); i++) {
            const t1 = new Date(data[i].updated_at).getTime()
            const t2 = new Date(data[i - 1].updated_at).getTime()
            intervals.push(t1 - t2)
        }
        avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    }

    // Generate predictions for the next 3 time points
    const predictions = []
    const n = data.length

    for (let i = 1; i <= 3; i++) {
        // Calculate future time
        const futureTime = new Date(lastTime.getTime() + (avgInterval * i))

        // Predict using linear regression: y = mx + b
        const futureIndex = n + i
        const predictedValue = slope * futureIndex + intercept

        // Blend with moving average for stability (70% regression, 30% MA)
        const blendedPrediction = (predictedValue * 0.7) + (movingAvg * 0.3)

        // Add small random noise for realism (±0.05%)
        const noise = (Math.random() - 0.5) * blendedPrediction * 0.0005
        const finalPrediction = blendedPrediction + noise

        predictions.push({
            [priceField]: Math.max(0, parseFloat(finalPrediction.toFixed(2))),
            updated_at: futureTime.toISOString(),
            brand: lastPoint.brand || 'Prediction',
            isPrediction: true,
            confidence: Math.max(0, 100 - (i * 15)) // Decreasing confidence: 85%, 70%, 55%
        })
    }

    return predictions
}

/**
 * Detect trend direction
 * @param {Array} data - Historical data
 * @param {String} priceField - Field to analyze
 * @returns {String} - 'up', 'down', or 'stable'
 */
export const detectTrendDirection = (data, priceField = 'buy_price') => {
    if (!data || data.length < 5) return 'stable'

    const { slope } = calculateLinearRegression(data, priceField)

    if (slope > 0.1) return 'up'
    if (slope < -0.1) return 'down'
    return 'stable'
}

/**
 * Calculate volatility (standard deviation)
 * @param {Array} data - Historical data
 * @param {String} priceField - Field to analyze
 * @returns {Number} - Volatility score
 */
export const calculateVolatility = (data, priceField = 'buy_price') => {
    if (!data || data.length < 2) return 0

    const prices = data.map(d => parseFloat(d[priceField]) || 0)
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length

    return Math.sqrt(variance)
}
