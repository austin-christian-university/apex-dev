"use client"

import { useState } from "react"
import { Plus, Minus, Camera, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

const PILLAR_COLORS = {
  academic: "from-blue-500 to-cyan-400",
  spiritual: "from-purple-500 to-indigo-400",
  physical: "from-green-500 to-emerald-400",
  social: "from-orange-500 to-amber-400",
}

interface ScoreAdjusterProps {
  studentId: string
  studentName: string
  onScoreChange?: (pillar: string, change: number, comment?: string, evidence?: string) => void
}

export function ScoreAdjuster({ studentId, studentName, onScoreChange }: ScoreAdjusterProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [changeAmount, setChangeAmount] = useState(1)

  const handleScoreChange = (pillar: string, change: number) => {
    setSelectedPillar(pillar)
    setChangeAmount(change)
    setIsDialogOpen(true)
  }

  const submitChange = () => {
    if (selectedPillar && onScoreChange) {
      onScoreChange(selectedPillar, changeAmount, comment, evidenceUrl)
    }
    setIsDialogOpen(false)
    setComment("")
    setEvidenceUrl("")
  }

  const pillars = [
    { id: "academic", name: "Academic Excellence", description: "Scholarly achievements and intellectual growth" },
    { id: "spiritual", name: "Spiritual Formation", description: "Faith development and spiritual practices" },
    { id: "physical", name: "Physical Wellness", description: "Health, fitness, and physical well-being" },
    { id: "social", name: "Social Responsibility", description: "Community engagement and interpersonal skills" },
  ]

  return (
    <>
      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${studentName.charAt(0)}`} />
            <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{studentName}</h3>
            <p className="text-sm text-muted-foreground">Adjust Four Pillars scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-indigo-500/10">
                <div className={`h-2 bg-gradient-to-r ${PILLAR_COLORS[pillar.id as keyof typeof PILLAR_COLORS]}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pillar.name}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:border-red-800 transition-all duration-200"
                      onClick={() => handleScoreChange(pillar.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="text-center">
                      <span className="text-sm font-medium text-muted-foreground">Adjust Score</span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 border-green-200 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:border-green-800 transition-all duration-200"
                      onClick={() => handleScoreChange(pillar.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {changeAmount > 0 ? "Increase" : "Decrease"}{" "}
              {selectedPillar && selectedPillar.charAt(0).toUpperCase() + selectedPillar.slice(1)} Score
            </DialogTitle>
            <DialogDescription>Add a comment and optional evidence for this score change.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Why are you adjusting this score?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="evidence">Evidence (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="evidence"
                  placeholder="Upload or enter URL"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={submitChange}>
              <Check className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
