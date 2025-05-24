"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Student } from "@/lib/data"
import { History } from "lucide-react"
import { ScoreHistoryModal } from "./score-history-modal"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const scoreCategories = [
  "lionGames",
  "attendance",
  "leadershipRoles",
  "serviceHours",
  "apartmentChecks",
  "eventExecution",
  "grades",
] as const

const attendanceSubcategories = [
  "Small Groups",
  "Serving in Church",
  "Chapel",
  "Fellow Friday",
  "GBE Leadership",
  "Class",
  "ACU Hangs",
  "Company Hangs",
] as const

const eventSubcategories = [
  "Sunday Serve Booth",
  "Preview Day",
  "Recruitment Event",
  "Fellow Fridays",
] as const

const lionGamesPlacements = [
  { value: "1st", points: 30 },
  { value: "2nd", points: 20 },
  { value: "3rd", points: 10 },
  { value: "4th", points: 0 },
] as const

const attendanceStatus = [
  { value: "present", label: "Present", points: 10 },
  { value: "tardy", label: "Tardy", points: -5 },
  { value: "absent", label: "Absent", points: -10 },
] as const

const apartmentCleanliness = [
  { value: "clean", label: "Clean", points: 10 },
  { value: "neutral", label: "Neutral", points: 0 },
  { value: "dirty", label: "Dirty", points: -10 },
] as const

const eventPerformance = [
  { value: "exceeds", label: "Exceeds Expectations", points: 25 },
  { value: "meets", label: "Met Expectations", points: 0 },
  { value: "unmet", label: "Unmet Expectations", points: -50 },
] as const

const gpaRanges = [
  { min: 3.80, max: 4.00, points: 100 },
  { min: 3.60, max: 3.79, points: 50 },
  { min: 3.40, max: 3.59, points: 20 },
  { min: 3.20, max: 3.39, points: 0 },
  { min: 3.00, max: 3.19, points: -20 },
  { min: 2.50, max: 2.99, points: -50 },
  { min: 2.00, max: 2.49, points: -100 },
  { min: 0.00, max: 1.99, points: -500 },
] as const

// Base schema that will be extended based on category
const baseSchema = z.object({
  category: z.enum(scoreCategories),
  date: z.string().optional(),
})

// Category-specific schemas
const lionGamesSchema = z.object({
  placement: z.enum(["1st", "2nd", "3rd", "4th"]),
})

const attendanceSchema = z.object({
  subcategory: z.enum(attendanceSubcategories),
  status: z.enum(["present", "tardy", "absent"]),
})

const serviceHoursSchema = z.object({
  hours: z.number().min(0, "Hours cannot be negative"),
})

const apartmentChecksSchema = z.object({
  cleanliness: z.enum(["clean", "neutral", "dirty"]),
})

const eventExecutionSchema = z.object({
  subcategory: z.enum(eventSubcategories),
  performance: z.enum(["exceeds", "meets", "unmet"]),
})

const gradesSchema = z.object({
  gpa: z.number()
    .min(0, "GPA must be between 0 and 4")
    .max(4, "GPA must be between 0 and 4"),
})

// Dynamic schema based on category
const formSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("lionGames"),
    placement: z.enum(["1st", "2nd", "3rd", "4th"]),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("attendance"),
    subcategory: z.enum(attendanceSubcategories),
    status: z.enum(["present", "tardy", "absent"]),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("serviceHours"),
    hours: z.number().min(0, "Hours cannot be negative"),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("apartmentChecks"),
    cleanliness: z.enum(["clean", "neutral", "dirty"]),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("eventExecution"),
    subcategory: z.enum(eventSubcategories),
    performance: z.enum(["exceeds", "meets", "unmet"]),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("grades"),
    gpa: z.number()
      .min(0, "GPA must be between 0 and 4")
      .max(4, "GPA must be between 0 and 4"),
    date: z.string().optional(),
  }),
  z.object({
    category: z.literal("leadershipRoles"),
    pointChange: z.number(),
    date: z.string().optional(),
  }),
])

type FormData = z.infer<typeof formSchema>

interface EditScoreModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onSubmit: (data: FormData & { pointChange: number; description: string }) => Promise<void>
}

const inputStyles = "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/50 dark:text-foreground"
const formMessageStyles = "text-destructive dark:text-destructive"

// Type definitions for each category's data
type LionGamesData = {
  category: "lionGames"
  placement: "1st" | "2nd" | "3rd" | "4th"
  date?: string
}

type AttendanceData = {
  category: "attendance"
  subcategory: typeof attendanceSubcategories[number]
  status: "present" | "tardy" | "absent"
  date?: string
}

type ServiceHoursData = {
  category: "serviceHours"
  hours: number
  date?: string
}

type ApartmentChecksData = {
  category: "apartmentChecks"
  cleanliness: "clean" | "neutral" | "dirty"
  date?: string
}

type EventExecutionData = {
  category: "eventExecution"
  subcategory: typeof eventSubcategories[number]
  performance: "exceeds" | "meets" | "unmet"
  date?: string
}

type GradesData = {
  category: "grades"
  gpa: number
  date?: string
}

type LeadershipRolesData = {
  category: "leadershipRoles"
  pointChange: number
  date?: string
}

// Type guards
const isLionGamesData = (data: FormData): data is LionGamesData => data.category === "lionGames"
const isAttendanceData = (data: FormData): data is AttendanceData => data.category === "attendance"
const isServiceHoursData = (data: FormData): data is ServiceHoursData => data.category === "serviceHours"
const isApartmentChecksData = (data: FormData): data is ApartmentChecksData => data.category === "apartmentChecks"
const isEventExecutionData = (data: FormData): data is EventExecutionData => data.category === "eventExecution"
const isGradesData = (data: FormData): data is GradesData => data.category === "grades"
const isLeadershipRolesData = (data: FormData): data is LeadershipRolesData => data.category === "leadershipRoles"

const formatCategoryName = (category: string) => {
  const words = category.replace(/([A-Z])/g, ' $1').trim().split(' ')
  return words.map((word, index) => 
    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
  ).join(' ')
}

export function EditScoreModal({ isOpen, onClose, student, onSubmit }: EditScoreModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "lionGames",
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedCategory = form.watch("category")
  const selectedSubcategory = form.watch("subcategory")

  const calculatePoints = (data: FormData): number => {
    if (isLionGamesData(data)) {
      return lionGamesPlacements.find(p => p.value === data.placement)?.points ?? 0
    }
    
    if (isAttendanceData(data)) {
      if (data.subcategory === "ACU Hangs" || data.subcategory === "Company Hangs") {
        return data.status === "present" ? 10 : 0
      }
      return attendanceStatus.find(s => s.value === data.status)?.points ?? 0
    }
    
    if (isServiceHoursData(data)) {
      const hours = data.hours
      return hours >= 12 ? 0 : (hours - 12) * -25
    }
    
    if (isApartmentChecksData(data)) {
      return apartmentCleanliness.find(c => c.value === data.cleanliness)?.points ?? 0
    }
    
    if (isEventExecutionData(data)) {
      return eventPerformance.find(p => p.value === data.performance)?.points ?? 0
    }
    
    if (isGradesData(data)) {
      const gpa = data.gpa
      const range = gpaRanges.find(r => gpa >= r.min && gpa <= r.max)
      return range?.points ?? -500
    }
    
    if (isLeadershipRolesData(data)) {
      return data.pointChange
    }
    
    return 0
  }

  const generateDescription = (data: FormData): string => {
    if (isLionGamesData(data)) {
      return `Lion Games: ${data.placement} place`
    }
    
    if (isAttendanceData(data)) {
      const status = attendanceStatus.find(s => s.value === data.status)
      if ((data.subcategory === "ACU Hangs" || data.subcategory === "Company Hangs") && data.status !== "present") {
        return `${data.subcategory}: ${status?.label} (no points)`
      }
      return `${data.subcategory}: ${status?.label}`
    }
    
    if (isServiceHoursData(data)) {
      return `Service Hours: ${data.hours} hours`
    }
    
    if (isApartmentChecksData(data)) {
      return `Apartment Check: ${apartmentCleanliness.find(c => c.value === data.cleanliness)?.label}`
    }
    
    if (isEventExecutionData(data)) {
      return `${data.subcategory}: ${eventPerformance.find(p => p.value === data.performance)?.label}`
    }
    
    if (isGradesData(data)) {
      return `GPA Update: ${data.gpa}`
    }
    
    if (isLeadershipRolesData(data)) {
      return `Leadership Role: ${data.pointChange} points`
    }
    
    return ""
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const points = calculatePoints(data)
      const description = generateDescription(data)
      
      await onSubmit({
        ...data,
        pointChange: points,
        description,
      })
      
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Score for {student.name}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-foreground">Score Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="dark:text-foreground">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scoreCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {formatCategoryName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className={formMessageStyles} />
                  </FormItem>
                )}
              />

              {selectedCategory === "lionGames" && (
                <FormField
                  control={form.control}
                  name="placement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-foreground">Placement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:text-foreground">
                            <SelectValue placeholder="Select placement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lionGamesPlacements.map((placement) => (
                            <SelectItem key={placement.value} value={placement.value}>
                              {placement.value} Place (+{placement.points} points)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className={formMessageStyles} />
                    </FormItem>
                  )}
                />
              )}

              {selectedCategory === "attendance" && (
                <>
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-foreground">Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:text-foreground">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {attendanceSubcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className={formMessageStyles} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-foreground">Attendance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:text-foreground">
                              <SelectValue placeholder="Select attendance status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {attendanceStatus.map((status) => {
                              const isSpecialCase = selectedSubcategory === "ACU Hangs" || selectedSubcategory === "Company Hangs"
                              const pointsDisplay = isSpecialCase && status.value !== "present" 
                                ? "(no points)" 
                                : `(${status.points > 0 ? '+' : ''}${status.points} points)`
                              
                              return (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label} {pointsDisplay}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage className={formMessageStyles} />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedCategory === "serviceHours" && (
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-foreground">Number of Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of hours"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={inputStyles}
                        />
                      </FormControl>
                      <FormMessage className={formMessageStyles} />
                    </FormItem>
                  )}
                />
              )}

              {selectedCategory === "apartmentChecks" && (
                <FormField
                  control={form.control}
                  name="cleanliness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-foreground">Cleanliness</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:text-foreground">
                            <SelectValue placeholder="Select cleanliness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {apartmentCleanliness.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label} ({level.points > 0 ? '+' : ''}{level.points} points)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className={formMessageStyles} />
                    </FormItem>
                  )}
                />
              )}

              {selectedCategory === "eventExecution" && (
                <>
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-foreground">Event</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:text-foreground">
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventSubcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className={formMessageStyles} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-foreground">Performance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:text-foreground">
                              <SelectValue placeholder="Select performance level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventPerformance.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label} ({level.points > 0 ? '+' : ''}{level.points} points)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className={formMessageStyles} />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedCategory === "grades" && (
                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-foreground">GPA</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          placeholder="Enter GPA (0.00 - 4.00)"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={inputStyles}
                        />
                      </FormControl>
                      <FormMessage className={formMessageStyles} />
                    </FormItem>
                  )}
                />
              )}

              {selectedCategory === "leadershipRoles" && (
                <FormField
                  control={form.control}
                  name="pointChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-foreground">Point Change</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter point change"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={inputStyles}
                        />
                      </FormControl>
                      <FormMessage className={formMessageStyles} />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-foreground">Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage className={formMessageStyles} />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Score"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setIsHistoryModalOpen(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Edit History
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ScoreHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        student={student}
      />
    </>
  )
} 