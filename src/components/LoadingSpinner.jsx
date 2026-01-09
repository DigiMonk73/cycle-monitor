/**
 * LoadingSpinner - Animated loading indicator
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinning gauge animation */}
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '2s' }}>
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="50%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#ff3344" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="60 200"
            style={{
              filter: 'drop-shadow(0 0 8px #00ff88)'
            }}
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm">Loading market data...</p>
        <p className="text-gray-600 text-xs mt-1">Fetching from Yahoo Finance, FRED, CoinGecko</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
