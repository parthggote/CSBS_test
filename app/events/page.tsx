"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, Award } from "lucide-react"
import Image from "next/image"

export default function EventsPage() {
  // Add state for user role at the top of the component
  const [currentUser] = useState({
    name: "Admin User",
    role: "admin" as const, // Change this to test admin features
  })
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const res = await fetch("/api/resources?type=events")
        const data = await res.json()
        if (Array.isArray(data)) {
          const now = new Date()
          const upcoming = data.filter((event) => new Date(event.date) >= now)
          const past = data.filter((event) => new Date(event.date) < now)
          setUpcomingEvents(upcoming)
          setPastEvents(past)
        } else {
          setUpcomingEvents([])
          setPastEvents([])
        }
      } catch {
        setUpcomingEvents([])
        setPastEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const sponsors = [
    { name: "TCS", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Microsoft", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Google", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Amazon", logo: "/placeholder.svg?height=60&width=120" },
  ]

  const handleRegister = (eventId: number) => {
    console.log("Registering for event:", eventId)
    // Handle registration logic
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      {/* Update the Navigation component call to include currentUser */}
      <Navigation currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Department Events</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with workshops, seminars, competitions, and networking events
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {loading ? (
                <p>Loading events...</p>
              ) : upcomingEvents.length === 0 ? (
                <p>No upcoming events found.</p>
              ) : (
                upcomingEvents.map((event) => (
                  <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600">{event.category}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.registered}/{event.capacity} registered
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mb-2 bg-transparent">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{event.title}</DialogTitle>
                          <DialogDescription>
                            {event.speaker} • {new Date(event.date).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            width={600}
                            height={300}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <p className="text-gray-700">{event.fullDescription}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Time:</strong> {event.time}
                            </div>
                            <div>
                              <strong>Location:</strong> {event.location}
                            </div>
                            <div>
                              <strong>Capacity:</strong> {event.capacity} seats
                            </div>
                          </div>
                          <Button
                              onClick={() => (window.location.href = `/events/${event._id}/register`)}
                            className="w-full"
                            disabled={event.registered >= event.capacity}
                          >
                            {event.registered >= event.capacity ? "Event Full" : "Register Now"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                        onClick={() => (window.location.href = `/events/${event._id}/register`)}
                      className="w-full"
                      disabled={event.registered >= event.capacity}
                    >
                      {event.registered >= event.capacity ? "Event Full" : "Register"}
                    </Button>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {loading ? (
                <p>Loading events...</p>
              ) : pastEvents.length === 0 ? (
                <p>No past events found.</p>
              ) : (
                pastEvents.map((event) => (
                  <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees} attendees
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2" />
                        {event.rating}/5.0 rating
                      </div>
                    </div>
                    <blockquote className="text-sm italic text-gray-600 border-l-4 border-blue-500 pl-4">
                      "{event.testimonial}"
                    </blockquote>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sponsors Section */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">Event Sponsors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="text-center group">
                <Image
                  src={sponsor.logo || "/placeholder.svg"}
                  alt={sponsor.name}
                  width={120}
                  height={60}
                  className="mx-auto grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
