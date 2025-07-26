"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

interface CompanyStanding {
  name: string
  totalScore: number
  studentCount: number
  averageScore: number
}

interface CompanyStandingsProps {
  standings: CompanyStanding[]
}

export function CompanyStandings({ standings }: CompanyStandingsProps) {
  const { theme } = useTheme()

  const getCardStyles = (index: number) => {
    const isDark = theme === 'dark'
    
    if (isDark) {
      return {
        first: "bg-yellow-950/50 border-yellow-800/50 text-yellow-100",
        second: "bg-gray-800/50 border-gray-700/50 text-gray-100",
        third: "bg-orange-950/50 border-orange-800/50 text-orange-100",
        fourth: "bg-blue-950/50 border-blue-800/50 text-blue-100"
      }[index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth']
    }
    
    return {
      first: "bg-yellow-50 border-yellow-200 text-yellow-900",
      second: "bg-gray-50 border-gray-200 text-gray-900",
      third: "bg-orange-50 border-orange-200 text-orange-900",
      fourth: "bg-blue-50 border-blue-200 text-blue-900"
    }[index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth']
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Company Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {standings.map((standing: CompanyStanding, index: number) => (
              <div
                key={standing.name}
                className={`p-3 rounded-lg border transition-colors ${getCardStyles(index)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{standing.name}</span>
                  <span className="text-xs opacity-80">
                    {index + 1}{index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"}
                  </span>
                </div>
                <div className="text-xl font-bold">{standing.totalScore}</div>
                <div className="text-xs opacity-80">
                  Avg: {standing.averageScore} pts/student
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 