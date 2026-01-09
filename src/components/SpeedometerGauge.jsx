import { useState, useEffect } from 'react'

/**
 * SpeedometerGauge - A semi-circular gauge with animated needle
 * @param {number} score - Current value (0-100)
 * @param {number} maxScore - Maximum value (default 100)
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle
 * @param {string} size - 'large' or 'small'
 */
function SpeedometerGauge({ score = 0, maxScore = 100, title = '', subtitle = '', size = 'large' }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  // Animate needle on score change
  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()
    const startScore = animatedScore

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(startScore + (score - startScore) * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  // Dimensions based on size
  const dimensions = size === 'large' ? { width: 280, height: 160 } : { width: 200, height: 120 }
  const { width, height } = dimensions
  const centerX = width / 2
  const centerY = height - 10
  const radius = Math.min(centerX, centerY) - 20

  // Calculate needle angle (0 = left, 180 = right)
  const normalizedScore = Math.max(0, Math.min(animatedScore, maxScore))
  const angle = (normalizedScore / maxScore) * 180
  const needleAngle = angle - 180 // Adjust to start from left
  const needleRadians = (needleAngle * Math.PI) / 180

  // Needle endpoint
  const needleLength = radius - 15
  const needleX = centerX + needleLength * Math.cos(needleRadians)
  const needleY = centerY + needleLength * Math.sin(needleRadians)

  // Get status label and color based on score (updated thresholds)
  const getStatus = (score) => {
    if (score <= 30) return { label: 'NORMAL', color: '#00ff88' }
    if (score <= 60) return { label: 'ELEVATED', color: '#ffcc00' }
    if (score <= 85) return { label: 'WARNING', color: '#ff8800' }
    return { label: 'CRISIS', color: '#ff3344' }
  }

  const status = getStatus(score)

  // Arc path for the gauge background
  const createArc = (startAngle, endAngle, r) => {
    const startRad = (startAngle - 180) * Math.PI / 180
    const endRad = (endAngle - 180) * Math.PI / 180
    const x1 = centerX + r * Math.cos(startRad)
    const y1 = centerY + r * Math.sin(startRad)
    const x2 = centerX + r * Math.cos(endRad)
    const y2 = centerY + r * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  // Color zone definitions: GREEN (0-30) → YELLOW (31-60) → ORANGE (61-85) → RED (86-100)
  const colorZones = [
    { start: 0, end: 30, color: '#00ff88' },    // Green
    { start: 30, end: 60, color: '#ffcc00' },   // Yellow
    { start: 60, end: 85, color: '#ff8800' },   // Orange
    { start: 85, end: 100, color: '#ff3344' },  // Red
  ]

  // Generate unique ID for this gauge instance
  const gaugeId = title.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex flex-col items-center p-4">
      <svg width={width} height={height + 60} className="overflow-visible">
        <defs>
          {/* Glow filters for each color zone */}
          <filter id={`glowGreen-${gaugeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#00ff88" floodOpacity="0.6"/>
            <feComposite in2="coloredBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id={`glowYellow-${gaugeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#ffcc00" floodOpacity="0.6"/>
            <feComposite in2="coloredBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id={`glowOrange-${gaugeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#ff8800" floodOpacity="0.6"/>
            <feComposite in2="coloredBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id={`glowRed-${gaugeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#ff3344" floodOpacity="0.6"/>
            <feComposite in2="coloredBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Glow filter for the needle */}
          <filter id={`needleGlow-${gaugeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background arc (dark gray outline) */}
        <path
          d={createArc(0, 180, radius)}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Colored arc segments with individual glow effects */}
        {colorZones.map((zone, index) => {
          const startAngle = (zone.start / 100) * 180
          const endAngle = (zone.end / 100) * 180
          const glowFilter = zone.color === '#00ff88' ? `glowGreen-${gaugeId}` :
                            zone.color === '#ffcc00' ? `glowYellow-${gaugeId}` :
                            zone.color === '#ff8800' ? `glowOrange-${gaugeId}` :
                            `glowRed-${gaugeId}`
          return (
            <path
              key={index}
              d={createArc(startAngle, endAngle, radius)}
              fill="none"
              stroke={zone.color}
              strokeWidth="10"
              strokeLinecap="butt"
              filter={`url(#${glowFilter})`}
              style={{ opacity: 0.9 }}
            />
          )
        })}

        {/* Tick marks */}
        {[0, 30, 60, 85, 100].map((tick) => {
          const tickAngle = ((tick / 100) * 180 - 180) * Math.PI / 180
          const innerR = radius - 22
          const outerR = radius - 8
          const x1 = centerX + innerR * Math.cos(tickAngle)
          const y1 = centerY + innerR * Math.sin(tickAngle)
          const x2 = centerX + outerR * Math.cos(tickAngle)
          const y2 = centerY + outerR * Math.sin(tickAngle)
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#888"
              strokeWidth="2"
            />
          )
        })}

        {/* Minor tick marks */}
        {[15, 45, 72.5].map((tick) => {
          const tickAngle = ((tick / 100) * 180 - 180) * Math.PI / 180
          const innerR = radius - 18
          const outerR = radius - 10
          const x1 = centerX + innerR * Math.cos(tickAngle)
          const y1 = centerY + innerR * Math.sin(tickAngle)
          const x2 = centerX + outerR * Math.cos(tickAngle)
          const y2 = centerY + outerR * Math.sin(tickAngle)
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#555"
              strokeWidth="1"
            />
          )
        })}

        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={status.color}
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#needleGlow-${gaugeId})`}
        />

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="#1a1a2e"
          stroke={status.color}
          strokeWidth="2"
        />

        {/* Score display */}
        <text
          x={centerX}
          y={centerY + 35}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={status.color}
          style={{
            fontSize: size === 'large' ? '28px' : '20px',
            fontFamily: 'monospace',
            filter: `drop-shadow(0 0 8px ${status.color})`
          }}
        >
          {Math.round(score)}
        </text>

        {/* Status label */}
        <text
          x={centerX}
          y={centerY + 55}
          textAnchor="middle"
          fill={status.color}
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}
        >
          {status.label}
        </text>
      </svg>

      {/* Title below */}
      <div className="text-center mt-2">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

export default SpeedometerGauge
