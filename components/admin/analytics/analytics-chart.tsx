"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRangePicker } from "./date-range-picker"

interface ChartData {
  date: string
  count: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  isLoading?: boolean
  hasDateRange: boolean
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  onSetLastWeek?: () => void
  onSetLastMonth?: () => void
  error?: Error | null
}

const chartConfig = {
  count: {
    label: "Resumes",
    color: "hsl(217, 91%, 60%)", // Blue color
  },
}

export function AnalyticsChart({ 
  data, 
  isLoading, 
  hasDateRange, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onSetLastWeek,
  onSetLastMonth,
  error
}: AnalyticsChartProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Generation</CardTitle>
              <CardDescription>
                Number of resumes generated over time
              </CardDescription>
            </div>
            {/* Date Range Picker and Quick Selection - Always visible */}
            {onStartDateChange && onEndDateChange && (
              <div className="flex gap-2">
                {onSetLastWeek && (
                  <Button variant="outline" size="sm" onClick={onSetLastWeek}>
                    Last 7 Days
                  </Button>
                )}
                {onSetLastMonth && (
                  <Button variant="outline" size="sm" onClick={onSetLastMonth}>
                    Last 30 Days
                  </Button>
                )}
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={onStartDateChange}
                  onEndDateChange={onEndDateChange}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center border-2 border-dashed border-red-200 rounded-lg">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500">Failed to load chart data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Generation</CardTitle>
              <CardDescription>
                Number of resumes generated over time
              </CardDescription>
            </div>
            {/* Date Range Picker and Quick Selection - Always visible */}
            {onStartDateChange && onEndDateChange && (
              <div className="flex gap-2">
                {onSetLastWeek && (
                  <Button variant="outline" size="sm" onClick={onSetLastWeek}>
                    Last 7 Days
                  </Button>
                )}
                {onSetLastMonth && (
                  <Button variant="outline" size="sm" onClick={onSetLastMonth}>
                    Last 30 Days
                  </Button>
                )}
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={onStartDateChange}
                  onEndDateChange={onEndDateChange}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading chart data...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasDateRange) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Generation</CardTitle>
              <CardDescription>
                Number of resumes generated over time
              </CardDescription>
            </div>
            {/* Date Range Picker and Quick Selection - Always visible */}
            {onStartDateChange && onEndDateChange && (
              <div className="flex gap-2">
                {onSetLastWeek && (
                  <Button variant="outline" size="sm" onClick={onSetLastWeek}>
                    Last 7 Days
                  </Button>
                )}
                {onSetLastMonth && (
                  <Button variant="outline" size="sm" onClick={onSetLastMonth}>
                    Last 30 Days
                  </Button>
                )}
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={onStartDateChange}
                  onEndDateChange={onEndDateChange}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Select a date range to view analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Generation</CardTitle>
              <CardDescription>
                Number of resumes generated over time
              </CardDescription>
            </div>
            {/* Date Range Picker and Quick Selection - Always visible */}
            {onStartDateChange && onEndDateChange && (
              <div className="flex gap-2">
                {onSetLastWeek && (
                  <Button variant="outline" size="sm" onClick={onSetLastWeek}>
                    Last 7 Days
                  </Button>
                )}
                {onSetLastMonth && (
                  <Button variant="outline" size="sm" onClick={onSetLastMonth}>
                    Last 30 Days
                  </Button>
                )}
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={onStartDateChange}
                  onEndDateChange={onEndDateChange}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No data available for the selected period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resume Generation</CardTitle>
            <CardDescription>
              Number of resumes generated over time
            </CardDescription>
          </div>
          {/* Date Range Picker and Quick Selection - Always visible */}
          {onStartDateChange && onEndDateChange && (
            <div className="flex gap-2">
              {onSetLastWeek && (
                <Button variant="outline" size="sm" onClick={onSetLastWeek}>
                  Last 7 Days
                </Button>
              )}
              {onSetLastMonth && (
                <Button variant="outline" size="sm" onClick={onSetLastMonth}>
                  Last 30 Days
                </Button>
              )}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar 
              dataKey="count" 
              fill="var(--color-count)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
