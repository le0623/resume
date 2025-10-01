"use client"

import { useState, useMemo, useEffect } from "react"
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
  setLastWeek: () => void
  setLastMonth: () => void
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

  // Set default to last 7 days on mount
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6) // 6 days ago + today = 7 days
    setStartDate(start)
    setEndDate(end)
  }, [])

  // Helper functions for quick date selection
  const setLastWeek = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6) // 6 days ago + today = 7 days
    setStartDate(start)
    setEndDate(end)
  }

  const setLastMonth = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 29) // 29 days ago + today = 30 days
    setStartDate(start)
    setEndDate(end)
  }

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
  
  // Format dates as YYYY-MM-DD in local timezone to avoid timezone shifts
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const timeseriesUrl = hasValidDateRange
    ? `/api/admin/analytics/timeseries?startDate=${formatLocalDate(startDate)}&endDate=${formatLocalDate(endDate)}`
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
    if (!timeseriesData?.resumeCounts || !startDate || !endDate) return []
    
    // Create a map to count resumes per day
    const dailyCounts = new Map<string, number>()
    
    // Initialize all days in the range with 0
    const currentDate = new Date(startDate)
    const end = new Date(endDate)
    
    while (currentDate <= end) {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      dailyCounts.set(dateKey, 0)
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Count resumes per day (convert UTC timestamp to local date)
    timeseriesData.resumeCounts.forEach(item => {
      const date = new Date(item.createdAt)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      if (dailyCounts.has(dateKey)) {
        dailyCounts.set(dateKey, dailyCounts.get(dateKey)! + 1)
      }
    })
    
    // Convert to array format with MM/DD display format
    return Array.from(dailyCounts.entries()).map(([dateKey, count]) => {
      const [year, month, day] = dateKey.split('-')
      return {
        date: `${month}/${day}`,
        count
      }
    })
  }, [timeseriesData?.resumeCounts, startDate, endDate])

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
    setLastWeek,
    setLastMonth,
    summaryError,
    summaryLoading,
    timeseriesError,
    timeseriesLoading,
    chartData,
    hasValidDateRange: !!hasValidDateRange,
    totals
  }
}
