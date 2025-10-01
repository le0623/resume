"use client"

import { StatsCards } from "@/components/admin/analytics/stats-cards"
import { AnalyticsChart } from "@/components/admin/analytics/analytics-chart"
import { useAnalytics } from "@/hooks/use-analytics"

export function AnalyticsDashboard() {
  const {
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
    hasValidDateRange,
    totals
  } = useAnalytics()

  if (summaryError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View resume generation statistics and trends
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load analytics summary</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View resume generation statistics and trends
        </p>
      </div>

      {/* Main Content - Stats Cards (Left) and Chart (Right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Cards - Left Column */}
        <div className="space-y-4">
          <StatsCards totals={totals} isLoading={summaryLoading} />
        </div>

        {/* Chart - Right Column */}
        <div className="lg:col-span-2">
          <AnalyticsChart 
            data={chartData} 
            isLoading={timeseriesLoading} 
            hasDateRange={hasValidDateRange}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSetLastWeek={setLastWeek}
            onSetLastMonth={setLastMonth}
            error={timeseriesError}
          />
        </div>
      </div>
    </div>
  )
}
