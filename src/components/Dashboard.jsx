import SpeedometerGauge from './SpeedometerGauge'
import IndicatorCard from './IndicatorCard'
import TriggerBar from './TriggerBar'
import CollapsibleSection from './CollapsibleSection'
import LoadingSpinner from './LoadingSpinner'
import useMarketData from '../hooks/useMarketData'

function Dashboard() {
  const { data, loading, error, refetch, lastUpdated, hasErrors } = useMarketData({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  })

  const formatTimestamp = (date) => {
    if (!date) return 'Never'
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  // Show loading spinner on initial load
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-red-400">
            Cycle Monitor
          </span>
        </h1>

        {/* Status bar with refresh */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-gray-500 text-sm">
            Last updated: {formatTimestamp(lastUpdated)}
          </p>

          <button
            onClick={refetch}
            disabled={loading}
            className={`
              px-3 py-1 text-xs rounded border transition-all duration-200
              ${loading
                ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                : 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500'
              }
            `}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error/Warning indicator */}
        {(error || hasErrors) && (
          <div className="mt-2 text-xs">
            {error && (
              <span className="text-red-400">
                Error: {error}
              </span>
            )}
            {hasErrors && !error && (
              <span className="text-yellow-400">
                Some data sources unavailable - showing cached values
              </span>
            )}
          </div>
        )}
      </header>

      {/* Main Gauges */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10">
        <SpeedometerGauge
          score={data.cycleScore}
          maxScore={100}
          title="18-Year Cycle Risk"
          subtitle="Real Estate Cycle Position"
          size="large"
        />
        <SpeedometerGauge
          score={data.recessionScore}
          maxScore={100}
          title="Recession Risk"
          subtitle="Economic Indicators"
          size="large"
        />
      </div>

      {/* Indicator Sections */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 18-Year Cycle Indicators */}
        <CollapsibleSection title="18-Year Cycle Indicators" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.cycleIndicators.map((indicator, index) => (
              <IndicatorCard
                key={index}
                name={indicator.name}
                value={indicator.value}
                status={indicator.status}
                trend={indicator.trend}
                hasError={indicator.hasError}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Recession Indicators */}
        <CollapsibleSection title="Recession Indicators" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recessionIndicators.map((indicator, index) => (
              <IndicatorCard
                key={index}
                name={indicator.name}
                value={indicator.value}
                status={indicator.status}
                trend={indicator.trend}
                hasError={indicator.hasError}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Your Triggers */}
        <CollapsibleSection title="Your Triggers" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.triggers.map((trigger, index) => (
              <TriggerBar
                key={index}
                asset={trigger.asset}
                currentPrice={trigger.currentPrice}
                triggerPrice={trigger.triggerPrice}
                direction={trigger.direction}
                hasError={trigger.hasError}
              />
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-600 text-sm">
        <p>Data is for informational purposes only. Not financial advice.</p>
        <p className="text-xs mt-1 text-gray-700">
          Data sources: Yahoo Finance, CoinGecko, FRED
        </p>
      </footer>
    </div>
  )
}

export default Dashboard
