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

  // Helper to detect dark mode
  function isDarkMode() {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  }

  // Set canvas size based on the size prop
  const getCanvasSize = () => {
    switch (size) {
      case "sm":
        return 220
      case "md":
        return 320
      case "lg":
        return 420
      default:
        return 320
    }
  }

  const canvasSize = getCanvasSize()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up radar chart
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.75

    // Draw background circles
    ctx.strokeStyle = "rgba(226, 232, 240, 0.5)" // slate-200 with opacity
    ctx.fillStyle = "rgba(248, 250, 252, 0.1)" // slate-50 with opacity

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
      ctx.strokeStyle = "rgba(226, 232, 240, 0.5)" // slate-200 with opacity
      ctx.stroke()

      // Add value labels on the top axis
      if (i > 0) {
        const value = i * 20
        const labelY = centerY - gridRadius - 5
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)" // slate-400 with opacity
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
    ctx.strokeStyle = "rgba(226, 232, 240, 0.5)" // slate-200 with opacity
    ctx.stroke()

    // Draw data
    const values = [
      data.christCentered.score / 100,
      data.excellence.score / 100,
      data.service.score / 100,
      data.community.score / 100,
    ]

    // Draw filled area
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
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)" // blue-500 with opacity
    ctx.fill()

    // Draw outline with glow effect
    ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
    ctx.shadowBlur = 10
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
    ctx.strokeStyle = "#3b82f6" // blue-500
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw points
    const pointPositions: { x: number; y: number; label: string; value: number }[] = []
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 2 + (i * Math.PI) / 2
      const value = values[i]
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      // Draw outer glow
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)" // blue-500 with opacity
      ctx.fill()

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "#ffffff" // white
      ctx.fill()
      ctx.strokeStyle = "#3b82f6" // blue-500
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.fill()

      pointPositions.push({ x, y, label: getLabel(i), value: values[i] * 100 })
    }

    // Draw labels
    ctx.font = `500 ${size === "sm" ? 12 : 14}px Inter, sans-serif`
    ctx.fillStyle = isDarkMode() ? "#fff" : "#1e293b" // white for dark, slate-800 for light
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Offset for labels to avoid cut-off
    const labelOffset = 36
    // Christ Centered (top)
    ctx.fillText("Christ Centered", centerX, centerY - radius - labelOffset)
    // Excellence (right)
    ctx.fillText("Excellence", centerX + radius + labelOffset, centerY)
    // Service (bottom)
    ctx.fillText("Service", centerX, centerY + radius + labelOffset)
    // Community (left)
    ctx.fillText("Community", centerX - radius - labelOffset, centerY)

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
  }, [data, size, canvasSize, hoveredValue, hoveredPosition])

  // Helper function to get label based on index
  function getLabel(index: number): string {
    switch (index) {
      case 0:
        return "Christ Centered"
      case 1:
        return "Excellence"
      case 2:
        return "Service"
      case 3:
        return "Community"
      default:
        return ""
    }
  }

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
      <CardContent className="flex justify-center p-4">
        <div className="relative">
          <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="max-w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
