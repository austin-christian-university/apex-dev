"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react"
import { useUserRole } from "@/lib/auth"

// Mock data for events
const events = [
  {
    id: 1,
    title: "Fall Semester Begins",
    date: "2024-08-26",
    type: "academic",
    description: "First day of Fall 2024 semester",
    location: "Main Campus",
    time: "8:00 AM",
  },
  {
    id: 2,
    title: "Orientation Week",
    date: "2024-08-26",
    type: "event",
    description: "Welcome activities for new students",
    location: "Student Center",
    time: "9:00 AM - 4:00 PM",
  },
  {
    id: 3,
    title: "Academic Advising",
    date: "2024-09-02",
    type: "academic",
    description: "Schedule your advising appointment",
    location: "Academic Services",
    time: "10:00 AM - 2:00 PM",
  },
  {
    id: 4,
    title: "Chapel Service",
    date: "2024-09-04",
    type: "spiritual",
    description: "Weekly chapel service",
    location: "Chapel",
    time: "11:00 AM",
  },
  {
    id: 5,
    title: "Career Fair",
    date: "2024-09-15",
    type: "event",
    description: "Annual career fair with employers",
    location: "Student Center",
    time: "1:00 PM - 5:00 PM",
  },
]

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const userRole = useUserRole()

  // Filter events for the selected date
  const selectedDateEvents = events.filter(
    (event) => event.date === date?.toISOString().split("T")[0]
  )

  // Get events for the next 7 days
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)
      return eventDate >= today && eventDate <= nextWeek
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "badge-info"
      case "spiritual":
        return "badge-warning"
      case "event":
        return "badge-success"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">View and manage academic events and schedules</p>
        </div>
        <Button variant="outline" size="lg" className="text-primary-600 border-primary-200 hover:bg-primary-50 px-6 py-6">
          <CalendarIcon className="mr-3 h-6 w-6" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-card border border-border/60">
            <CardHeader className="pb-6">
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view events</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border text-base md:text-lg"
              />
            </CardContent>
          </Card>

          <Card className="shadow-card border border-border/60 mt-8">
            <CardHeader className="pb-6">
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 md:p-6 border border-border rounded-md hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-medium text-foreground">{event.title}</h3>
                      <Badge variant="outline" className={`text-base md:text-lg ${getEventTypeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                    <div className="flex flex-col gap-2 text-base md:text-lg text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-card border border-border/60">
            <CardHeader className="pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {date
                      ? date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Select a date"}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""} scheduled
                  </CardDescription>
                </div>
                <Tabs defaultValue="all" className="w-[250px]">
                  <TabsList className="grid w-full grid-cols-3 h-12">
                    <TabsTrigger value="all" className="text-base md:text-lg">All</TabsTrigger>
                    <TabsTrigger value="academic" className="text-base md:text-lg">Academic</TabsTrigger>
                    <TabsTrigger value="events" className="text-base md:text-lg">Events</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-6">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-6 border border-border rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-medium text-primary-900 mb-2">{event.title}</h3>
                          <p className="text-base md:text-lg text-muted-foreground">{event.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-base md:text-lg ${getEventTypeColor(event.type)}`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center text-base md:text-lg text-muted-foreground">
                          <Clock className="h-6 w-6 mr-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-base md:text-lg text-muted-foreground">
                          <MapPin className="h-6 w-6 mr-3" />
                          {event.location}
                        </div>
                      </div>
                      {event.type === "event" && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <Button variant="outline" size="lg" className="w-full text-base md:text-lg py-6">
                            <Users className="h-6 w-6 mr-3" />
                            View Attendees
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="text-xl md:text-2xl font-medium text-primary-900 mb-2">No events scheduled</h3>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Select a different date or add a new event
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 