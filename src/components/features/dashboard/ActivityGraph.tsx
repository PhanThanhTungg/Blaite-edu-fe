'use client'

import { Card, Typography, Tooltip, theme } from 'antd'
import { useState } from 'react'

const { Text } = Typography

interface Activity {
  id: number
  userId: number
  date: Date
  count: number
  createdAt: Date
  updatedAt: Date
}

interface ActivityGraphProps {
  activities: Activity[]
  className?: string
}

export default function ActivityGraph({ activities, className = "" }: ActivityGraphProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { token } = theme.useToken()

  // Convert activities to activity data
  const activityData = activities.reduce((acc, activity) => {
    const dateStr = activity.date.toISOString().split('T')[0]
    acc[dateStr] = activity.count
    return acc
  }, {} as Record<string, number>)

  // Get current year
  const currentYear = new Date().getFullYear()

  // Generate all days for the current year (Jan 1 to Dec 31)
  const days: string[] = []
  const startDate = new Date(currentYear, 0, 1) // January 1st
  const endDate = new Date(currentYear, 11, 31) // December 31st
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0])
  }

  // Get max count for color intensity
  const maxCount = Math.max(...Object.values(activityData), 1)

  const getColor = (count: number) => {
    if (count === 0) return '#ebedf0'
    const intensity = Math.min(count / maxCount, 1)
    if (intensity < 0.25) return '#9be9a8'
    if (intensity < 0.5) return '#40c463'
    if (intensity < 0.75) return '#30a14e'
    return '#216e39'
  }

  const getTooltipContent = (date: string, count: number) => {
    if (count === 0) return `${date}: No answers`
    return `${date}: ${count} ${count === 1 ? 'answer' : 'answers'}`
  }

  // Group days by months with 7 rows per month
  const months: { name: string; weeks: string[][]; paddingStart: number }[] = []
  
  // Process each month (1-12)
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthDays = days.filter(day => {
      const date = new Date(day)
      return date.getMonth() === monthIndex
    })
    
    if (monthDays.length > 0) {
      // Calculate padding for this month (Monday = 0, Sunday = 6)
      const firstDayOfMonth = new Date(currentYear, monthIndex, 1)
      const dayOfWeek = firstDayOfMonth.getDay()
      // Convert Sunday=0 to Monday=0
      const paddingStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      
      // Group days into weeks (7 days per week)
      const weeks: string[][] = []
      let currentWeek: string[] = []
      
      // Add padding days at the start
      for (let i = 0; i < paddingStart; i++) {
        currentWeek.push('')
      }
      
      monthDays.forEach((day) => {
        currentWeek.push(day)
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
      })
      
      // Add remaining days to the last week
      if (currentWeek.length > 0) {
        // Fill remaining slots with empty strings
        while (currentWeek.length < 7) {
          currentWeek.push('')
        }
        weeks.push(currentWeek)
      }
      
      months.push({
        name: new Date(currentYear, monthIndex, 1).toLocaleDateString('en-US', { month: 'short' }),
        weeks,
        paddingStart
      })
    }
  }

  // Weekday labels (Monday to Sunday)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Calculate total answers
  const totalAnswers = activities.reduce((sum, activity) => sum + activity.count, 0)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Graph */}
      <div className="overflow-x-auto relative">
        <table className="border-collapse border-spacing-1">
          <thead>
            <tr>
              {/* Empty cell for weekday labels column */}
              <th className="w-8 sticky left-0 z-10" style={{ backgroundColor: token.colorBgContainer }}></th>
              {/* Month headers */}
              {months.map((month, monthIndex) => (
                <th key={monthIndex} className="px-2 text-center">
                  <div className="h-4 flex items-center justify-center text-xs text-gray-500 font-medium mb-1">
                    {month.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 7 rows for weekdays */}
            {weekdays.map((weekday, weekdayIndex) => (
              <tr key={weekdayIndex} className="h-4">
                {/* Weekday label - sticky */}
                <td className="pr-2 text-right sticky left-0 z-10" style={{ backgroundColor: token.colorBgContainer }}>
                  <div className="h-3 flex items-center justify-end text-xs text-gray-500">
                    {weekdayIndex % 2 === 0 ? weekday : ''}
                  </div>
                </td>
                {/* Days for each month */}
                {months.map((month, monthIndex) => (
                  <td key={monthIndex} className="px-1.5 py-0">
                    <div className="flex space-x-1.5">
                      {month.weeks.map((week, weekIndex) => {
                        const day = week[weekdayIndex]
                        if (day === '') {
                          // Empty padding cell
                          return <div key={weekIndex} className="w-3 h-3" />
                        }
                        
                        const count = activityData[day] || 0
                        return (
                          <Tooltip key={weekIndex} title={getTooltipContent(day, count)}>
                            <div
                              className="w-3 h-3 rounded-sm cursor-pointer transition-colors hover:opacity-80"
                              style={{ backgroundColor: getColor(count) }}
                            />
                          </Tooltip>
                        )
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center text-sm text-gray-600">
        <div className="w-8"></div> {/* Spacer for weekday labels column */}
        <div className="flex items-center space-x-2 pl-1.5">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex space-x-1">
            <Tooltip title="No answers">
              <div 
                className="w-3 h-3 rounded-sm cursor-help" 
                style={{ backgroundColor: '#ebedf0' }}
              />
            </Tooltip>
            <Tooltip title="1-2 answers">
              <div 
                className="w-3 h-3 rounded-sm cursor-help" 
                style={{ backgroundColor: '#9be9a8' }}
              />
            </Tooltip>
            <Tooltip title="3-5 answers">
              <div 
                className="w-3 h-3 rounded-sm cursor-help" 
                style={{ backgroundColor: '#40c463' }}
              />
            </Tooltip>
            <Tooltip title="6-10 answers">
              <div 
                className="w-3 h-3 rounded-sm cursor-help" 
                style={{ backgroundColor: '#30a14e' }}
              />
            </Tooltip>
            <Tooltip title="10+ answers">
              <div 
                className="w-3 h-3 rounded-sm cursor-help" 
                style={{ backgroundColor: '#216e39' }}
              />
            </Tooltip>
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
} 