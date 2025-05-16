"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface HistoryRecord {
  date: string
  christCentered: number
  excellence: number
  service: number
  community: number
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

  // Helper to detect dark mode
  function isDarkMode() {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up chart dimensions with space for legend
    const padding = { top: 40, right: 20, bottom: 50, left: 60 }
    const legendWidth = 200 // Space for legend
    const chartWidth = canvas.width - padding.left - padding.right - legendWidth
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Set text color based on theme
    const textColor = isDarkMode() ? "rgba(226, 232, 240, 0.8)" : "rgba(15, 23, 42, 0.8)" // slate-200 for dark, slate-900 for light
    const mutedTextColor = isDarkMode() ? "rgba(148, 163, 184, 0.8)" : "rgba(71, 85, 105, 0.8)" // slate-400 for dark, slate-600 for light

    // Draw background
    ctx.fillStyle = "rgba(255, 255, 255, 0.01)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw axes with modern styling
    ctx.beginPath()
    ctx.strokeStyle = "rgba(226, 232, 240, 0.2)" // Lighter grid lines
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right - legendWidth, canvas.height - padding.bottom)

    // Y-axis
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.stroke()

    // Draw grid lines with modern styling
    ctx.beginPath()
    ctx.strokeStyle = "rgba(241, 245, 249, 0.1)" // Very subtle grid
    ctx.setLineDash([5, 5])

    // Horizontal grid lines (20% intervals)
    for (let i = 1; i <= 4; i++) {
      const y = canvas.height - padding.bottom - chartHeight * (i * 0.2)
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right - legendWidth, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Draw data points and lines
    if (data.length > 0) {
      const xStep = chartWidth / (data.length - 1)

      // Define pillars with modern colors and gradients
      const pillars = [
        { key: "christCentered", color: "#8b5cf6", gradient: ["#8b5cf6", "#7c3aed"], label: "Christ Centered" },
        { key: "excellence", color: "#3b82f6", gradient: ["#3b82f6", "#2563eb"], label: "Excellence" },
        { key: "service", color: "#10b981", gradient: ["#10b981", "#059669"], label: "Service" },
        { key: "community", color: "#f59e0b", gradient: ["#f59e0b", "#d97706"], label: "Community" },
      ]

      // Store all points for hover detection
      const allPoints: {
        x: number
        y: number
        value: number
        pillar: string
        date: string
      }[] = []

      // Draw lines for each pillar with enhanced glow effect
      pillars.forEach((pillar) => {
        // Create gradient for the line
        const gradient = ctx.createLinearGradient(
          padding.left,
          padding.top,
          canvas.width - padding.right - legendWidth,
          canvas.height - padding.bottom
        )
        gradient.addColorStop(0, pillar.gradient[0])
        gradient.addColorStop(1, pillar.gradient[1])

        // Draw glow
        ctx.beginPath()
        ctx.shadowColor = pillar.color
        ctx.shadowBlur = 15
        ctx.strokeStyle = gradient
        ctx.lineWidth = 3

        data.forEach((item, index) => {
          const x = padding.left + index * xStep
          const y = canvas.height - padding.bottom - chartHeight * ((item[pillar.key as keyof HistoryRecord] as number) / 100)

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

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

        // Draw points with enhanced styling
        data.forEach((item, index) => {
          const x = padding.left + index * xStep
          const y = canvas.height - padding.bottom - chartHeight * ((item[pillar.key as keyof HistoryRecord] as number) / 100)

          // Draw point glow
          ctx.beginPath()
          ctx.shadowColor = pillar.color
          ctx.shadowBlur = 10
          ctx.arc(x, y, 6, 0, 2 * Math.PI)
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
          ctx.fill()
          ctx.shadowBlur = 0

          // Draw point with white border
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = "#ffffff"
          ctx.fill()
          ctx.strokeStyle = pillar.color
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw inner point
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fillStyle = gradient
          ctx.fill()
        })
      })

      // Draw x-axis labels with theme-aware styling
      ctx.fillStyle = textColor
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      data.forEach((item, index) => {
        const x = padding.left + index * xStep
        const date = new Date(item.date)
        const label = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
        ctx.fillText(label, x, canvas.height - padding.bottom + 10)
      })

      // Draw y-axis labels with theme-aware styling
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = textColor

      for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding.bottom - chartHeight * (i * 0.2)
        const label = `${i * 20}`
        ctx.fillText(label, padding.left - 10, y)
      }

      // Draw legend outside the chart area
      const legendX = canvas.width - legendWidth + 20
      const legendY = padding.top + 20
      const legendSpacing = 30

      // Draw legend items with theme-aware styling
      pillars.forEach((pillar, index) => {
        const y = legendY + index * legendSpacing

        // Draw line with gradient
        const lineGradient = ctx.createLinearGradient(legendX, y, legendX + 30, y)
        lineGradient.addColorStop(0, pillar.gradient[0])
        lineGradient.addColorStop(1, pillar.gradient[1])

        ctx.beginPath()
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 3
        ctx.moveTo(legendX, y)
        ctx.lineTo(legendX + 30, y)
        ctx.stroke()

        // Draw point with glow
        ctx.beginPath()
        ctx.shadowColor = pillar.color
        ctx.shadowBlur = 8
        ctx.arc(legendX + 15, y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        ctx.strokeStyle = pillar.color
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.shadowBlur = 0

        // Draw inner point
        ctx.beginPath()
        ctx.arc(legendX + 15, y, 2, 0, 2 * Math.PI)
        ctx.fillStyle = lineGradient
        ctx.fill()

        // Draw label with theme-aware styling
        ctx.fillStyle = textColor
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.font = "500 13px Inter, sans-serif"
        ctx.fillText(pillar.label, legendX + 40, y)
      })

      // Add hover detection
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Only detect hover within chart area
        if (mouseX < padding.left || mouseX > canvas.width - padding.right - legendWidth ||
            mouseY < padding.top || mouseY > canvas.height - padding.bottom) {
          setHoveredPoint(null)
          canvas.style.cursor = "default"
          return
        }

        let closestPoint = null
        let minDistance = Number.MAX_VALUE

        allPoints.forEach((point) => {
          const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2))
          if (distance < 15 && distance < minDistance) {
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

      // Draw tooltip with theme-aware styling
      if (hoveredPoint) {
        const tooltipWidth = 180
        const tooltipHeight = 80
        let tooltipX = hoveredPoint.x - tooltipWidth / 2
        const tooltipY = hoveredPoint.y - tooltipHeight - 15

        // Ensure tooltip stays within chart area
        if (tooltipX < padding.left) tooltipX = padding.left
        if (tooltipX + tooltipWidth > canvas.width - padding.right - legendWidth) {
          tooltipX = canvas.width - padding.right - legendWidth - tooltipWidth
        }

        // Draw tooltip background with theme-aware styling
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
        ctx.shadowBlur = 15
        ctx.fillStyle = isDarkMode() 
          ? "rgba(15, 23, 42, 0.95)" // slate-900 with high opacity for dark mode
          : "rgba(255, 255, 255, 0.95)" // white with high opacity for light mode
        ctx.beginPath()
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8)
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw tooltip border with theme-aware styling
        ctx.strokeStyle = isDarkMode() 
          ? "rgba(226, 232, 240, 0.1)" // slate-200 with low opacity for dark mode
          : "rgba(15, 23, 42, 0.1)" // slate-900 with low opacity for light mode
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw tooltip content with theme-aware styling
        ctx.fillStyle = isDarkMode() ? "#ffffff" : "#0f172a" // white for dark mode, slate-900 for light mode
        ctx.font = "600 13px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(hoveredPoint.pillar, tooltipX + tooltipWidth / 2, tooltipY + 12)

        ctx.font = "500 20px Inter, sans-serif"
        ctx.fillText(`${hoveredPoint.value.toFixed(0)}`, tooltipX + tooltipWidth / 2, tooltipY + 32)

        const date = new Date(hoveredPoint.date)
        const formattedDate = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
        ctx.font = "400 12px Inter, sans-serif"
        ctx.fillStyle = isDarkMode() 
          ? "rgba(226, 232, 240, 0.7)" // slate-200 with opacity for dark mode
          : "rgba(15, 23, 42, 0.7)" // slate-900 with opacity for light mode
        ctx.fillText(formattedDate, tooltipX + tooltipWidth / 2, tooltipY + 60)
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
