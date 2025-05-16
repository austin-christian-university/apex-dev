"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface HistoryRecord {
  date: string
  academic: number
  spiritual: number
  physical: number
  social: number
}

interface HistoricalChartProps {
  data: HistoryRecord[]
  height?: number
}

export function HistoricalChart({ data, height = 300 }: HistoricalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    value: number
    pillar: string
    date: string
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up chart dimensions
    const padding = 50
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Draw background
    ctx.fillStyle = "rgba(255, 255, 255, 0.01)" // Almost transparent
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "rgba(226, 232, 240, 0.3)" // slate-200 with opacity
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)

    // Y-axis
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "rgba(241, 245, 249, 0.15)" // slate-100 with opacity
    ctx.setLineDash([5, 5])

    // Horizontal grid lines (20% intervals)
    for (let i = 1; i <= 4; i++) {
      const y = canvas.height - padding - chartHeight * (i * 0.2)
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Draw data points and lines
    if (data.length > 0) {
      const xStep = chartWidth / (data.length - 1)

      // Draw lines for each pillar
      const pillars = [
        { key: "academic", color: "#3b82f6", label: "Academic" }, // blue-500
        { key: "spiritual", color: "#8b5cf6", label: "Spiritual" }, // violet-500
        { key: "physical", color: "#10b981", label: "Physical" }, // emerald-500
        { key: "social", color: "#f59e0b", label: "Social" }, // amber-500
      ]

      // Store all points for hover detection
      const allPoints: {
        x: number
        y: number
        value: number
        pillar: string
        date: string
      }[] = []

      // Draw lines for each pillar with glow effect
      pillars.forEach((pillar) => {
        // Draw glow
        ctx.beginPath()
        ctx.shadowColor = pillar.color
        ctx.shadowBlur = 10
        ctx.strokeStyle = pillar.color
        ctx.lineWidth = 2.5

        data.forEach((item, index) => {
          const x = padding + index * xStep
          const y = canvas.height - padding - chartHeight * ((item[pillar.key as keyof HistoryRecord] as number) / 100)

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          // Store point for hover detection
          allPoints.push({
            x,
            y,
            value: item[pillar.key as keyof HistoryRecord] as number,
            pillar: pillar.label,
            date: item.date,
          })
        })

        ctx.stroke()
        ctx.shadowBlur = 0

        // Draw points
        data.forEach((item, index) => {
          const x = padding + index * xStep
          const y = canvas.height - padding - chartHeight * ((item[pillar.key as keyof HistoryRecord] as number) / 100)

          // Draw point with white border
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = "#ffffff"
          ctx.fill()
          ctx.strokeStyle = pillar.color
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw inner point
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, 2 * Math.PI)
          ctx.fillStyle = pillar.color
          ctx.fill()
        })
      })

      // Draw x-axis labels (dates)
      ctx.fillStyle = "rgba(100, 116, 139, 0.8)" // slate-500 with opacity
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      data.forEach((item, index) => {
        const x = padding + index * xStep
        const date = new Date(item.date)
        const label = `${date.getMonth() + 1}/${date.getFullYear()}`
        ctx.fillText(label, x, canvas.height - padding + 10)
      })

      // Draw y-axis labels
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - chartHeight * (i * 0.2)
        const label = `${i * 20}`
        ctx.fillText(label, padding - 10, y)
      }

      // Draw legend
      const legendX = padding + 20
      const legendY = padding + 20
      const legendSpacing = 25
      const legendItemWidth = 100

      // Draw legend background
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(
        legendX - 10,
        legendY - 15,
        Math.max(...pillars.map((p) => p.label.length)) * 8 + 50,
        pillars.length * legendSpacing + 10,
      )
      ctx.strokeStyle = "rgba(226, 232, 240, 0.3)" // slate-200 with opacity
      ctx.strokeRect(
        legendX - 10,
        legendY - 15,
        Math.max(...pillars.map((p) => p.label.length)) * 8 + 50,
        pillars.length * legendSpacing + 10,
      )

      pillars.forEach((pillar, index) => {
        const y = legendY + index * legendSpacing

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = pillar.color
        ctx.lineWidth = 2
        ctx.moveTo(legendX, y)
        ctx.lineTo(legendX + 20, y)
        ctx.stroke()

        // Draw point
        ctx.beginPath()
        ctx.arc(legendX + 10, y, 3, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        ctx.strokeStyle = pillar.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Draw inner point
        ctx.beginPath()
        ctx.arc(legendX + 10, y, 1.5, 0, 2 * Math.PI)
        ctx.fillStyle = pillar.color
        ctx.fill()

        // Draw label
        ctx.fillStyle = "rgba(51, 65, 85, 0.9)" // slate-700 with opacity
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.font = "12px Inter, sans-serif"
        ctx.fillText(pillar.label, legendX + 30, y)
      })

      // Add hover detection
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Find closest point
        let closestPoint = null
        let minDistance = Number.MAX_VALUE

        allPoints.forEach((point) => {
          const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2))
          if (distance < 15 && distance < minDistance) {
            // 15px hit area
            minDistance = distance
            closestPoint = point
          }
        })

        if (closestPoint) {
          setHoveredPoint(closestPoint)
          canvas.style.cursor = "pointer"
        } else {
          setHoveredPoint(null)
          canvas.style.cursor = "default"
        }
      }

      canvas.onmouseleave = () => {
        setHoveredPoint(null)
      }

      // Draw tooltip if hovering over a point
      if (hoveredPoint) {
        const tooltipWidth = 150
        const tooltipHeight = 70
        let tooltipX = hoveredPoint.x - tooltipWidth / 2
        const tooltipY = hoveredPoint.y - tooltipHeight - 10

        // Ensure tooltip stays within canvas
        if (tooltipX < 10) tooltipX = 10
        if (tooltipX + tooltipWidth > canvas.width - 10) tooltipX = canvas.width - tooltipWidth - 10

        // Draw tooltip background with glow
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 10
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)" // slate-900 with opacity
        ctx.beginPath()
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4)
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw tooltip content
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(hoveredPoint.pillar, tooltipX + tooltipWidth / 2, tooltipY + 10)

        ctx.font = "12px Inter, sans-serif"
        ctx.fillText(`Value: ${hoveredPoint.value.toFixed(0)}`, tooltipX + tooltipWidth / 2, tooltipY + 30)

        const date = new Date(hoveredPoint.date)
        const formattedDate = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
        ctx.fillText(formattedDate, tooltipX + tooltipWidth / 2, tooltipY + 50)
      }
    }
  }, [data, hoveredPoint])

  return (
    <Card className="shadow-card border border-border/60 overflow-hidden card-glow transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-900 dark:text-blue-100">Historical Progress</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This chart shows the student's progress across all four pillars over time.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Four Pillars Index progress over time</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          <canvas ref={canvasRef} width={800} height={height} className="w-full" />
          <div className="absolute bottom-2 right-2 bg-background/80 dark:bg-background/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground border border-border/60">
            Hover over points for details
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
