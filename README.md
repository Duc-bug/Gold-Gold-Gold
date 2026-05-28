# GoldSA 🏆

Real-time Gold Price Analytics Dashboard with AI-Powered Forecasting

![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)

## ✨ Features

- 📊 **Real-time Data Visualization** - Live updates via Supabase Realtime
- 🤖 **AI Price Forecasting** - Linear regression + moving average predictions
- 📈 **Interactive Charts** - Beautiful charts with Recharts library
- 🔔 **Price Alerts** - Email notifications when target price is reached
- 💎 **Premium Design** - Glass-morphism UI with smooth animations
- 🎯 **Trend Analysis** - Automatic trend detection and volatility calculation

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Supabase

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   copy .env.example .env
   \`\`\`

2. Update `.env` with your Supabase credentials:
   \`\`\`
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   \`\`\`

### 3. Set Up Supabase Tables

Run these SQL commands in your Supabase SQL Editor:

\`\`\`sql
-- Gold Prices Table
CREATE TABLE gold_prices (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  buy_price DECIMAL(10, 2) NOT NULL,
  sell_price DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE gold_prices;

-- User Alerts Table
CREATE TABLE user_alerts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_triggered BOOLEAN DEFAULT FALSE
);

-- Index for performance
CREATE INDEX idx_gold_prices_updated_at ON gold_prices(updated_at DESC);
CREATE INDEX idx_user_alerts_email ON user_alerts(email);
\`\`\`

### 4. Enable Realtime in Supabase

1. Go to **Database → Replication**
2. Enable replication for the `gold_prices` table
3. Make sure INSERT events are enabled

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:5173`

## 🔧 Project Structure

\`\`\`
src/
├── components/
│   ├── GoldPriceChart.jsx    # Chart component with AI predictions
│   ├── PriceAlertForm.jsx    # Alert creation form
│   ├── PriceCard.jsx         # Price display card
│   └── StatCard.jsx          # Statistics card
├── hooks/
│   └── useRealtimeGold.js    # Custom hook for Supabase Realtime
├── lib/
│   └── supabase.js           # Supabase client configuration
├── utils/
│   └── forecast.js           # AI forecasting algorithms
├── App.jsx                   # Main application
├── main.jsx                  # Entry point
└── index.css                 # Global styles + Tailwind
\`\`\`

## 🤖 AI Forecasting Algorithm

The app uses a hybrid approach for price prediction:

1. **Linear Regression** - Analyzes historical trend (70% weight)
2. **Moving Average** - Smooths short-term volatility (30% weight)
3. **Confidence Score** - Decreases over prediction horizon (100% → 55%)

The `calculateTrend()` function predicts the next 3 price points based on the last 50 data entries.

## 🔌 Manual API Integration

To integrate your external Gold Price API:

1. Open `src/App.jsx`
2. Find the `handleManualUpdate()` function (marked with comments)
3. Add your API fetch logic:

\`\`\`javascript
const handleManualUpdate = async () => {
  try {
    // Fetch from your API
    const response = await fetch('YOUR_API_ENDPOINT')
    const apiData = await response.json()
    
    // Insert into Supabase (triggers realtime update)
    const { error } = await supabase
      .from('gold_prices')
      .insert([{
        brand: apiData.brand,
        buy_price: apiData.buyPrice,
        sell_price: apiData.sellPrice,
        updated_at: new Date().toISOString()
      }])
    
    if (error) throw error
  } catch (err) {
    console.error('Error:', err)
  }
}
\`\`\`

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## 🎨 Customization

### Change Gold Color Palette

Edit `tailwind.config.js`:
\`\`\`javascript
theme: {
  extend: {
    colors: {
      gold: {
        500: '#your-color',
        // ...
      }
    }
  }
}
\`\`\`

### Adjust Prediction Parameters

Edit `src/utils/forecast.js`:
- Change weight distribution (linear vs. moving average)
- Adjust confidence decay rate
- Modify prediction horizon (currently 3 points)

## 🐛 Troubleshooting

### Realtime Not Working?
1. Verify Realtime is enabled in Supabase
2. Check browser console for subscription status
3. Ensure RLS policies allow read access

### No Data Showing?
1. Verify `.env` credentials are correct
2. Check if `gold_prices` table has data
3. Open browser DevTools → Network tab for API errors

### Forecast Not Displaying?
1. Ensure at least 3 data points exist
2. Check console for calculation errors
3. Verify price fields are numeric

## 📦 Build for Production

\`\`\`bash
npm run build
\`\`\`

Preview production build:
\`\`\`bash
npm run preview
\`\`\`

## 🎯 Next Steps

- [ ] Add backend crawler to auto-fetch from external API
- [ ] Implement email notification service for alerts
- [ ] Add historical data export (CSV/PDF)
- [ ] Create admin dashboard for data management
- [ ] Add more chart types (candlestick, area, etc.)
- [ ] Implement user authentication
- [ ] Add multi-currency support

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ using React, Vite, Tailwind CSS, Supabase, and Recharts
