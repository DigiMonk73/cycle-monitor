/**
 * IndicatorCard - Shows an individual indicator with status
 * @param {string} name - Indicator name
 * @param {string} value - Current value
 * @param {string} status - 'green' | 'yellow' | 'orange' | 'red'
 * @param {string} trend - 'up' | 'down' | 'flat'
 * @param {boolean} hasError - Whether this indicator has a data fetch error
 */
function IndicatorCard({ name, value, status = 'green', trend = 'flat', hasError = false }) {
  const statusColors = {
    green: {
      bg: 'bg-green-950/30',
      border: 'border-green-500/30',
      dot: 'bg-green-400',
      glow: 'shadow-[0_0_10px_#00ff8844]',
      hoverBorder: 'hover:border-green-500/60'
    },
    yellow: {
      bg: 'bg-yellow-950/30',
      border: 'border-yellow-500/30',
      dot: 'bg-yellow-400',
      glow: 'shadow-[0_0_10px_#ffcc0044]',
      hoverBorder: 'hover:border-yellow-500/60'
    },
    orange: {
      bg: 'bg-orange-950/30',
      border: 'border-orange-500/30',
      dot: 'bg-orange-400',
      glow: 'shadow-[0_0_10px_#ff880044]',
      hoverBorder: 'hover:border-orange-500/60'
    },
    red: {
      bg: 'bg-red-950/30',
      border: 'border-red-500/30',
      dot: 'bg-red-400',
      glow: 'shadow-[0_0_10px_#ff334444]',
      hoverBorder: 'hover:border-red-500/60'
    }
  }

  const colors = statusColors[status] || statusColors.green

  const trendIcons = {
    up: '↑',
    down: '↓',
    flat: '→'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    flat: 'text-gray-400'
  }

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.hoverBorder}
        border rounded-lg p-3
        transition-all duration-300 ease-out
        hover:${colors.glow}
        cursor-default
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div
            className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}
            style={{
              boxShadow: `0 0 8px currentColor`
            }}
          />
          <span className="text-gray-300 text-sm">{name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-100 font-mono text-sm font-medium">{value}</span>
          <span className={`${trendColors[trend]} text-lg`}>
            {trendIcons[trend]}
          </span>
          {/* Error indicator */}
          {hasError && (
            <span className="text-yellow-500 text-xs" title="Using cached data">
              ⚠
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default IndicatorCard
