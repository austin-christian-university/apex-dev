"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

interface CompanyHistoryPoint {
  date: string
  [key: string]: number | string // company names as keys
}

interface CompanyHistoryProps {
  companyStandings: { name: string; totalScore: number }[]
}

// Custom tooltip component for dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg border shadow-lg ${
        isDark 
          ? "bg-gray-900 border-gray-700 text-gray-100" 
          : "bg-white border-gray-200 text-gray-900"
      }`}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Generate company history data
const generateCompanyHistory = (finalScores: { name: string; totalScore: number }[]): CompanyHistoryPoint[] => {
  const startDate = new Date("2024-07-01")
  const endDate = new Date("2025-05-01")
  const history: CompanyHistoryPoint[] = []
  
  // Generate monthly data points for consistent spacing
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const point: CompanyHistoryPoint = {
      date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    
    // Calculate progress percentage based on date
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const currentDays = (d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const progress = Math.min(currentDays / totalDays, 1)
    
    // Generate scores that progress linearly from 0 to final score
    finalScores.forEach(company => {
      const targetScore = company.totalScore
      const currentScore = Math.round(targetScore * progress)
      
      // Add more variability in the first semester (first 4 months)
      const isFirstSemester = currentDays < (totalDays * 0.4) // First 40% of the time
      let fluctuation = 0
      
      if (isFirstSemester) {
        // Higher variability in first semester (±15% of current score)
        fluctuation = (Math.random() - 0.5) * (currentScore * 0.3)
        
        // Add occasional larger spikes or drops
        if (Math.random() < 0.2) { // 20% chance of a significant event
          fluctuation = Math.random() < 0.5 
            ? currentScore * 0.2  // 20% spike
            : -currentScore * 0.15 // 15% drop
        }
      } else {
        // Lower variability in second semester (±5% of current score)
        fluctuation = (Math.random() - 0.5) * (currentScore * 0.1)
      }
      
      point[company.name] = Math.max(0, Math.round(currentScore + fluctuation))
    })
    
    history.push(point)
  }
  
  return history
}

export function CompanyHistory({ companyStandings }: CompanyHistoryProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const history = generateCompanyHistory(companyStandings)

  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const axisColor = isDark ? '#4b5563' : '#d1d5db'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Company Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: textColor, fontSize: 16 }}
                  axisLine={{ stroke: axisColor }}
                  tickLine={{ stroke: axisColor }}
                  interval={0} // Show all ticks
                  minTickGap={50} // Minimum gap between ticks
                  angle={-45} // Angle the labels for better readability
                  textAnchor="end" // Align the end of the text with the tick
                  height={60} // Increase height to accommodate angled labels
                />
                <YAxis 
                  tick={{ fill: textColor, fontSize: 16 }}
                  axisLine={{ stroke: axisColor }}
                  tickLine={{ stroke: axisColor }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: textColor,
                    paddingTop: "20px" // Add some padding to account for angled labels
                  }}
                />
                <Line
                  type="linear"
                  dataKey="Alpha Company"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="Bravo Company"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="Charlie Company"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="Delta Company"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 