"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { formatPhoneNumber } from "@/lib/utils"
import { generatePasswordFromName } from "@/lib/data"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  year: z.enum(["Freshman", "Sophomore", "Junior", "Senior"]),
  company: z.enum(["Alpha Company", "Bravo Company", "Charlie Company", "Delta Company"]),
  companyRole: z.enum(["President", "Officer", "Member"]),
  password: z.string().optional(),
})

type FormData = z.infer<typeof formSchema> & { password?: string }

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
}

// Add this CSS class to style the inputs and form messages
const inputStyles = "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/50 dark:text-foreground"
const formMessageStyles = "text-destructive dark:text-destructive dark:text-foreground"

export function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      year: "Freshman",
      company: "Alpha Company",
      companyRole: "Member",
    },
  })

  // Update generated password when name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        setGeneratedPassword(generatePasswordFromName(value.name))
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      form.setValue("phoneNumber", value)
    }
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      // Add the generated password to the form data
      await onSubmit({ ...data, password: generatedPassword })
      form.reset()
      setGeneratedPassword("")
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
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john.doe@acu.edu" 
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
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(512) 555-0123"
                      value={formatPhoneNumber(field.value)}
                      onChange={handlePhoneChange}
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Date of Birth</FormLabel>
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
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:text-foreground">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:text-foreground">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Alpha Company">Alpha Company</SelectItem>
                      <SelectItem value="Bravo Company">Bravo Company</SelectItem>
                      <SelectItem value="Charlie Company">Charlie Company</SelectItem>
                      <SelectItem value="Delta Company">Delta Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-foreground">Company Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:text-foreground">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="President">President</SelectItem>
                      <SelectItem value="Officer">Officer</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className={formMessageStyles} />
                </FormItem>
              )}
            />

            {generatedPassword && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Generated password: <span className="font-mono font-medium">{generatedPassword}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This password will be automatically set for the student.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 