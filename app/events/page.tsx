"use client"

import { useEffect, useState, useRef } from "react"
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
import { Calendar, Clock, MapPin, Users, Award, ChevronLeft, ChevronRight } from "lucide-react"
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
    'Superhero-Logo.png',
    'menon-bearings-ltd--600 1.png',
    'Angel-One-Logo.png',
    'kartik travels logo 1.jpg',
    'Mahabhrat construction logo.png',
    'a heaven holiday.jpg',
    'pioneer energy logo.jpg',
    'easysynopsis logo 1.png',
    'edited 1.png',
    'swayam logo 1.png',
    'Screenshot 2025-02-18 154332 2.jpg',
    'kadson final logo 1.jpg',
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(sponsors.length / 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(sponsors.length / 4)) % Math.ceil(sponsors.length / 4))
  }

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [currentSlide])

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
        <section className="py-12 bg-white dark:bg-background mt-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Previous Event Sponsors</h2>
            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  className="rounded-full p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex space-x-2">
                  {Array.from({ length: Math.ceil(sponsors.length / 4) }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  className="rounded-full p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
                {sponsors.slice(currentSlide * 4, (currentSlide + 1) * 4).map((logo, idx) => (
                  <div key={logo} className="flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow h-32 sm:h-40 md:h-48">
                    <Image
                      src={`/Sponsers/${logo}`}
                      alt={`Sponsor ${currentSlide * 4 + idx + 1}`}
                      width={200}
                      height={150}
                      className="object-contain h-20 sm:h-28 md:h-36 w-auto max-w-full"
                      priority={idx < 2}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
