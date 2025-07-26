"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import type { Student, ScoreChangeHistoryEntry } from "@/lib/data"

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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  pointChange: z.number(),
  date: z.string(),
})

type FormData = z.infer<typeof formSchema>

interface ScoreHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}

const inputStyles = "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/50 dark:text-foreground"
const formMessageStyles = "text-destructive dark:text-destructive"

export function ScoreHistoryModal({ isOpen, onClose, student }: ScoreHistoryModalProps) {
  const [history, setHistory] = useState<ScoreChangeHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<ScoreChangeHistoryEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      pointChange: 0,
      date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, student.id])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/students/${student.id}/history`)
      if (!response.ok) throw new Error("Failed to fetch history")
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (entry: ScoreChangeHistoryEntry) => {
    setEditingEntry(entry)
    form.reset({
      description: entry.description,
      pointChange: entry.pointChange,
      date: entry.date,
    })
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`/api/students/${student.id}/history`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId: entryId }),
      })

      if (!response.ok) throw new Error("Failed to delete entry")
      await fetchHistory()
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!editingEntry) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/students/${student.id}/history`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId: editingEntry.id,
          changes: data,
        }),
      })

      if (!response.ok) throw new Error("Failed to update entry")
      await fetchHistory()
      setEditingEntry(null)
      form.reset()
    } catch (error) {
      console.error("Error updating entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Score History for {student.name}</DialogTitle>
        </DialogHeader>

        {editingEntry ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-foreground">Description</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyles} />
                    </FormControl>
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-foreground">Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage className={formMessageStyles} />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No history entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="capitalize">
                            {entry.category.replace(/([A-Z])/g, ' $1').trim()}
                          </TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">
                            {entry.pointChange > 0 ? '+' : ''}{entry.pointChange}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(entry)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(entry.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive/80 dark:text-foreground dark:hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 