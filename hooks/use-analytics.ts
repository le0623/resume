"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"

interface SummaryData {
  totals: {
    resumes: number
    profiles: number
    templates: number
  }
}

interface TimeseriesData {
  startDate: string
  endDate: string
  resumeCounts: Array<{
    createdAt: string
    _count: { id: number }
  }>
}

interface UseAnalyticsReturn {
  startDate: Date | undefined
  endDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  summaryError: any
  summaryLoading: boolean
  timeseriesError: any
  timeseriesLoading: boolean
  chartData: Array<{ date: string; count: number }>
  hasValidDateRange: boolean
  totals: {
    resumes: number
    profiles: number
    templates: number
  }
}

export function useAnalytics(): UseAnalyticsReturn {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Fetch summary data (totals) - this doesn't change often
  const { 
    data: summaryData, 
    error: summaryError, 
    isLoading: summaryLoading 
  } = useSWR<SummaryData>("/api/admin/analytics/summary", fetcher, {
    revalidateOnFocus: false,
    // Revalidate summary data less frequently (every 5 minutes)
    refreshInterval: 5 * 60 * 1000,
  })

  // Only fetch timeseries when we have both dates and end date is after start date
  const hasValidDateRange = startDate && endDate && startDate <= endDate
  
  const timeseriesUrl = hasValidDateRange
    ? `/api/admin/analytics/timeseries?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
    : null

  const { 
    data: timeseriesData, 
    error: timeseriesError, 
    isLoading: timeseriesLoading 
  } = useSWR<TimeseriesData>(timeseriesUrl, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })

  const chartData = useMemo(() => {
    if (!timeseriesData?.resumeCounts) return []
    
    return timeseriesData.resumeCounts.map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(),
      count: item._count.id
    }))
  }, [timeseriesData?.resumeCounts])

  const totals = summaryData?.totals || {
    resumes: 0,
    profiles: 0,
    templates: 0
  }

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    summaryError,
    summaryLoading,
    timeseriesError,
    timeseriesLoading,
    chartData,
    hasValidDateRange: !!hasValidDateRange,
    totals
  }
}
