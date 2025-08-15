'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acu-apex/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@acu-apex/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@acu-apex/ui'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  Edit, 
  Trash2, 
  Repeat, 
  CalendarDays,
  Settings2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"
import { fetchAllEventsForStaff, deleteRecurringEvent, deleteEventInstance, type StaffEventFilters, type EventsResponse } from '@/lib/staff-events'
import type { RecurringEvent, EventInstance } from '@acu-apex/types'
import { formatDate, formatDateTime } from '@acu-apex/utils'
import { EventForm } from '@/components/staff/event-forms'



export default function StaffEventsPage() {
  const { user } = useAuth()
  const [eventsData, setEventsData] = useState<EventsResponse>({
    recurringEvents: [],
    eventInstances: [],
    companies: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<StaffEventFilters>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createMode, setCreateMode] = useState<'recurring' | 'instance'>('recurring')
  const [selectedEventToDelete, setSelectedEventToDelete] = useState<{
    id: string
    name: string
    type: 'recurring' | 'instance'
  } | null>(null)

  // Load events data
  useEffect(() => {
    loadEvents()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvents = async () => {
    setLoading(true)
    const data = await fetchAllEventsForStaff(filters)
    setEventsData(data)
    setLoading(false)
  }

  // Filter events based on search term
  const filteredRecurringEvents = eventsData.recurringEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEventInstances = eventsData.eventInstances.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'self_report': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'officer_input': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'staff_input': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'attendance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'All Companies'
    return eventsData.companies.find(c => c.id === companyId)?.name || 'Unknown Company'
  }

  const handleCreateEvent = () => {
    setShowCreateDialog(true)
  }

  const handleDeleteEvent = async (eventId: string, eventType: 'recurring' | 'instance') => {
    try {
      const result = eventType === 'recurring' 
        ? await deleteRecurringEvent(eventId)
        : await deleteEventInstance(eventId)
      
      if (result.success) {
        setSelectedEventToDelete(null)
        await loadEvents()
      } else {
        // Handle error - you might want to show a toast notification here
        console.error('Failed to delete event:', result.error)
      }
    } catch (error) {
      console.error('Delete event error:', error)
    }
  }

  const RecurringEventCard = ({ event }: { event: RecurringEvent }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Repeat className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <Badge className={getEventTypeColor(event.event_type)}>
                {event.event_type.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {event.description || 'No description provided'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.recurrence_pattern 
                ? `Every ${event.recurrence_pattern.type}`
                : 'Custom recurrence'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{getCompanyName(event.required_company)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(event.start_date)} - {event.end_date ? formatDate(event.end_date) : 'Ongoing'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" disabled>
            <CalendarDays className="h-3 w-3 mr-1" />
            View Instances
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Edit, view instances, and delete functionality coming soon
        </p>
      </CardContent>
    </Card>
  )

  const EventInstanceCard = ({ event }: { event: EventInstance }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarDays className="h-4 w-4 text-secondary" />
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <Badge className={getEventTypeColor(event.event_type)}>
                {event.event_type.replace('_', ' ')}
              </Badge>
              {event.recurring_event_id && (
                <Badge variant="outline">
                  <Repeat className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {event.description || 'No description provided'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.due_date ? formatDateTime(event.due_date) : 'No due date'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{getCompanyName(event.required_company)}</span>
          </div>
          {event.class_code && (
            <div className="flex items-center space-x-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span>Class: {event.class_code}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Edit and delete functionality coming soon
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Event Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage recurring events and individual event instances for students
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col mx-4 sm:max-w-2xl sm:w-full overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                
                {/* Mode Selection - Fixed at top */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant={createMode === 'recurring' ? 'default' : 'outline'}
                    onClick={() => setCreateMode('recurring')}
                    className="flex-1"
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Recurring Event
                  </Button>
                  <Button 
                    variant={createMode === 'instance' ? 'default' : 'outline'}
                    onClick={() => setCreateMode('instance')}
                    className="flex-1"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Single Event
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {createMode === 'recurring' 
                    ? 'Create a template that will generate multiple event instances automatically'
                    : 'Create a single, standalone event instance'
                  }
                </p>
                
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-4 pr-1">
                    {user?.id && (
                      <EventForm
                        mode="create"
                        eventType={createMode}
                        companies={eventsData.companies}
                        userId={user.id}
                        onSuccess={() => {
                          setShowCreateDialog(false)
                          loadEvents()
                        }}
                        onCancel={() => setShowCreateDialog(false)}
                      />
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.eventType || 'all'} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, eventType: value === 'all' ? undefined : value as 'attendance' | 'self_report' }))
          }>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="self_report">Participation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.companyId || 'all'} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, companyId: value === 'all' ? undefined : value }))
          }>
            <SelectTrigger className="w-48">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {eventsData.companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recurring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recurring" className="flex items-center space-x-2">
              <Repeat className="h-4 w-4" />
              <span>Recurring Events ({filteredRecurringEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="instances" className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>Event Instances ({filteredEventInstances.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recurring" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecurringEvents.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Repeat className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No recurring events found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'Try adjusting your search or filters'
                        : 'Create your first recurring event to get started'
                      }
                    </p>
                  </div>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recurring Event
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecurringEvents.map(event => (
                  <RecurringEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="instances" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEventInstances.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No event instances found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'Try adjusting your search or filters'
                        : 'Event instances will appear here when created from recurring events or added manually'
                      }
                    </p>
                  </div>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event Instance
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEventInstances.map(event => (
                  <EventInstanceCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!selectedEventToDelete} onOpenChange={() => setSelectedEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{selectedEventToDelete?.name}&rdquo;? 
              {selectedEventToDelete?.type === 'recurring' && (
                <span className="block mt-2 text-destructive">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This will also delete all associated event instances!
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEventToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEventToDelete && handleDeleteEvent(
                selectedEventToDelete.id, 
                selectedEventToDelete.type
              )}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}