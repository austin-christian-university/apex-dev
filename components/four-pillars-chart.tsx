"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface FourPillarsChartProps {
  data: {
    christCentered: { score: number; subcategories: Record<string, number> }
    excellence: { score: number; subcategories: Record<string, number> }
    service: { score: number; subcategories: Record<string, number> }
    community: { score: number; subcategories: Record<string, number> }
  }
  size?: "sm" | "md" | "lg"
}

export function FourPillarsChart({ data, size = "md" }: FourPillarsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredValue, setHoveredValue] = useState<{ label: string; value: number } | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDark, setIsDark] = useState(false)

  // Helper to detect dark mode
  function isDarkMode() {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  }

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(isDarkMode())
        }
      })
    })

    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, { attributes: true })

    // Set initial theme state
    setIsDark(isDarkMode())

    return () => observer.disconnect()
  }, [])

  // Set canvas size based on the size prop
  const getCanvasSize = () => {
    switch (size) {
      case "sm":
        return 280
      case "md":
        return 380
      case "lg":
        return 480
      default:
        return 380
    }
  }

  const canvasSize = getCanvasSize()

  // Define pillar colors
  const pillars = [
    { key: "christCentered", label: "Christ Centered", color: "#8b5cf6", gradient: ["#8b5cf6", "#7c3aed"] }, // purple
    { key: "excellence", label: "Excellence", color: "#3b82f6", gradient: ["#3b82f6", "#2563eb"] }, // blue
    { key: "service", label: "Service", color: "#10b981", gradient: ["#10b981", "#059669"] }, // emerald
    { key: "community", label: "Community", color: "#f59e0b", gradient: ["#f59e0b", "#d97706"] }, // amber
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up radar chart with more space for legend
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.7 // Increased back to 0.7 since we don't need space for labels

    // Draw background circles
    ctx.strokeStyle = isDark ? "rgba(226, 232, 240, 0.2)" : "rgba(15, 23, 42, 0.2)" // slate-200/900 with opacity
    ctx.fillStyle = isDark ? "rgba(248, 250, 252, 0.05)" : "rgba(241, 245, 249, 0.1)" // slate-50/100 with opacity

    // Draw filled background
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 2 + (i * Math.PI) / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()

    // Draw grid lines with labels
    for (let i = 1; i <= 5; i++) {
      const gridRadius = radius * (i / 5)

      // Draw grid circle
      ctx.beginPath()
      for (let j = 0; j < 4; j++) {
        const angle = Math.PI / 2 + (j * Math.PI) / 2
        const x = centerX + gridRadius * Math.cos(angle)
        const y = centerY + gridRadius * Math.sin(angle)
        if (j === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = isDark ? "rgba(226, 232, 240, 0.2)" : "rgba(15, 23, 42, 0.2)" // slate-200/900 with opacity
      ctx.stroke()

      // Add value labels on the top axis
      if (i > 0) {
        const value = i * 20
        const labelY = centerY - gridRadius - 5
        ctx.fillStyle = isDark ? "rgba(226, 232, 240, 0.8)" : "rgba(15, 23, 42, 0.8)" // slate-200/900 with opacity
        ctx.font = `${size === "sm" ? 8 : 10}px Inter, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        ctx.fillText(`${value}`, centerX, labelY)
      }
    }

    // Draw axes
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 2 + (i * Math.PI) / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = isDark ? "rgba(226, 232, 240, 0.2)" : "rgba(15, 23, 42, 0.2)" // slate-200/900 with opacity
    ctx.stroke()

    // Draw data with pillar-specific colors
    const values = pillars.map(pillar => data[pillar.key as keyof typeof data].score / 100)

    // Draw filled area with gradient
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 2 + (i * Math.PI) / 2
      const value = values[i]
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)" // Lighter fill
    ctx.fill()

    // Draw lines and points for each pillar
    const pointPositions: { x: number; y: number; label: string; value: number }[] = []
    pillars.forEach((pillar, i) => {
      const angle = Math.PI / 2 + (i * Math.PI) / 2
      const value = values[i]
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      // Draw line to point
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = pillar.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw point with glow
      ctx.beginPath()
      ctx.shadowColor = pillar.color
      ctx.shadowBlur = 10
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = `${pillar.color}33` // 20% opacity
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.strokeStyle = pillar.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw inner point
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = pillar.color
      ctx.fill()

      // Store point position for hover detection
      pointPositions.push({ x, y, label: pillar.label, value: values[i] * 100 })
    })

    // Draw legend at the bottom
    const legendHeight = 60
    const legendY = canvas.height - legendHeight
    const legendItemWidth = canvas.width / pillars.length
    const legendItemHeight = 40
    const legendItemSpacing = 10

    pillars.forEach((pillar, i) => {
      const x = i * legendItemWidth + legendItemWidth / 2
      const y = legendY + legendItemHeight / 2

      // Draw legend line
      ctx.beginPath()
      ctx.strokeStyle = pillar.color
      ctx.lineWidth = 2
      ctx.moveTo(x - 20, y)
      ctx.lineTo(x + 20, y)
      ctx.stroke()

      // Draw legend point
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = pillar.color
      ctx.fill()

      // Draw legend text
      ctx.fillStyle = isDark ? "#fff" : "#1e293b"
      ctx.font = "500 12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(pillar.label, x, y + 20)

      // Draw value
      ctx.font = "600 14px Inter, sans-serif"
      ctx.fillText(`${Math.round(values[i] * 100)}`, x, y - 15)
    })

    // Add hover detection
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let found = false
      for (const point of pointPositions) {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
        if (distance <= 15) {
          // Increased hit area for better UX
          setHoveredValue({ label: point.label, value: point.value })
          setHoveredPosition({ x: point.x, y: point.y })
          found = true
          canvas.style.cursor = "pointer"
          break
        }
      }

      if (!found) {
        setHoveredValue(null)
        setHoveredPosition(null)
        canvas.style.cursor = "default"
      }
    }

    canvas.onmouseleave = () => {
      setHoveredValue(null)
      setHoveredPosition(null)
    }

    // Draw tooltip if hovering over a point
    if (hoveredValue && hoveredPosition) {
      const tooltipWidth = 100
      const tooltipHeight = 40
      const tooltipX = hoveredPosition.x - tooltipWidth / 2
      const tooltipY = hoveredPosition.y - tooltipHeight - 10

      // Draw tooltip background
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)" // slate-900 with opacity
      ctx.beginPath()
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4)
      ctx.fill()

      // Draw tooltip text
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${hoveredValue.label}`, hoveredPosition.x, tooltipY + tooltipHeight / 3)
      ctx.fillText(`${hoveredValue.value.toFixed(0)}`, hoveredPosition.x, tooltipY + (tooltipHeight * 2) / 3)
    }
  }, [data, size, canvasSize, hoveredValue, hoveredPosition, isDark])

  // Calculate overall score
  const overallScore = Math.round(
    (data.christCentered.score + data.excellence.score + data.service.score + data.community.score) / 4
  )

  return (
    <Card className="shadow-card border border-border/60 overflow-hidden card-glow transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary/10 dark:to-transparent border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary-900 dark:text-primary-100">Four Pillars Index</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The Four Pillars Index represents a student's performance across the university's core values.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="flex items-center">
          <span className="font-medium text-primary mr-1">{overallScore}</span>/100 Overall Score
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <div className="relative w-full aspect-square max-w-[90%] mx-auto">
          <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="w-full h-full object-contain" />
        </div>
      </CardContent>
    </Card>
  )
}
