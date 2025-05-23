"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Student } from "@/lib/data"

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

const formSchema = z.object({
  category: z.enum(scoreCategories),
  pointChange: z.number()
    .min(-100, "Point change must be between -100 and 100")
    .max(100, "Point change must be between -100 and 100"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditScoreModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onSubmit: (data: FormData) => Promise<void>
}

const inputStyles = "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/50 dark:text-foreground"
const formMessageStyles = "text-destructive dark:text-destructive"

export function EditScoreModal({ isOpen, onClose, student, onSubmit }: EditScoreModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "lionGames",
      pointChange: 0,
      description: "",
      date: new Date().toISOString().split('T')[0],
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                          {category.replace(/([A-Z])/g, ' $1').trim()}
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
              name="pointChange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Point Change</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter point change (-100 to 100)"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the change"
                      {...field}
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Score"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 