"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ObjectId } from 'bson';

interface RegistrationField {
  id: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea"
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  description: string
  fullDescription: string
  speaker: string
  capacity: number
  registered: number
  category: string
  image: string
  registrationFields: RegistrationField[]
  isActive: boolean
  registeredUsers?: string[] // Added for tracking registered users
}

export default function EventRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<any | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/resources?type=events`)
        const data = await res.json()
        if (Array.isArray(data)) {
          // Find event by _id (MongoDB ObjectId as string)
          const foundEvent = data.find((e: any) => e._id === eventId)
    if (foundEvent) {
      setEvent(foundEvent)
      // Initialize form data with empty values
      const initialFormData: Record<string, string> = {}
            ;(foundEvent.registrationFields || []).forEach((field: any) => {
        initialFormData[field.id] = ""
      })
      setFormData(initialFormData)
    }
        }
      } catch {}
    }
    fetchEvent()
  }, [eventId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!event) return false

    event.registrationFields.forEach((field: RegistrationField) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`
      }

      if (field.type === "email" && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = "Please enter a valid email address"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In real app, send data to backend
    // 1. Submit registration data (optional: save registration details)
    // 2. Add student to event's registeredUsers array using addRegisteredUserId
    try {
      // Fetch current user from /api/users/me
      let user = null;
      const userRes = await fetch('/api/users/me', { credentials: 'include' });
      if (userRes.ok) {
        user = await userRes.json();
      }
      if (user && event) {
        await fetch(`/api/resources?type=events`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: event._id, addRegisteredUserId: user._id, registrationData: formData }),
          credentials: 'include',
        });
      }
    } catch {}

    setIsSubmitting(false)
    setIsRegistered(true)
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const renderField = (field: RegistrationField) => {
    const hasError = !!errors[field.id]

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={formData[field.id] || ""} onValueChange={(value) => handleInputChange(field.id, value)}>
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
          <Link href="/events">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">
              You have successfully registered for <strong>{event.title}</strong>
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-3" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-3" />
                  {event.time}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-3" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-3" />
                  {event.speaker}
                </div>
              </CardContent>
            </Card>

            <Alert className="mb-8">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                A confirmation email has been sent to your registered email address with event details and further
                instructions.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button>View Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/events">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge>{event.category}</Badge>
                    <Badge variant="outline">{event.capacity - event.registered} spots left</Badge>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-3" />
                      {event.speaker}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Registered</span>
                      <span>
                        {event.registered}/{event.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Event Registration</CardTitle>
                  <CardDescription>Fill in the required information to register for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  {event.registered >= event.capacity ? (
                    <Alert>
                      <AlertDescription>This event is fully booked. Registration is currently closed.</AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {event.registrationFields.map(renderField)}

                      <div className="pt-6 border-t">
                        <div className="flex items-center space-x-4">
                          <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? "Registering..." : "Register for Event"}
                          </Button>
                          <Link href="/events">
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
