"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, MapPin, Users, Clock, ExternalLink, Plus, X, AlertCircle } from 'lucide-react'
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"

const CreateEventModal = ({ formData, handleFormChange, handleCreateEvent, submitting, user, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background border-b">
        <CardTitle>Create New Event</CardTitle>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {user.userType !== 'professional' && user.userType !== 'admin' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Only professionals and admins can create events
            </p>
          </div>
        )}
        
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g., React Workshop 2024"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Event description and details..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              >
                <option>Workshop</option>
                <option>Conference</option>
                <option>Hackathon</option>
                <option>Seminar</option>
                <option>Career Fair</option>
                <option>Competition</option>
                <option>Webinar</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              placeholder="e.g., Lab 301, CS Building"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleFormChange}
                placeholder="e.g., React, JavaScript, Frontend"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Attendees</label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleFormChange}
                placeholder="Leave empty for unlimited"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0a66c2]  to-[#004812]"
              disabled={submitting || (user.userType !== 'professional' && user.userType !== 'admin')}
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)

const EventCard = ({ event, isPast = false, user }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <div className="md:flex">
      <div className="md:w-1/3">
        <img
          src={event.poster || "https://clubtranscend.in/wp-content/uploads/2025/01/Corporate-Event.jpg"}
          alt={event.title}
          className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
          onError={(e) => {
            e.target.src = "https://clubtranscend.in/wp-content/uploads/2025/01/Corporate-Event.jpg";
          }}
        />
      </div>
      <div className="md:w-2/3 p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="default">{event.category}</Badge>
              {event.maxAttendees && event.registeredUsers?.length >= event.maxAttendees && (
                <Badge variant="destructive">Full</Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{event.description}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
            {event.time && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{event.time}</span>
              </>
            )}
          </div>
          {event.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Avatar className="h-5 w-5">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{event.organizer?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span>Organized by {event.organizer?.name || 'Unknown'}</span>
          </div>
        </div>

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>
              {event.registeredUsers?.length || 0} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attendees
            </span>
          </div>
          {!isPast && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegisterEvent(event._id)}
                disabled={event.maxAttendees && event.registeredUsers?.length >= event.maxAttendees}
              >
                {event.registeredUsers?.some(r => r.userId?._id === user?._id) ? 'Registered' : 'RSVP'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
)

const Events = () => {
  const { user, token } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [stats, setStats] = useState({ upcomingCount: 0, pastCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '',
    location: '',
    tags: '',
    maxAttendees: '',
    visibility: 'public'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchStats()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        const now = new Date()
        const upcoming = data.events.filter(e => new Date(e.date) >= now)
        const past = data.events.filter(e => new Date(e.date) < now)
        
        setEvents(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)))
        setPastEvents(past.sort((a, b) => new Date(b.date) - new Date(a.date)))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title?.trim() || !formData.description?.trim() || !formData.date || !formData.time?.trim() || !formData.location?.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (user.userType !== 'professional' && user.userType !== 'admin') {
      toast.error('Only professionals and admins can create events')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        poster: 'https://clubtranscend.in/wp-content/uploads/2025/01/Corporate-Event.jpg'
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event')
      }

      toast.success('Event created successfully!')
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        category: 'Workshop',
        date: '',
        time: '',
        location: '',
        tags: '',
        maxAttendees: '',
        visibility: 'public'
      })
      fetchEvents()
      fetchStats()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterEvent = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register')
      }

      toast.success('Registered successfully!')
      fetchEvents()
    } catch (error) {
      console.error('Error registering:', error)
      toast.error(error.message || 'Failed to register')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events & Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with department events, workshops, and announcements
          </p>
        </div>
        {(user?.userType === 'professional' || user?.userType === 'admin') && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#0a66c2]  to-[#004182]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Events ({events.length})</TabsTrigger>
              <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
                </div>
              ) : (
                events.map((event) => (
                  <EventCard key={event._id} event={event} user={user} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No past events</p>
                </div>
              ) : (
                pastEvents.map((event) => (
                  <EventCard key={event._id} event={event} user={user} isPast />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</span>
                  <span className="font-medium">{stats.upcomingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Past Events</span>
                  <span className="font-medium">{stats.pastCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Workshop", "Conference", "Hackathon", "Seminar", "Career Fair", "Competition"].map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-[#AF0171] hover:text-white hover:border-[#AF0171]"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          formData={formData}
          handleFormChange={handleFormChange}
          handleCreateEvent={handleCreateEvent}
          submitting={submitting}
          user={user}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

export default Events
