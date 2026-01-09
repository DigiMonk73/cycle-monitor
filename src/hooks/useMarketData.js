import { useState, useEffect, useCallback } from 'react'
import { fetchAllIndicators } from '../services/dataFetcher'

// Default fallback data if all fetches fail
const DEFAULT_DATA = {
  cycleIndicators: [
    { name: 'XHB vs 200-day MA', value: 'Below', status: 'yellow', trend: 'down' },
    { name: 'XHB vs 200-week MA', value: '-3%', status: 'yellow', trend: 'down' },
    { name: 'KRE vs 200-day MA', value: 'Above', status: 'green', trend: 'up' },
    { name: "KRE vs Mar '23 lows", value: '+94%', status: 'green', trend: 'up' },
    { name: 'HY Credit Spread', value: '281bp', status: 'green', trend: 'flat' },
    { name: 'Office REITs', value: 'Stressed', status: 'yellow', trend: 'down' },
    { name: '% Stocks > 200d MA', value: '55%', status: 'green', trend: 'flat' },
    { name: 'VIX', value: '15.1', status: 'green', trend: 'flat' },
  ],
  recessionIndicators: [
    { name: '2Y-10Y Spread', value: '+0.68%', status: 'green', trend: 'up' },
    { name: 'Initial Claims', value: '208K', status: 'green', trend: 'flat' },
    { name: 'Sahm Rule', value: '0.13', status: 'green', trend: 'flat' },
    { name: 'ISM Manufacturing', value: '47.9', status: 'yellow', trend: 'down' },
    { name: 'LEI 6-mo Change', value: '-2.1%', status: 'yellow', trend: 'down' },
    { name: 'HY Credit Spread', value: '281bp', status: 'green', trend: 'flat' },
    { name: 'Building Permits YoY', value: '-5%', status: 'yellow', trend: 'down' },
    { name: 'Corp Profits YoY', value: '+4.2%', status: 'green', trend: 'up' },
  ],
  triggers: [
    { asset: 'BTC', currentPrice: 91500, triggerPrice: 60000, direction: 'below' },
    { asset: 'TSLA', currentPrice: 437, triggerPrice: 250, direction: 'below' },
  ],
  cycleScore: 9,
  recessionScore: 9,
  errors: [],
  timestamp: new Date().toISOString()
}

/**
 * Custom hook to fetch and manage market data
 * @param {Object} options
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.refreshInterval - Refresh interval in ms (default: 5 minutes)
 * @returns {Object} { data, loading, error, refetch, lastUpdated }
 */
export function useMarketData({ autoRefresh = true, refreshInterval = 5 * 60 * 1000 } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchAllIndicators()

      if (result) {
        setData(result)
        setLastUpdated(new Date())

        // Check if there were any errors during fetch
        if (result.errors && result.errors.length > 0) {
          console.warn('Some data sources failed:', result.errors)
        }
      } else {
        throw new Error('Failed to fetch market data')
      }
    } catch (err) {
      console.error('Error fetching market data:', err)
      setError(err.message || 'Failed to fetch market data')

      // Use default data as fallback
      if (!data) {
        setData(DEFAULT_DATA)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const intervalId = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    data: data || DEFAULT_DATA,
    loading,
    error,
    refetch: fetchData,
    lastUpdated,
    hasErrors: data?.errors?.length > 0
  }
}

export default useMarketData
