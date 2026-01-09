/**
 * TriggerBar - Shows asset price relative to trigger price
 * @param {string} asset - Asset symbol (BTC, TSLA, etc.)
 * @param {number} currentPrice - Current price
 * @param {number} triggerPrice - Trigger price threshold
 * @param {string} direction - 'below' | 'above' - when trigger activates
 * @param {boolean} hasError - Whether this trigger has a data fetch error
 */
function TriggerBar({ asset, currentPrice, triggerPrice, direction = 'below', hasError = false }) {
  // Calculate distance percentage
  const distance = Math.abs((currentPrice - triggerPrice) / currentPrice) * 100

  // Determine if trigger is "safe" (far from trigger) or "warning" (close to trigger)
  const isSafe = direction === 'below'
    ? currentPrice > triggerPrice
    : currentPrice < triggerPrice

  // Calculate bar fill percentage (inverted - more fill = closer to trigger)
  const maxDistance = 50 // Assume 50% is "full safe"
  const fillPercent = Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100))

  // Color based on distance from trigger
  const getBarColor = () => {
    if (distance > 30) return 'bg-green-500'
    if (distance > 20) return 'bg-yellow-500'
    if (distance > 10) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getGlowColor = () => {
    if (distance > 30) return '#00ff88'
    if (distance > 20) return '#ffcc00'
    if (distance > 10) return '#ff8800'
    return '#ff3344'
  }

  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-100">{asset}</span>
          <span className="text-xs text-gray-500 uppercase">
            Trigger {direction}
          </span>
          {hasError && (
            <span className="text-yellow-500 text-xs" title="Using cached data">
              ⚠
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-gray-300">
            {formatPrice(currentPrice)}
          </div>
          <div className="text-xs text-gray-500">
            Trigger: {formatPrice(triggerPrice)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${getBarColor()} transition-all duration-500 rounded-full`}
          style={{
            width: `${100 - fillPercent}%`,
            boxShadow: `0 0 10px ${getGlowColor()}`
          }}
        />
        {/* Trigger marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/50"
          style={{
            left: `${100 - (distance / maxDistance * 100)}%`,
            display: distance > maxDistance ? 'none' : 'block'
          }}
        />
      </div>

      {/* Distance label */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">
          {isSafe ? 'Safe' : 'Triggered'}
        </span>
        <span
          className="text-sm font-bold font-mono"
          style={{ color: getGlowColor() }}
        >
          {distance.toFixed(0)}% away
        </span>
      </div>
    </div>
  )
}

export default TriggerBar
