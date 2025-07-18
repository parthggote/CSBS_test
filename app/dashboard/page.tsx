"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, BookOpen, Award, Bell, Download, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Helper to decode JWT
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch current user from /api/users/me
      let user = null;
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (res.ok) {
          user = await res.json();
        }
      } catch {}
      setCurrentUser(user);
      // Fetch all users for event registration display
      let users: any[] = [];
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        users = await res.json();
      } catch {}
      setAllUsers(users);
      // Fetch events
      let events: any[] = [];
      try {
        const res = await fetch('/api/resources?type=events', { credentials: 'include' });
        events = await res.json();
      } catch {}
      setAllEvents(events);
      // Filter events where the user is registered (if such a field exists)
      setRegisteredEvents(events.filter((e: any) => Array.isArray(e.registeredUsers) && user && e.registeredUsers.includes(user._id)));
      // Fetch resources (all types)
      let allRes: any[] = [];
      const types = ['pyqs', 'certifications', 'hackathons', 'interviews'];
      for (const type of types) {
        try {
          const res = await fetch(`/api/resources?type=${type}`, { credentials: 'include' });
          const data = await res.json();
          allRes = allRes.concat(Array.isArray(data) ? data : []);
        } catch {}
      }
      setAllResources(allRes);
      setBookmarkedResources(allRes.filter((r: any) => Array.isArray(r.bookmarkedBy) && user && r.bookmarkedBy.includes(user._id)));
      // Fetch certificates (filter by user if possible)
      setCertificates(allRes.filter((r: any) => r.type === 'certifications' && Array.isArray(r.issuedTo) && user && r.issuedTo.includes(user._id)));
      // Fetch notifications (if implemented)
      setNotifications([]); // Placeholder, implement if you have notifications
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) {
      setShouldRedirect(true);
    }
  }, [loading, currentUser]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login');
    }
  }, [shouldRedirect, router]);

  // Edge case: loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <span className="text-lg text-gray-600">Redirecting to login...</span>
      </div>
    );
  }

  // Helper to determine if event is upcoming or completed
  function getEventStatus(event: any) {
    const now = new Date();
    const eventDate = new Date(event.date);
    return eventDate >= now ? 'upcoming' : 'completed';
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {currentUser?.name || currentUser?.email || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            {currentUser?.semester} Semester • Roll No: {currentUser?.rollNumber}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Events</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {registeredEvents.filter((e) => getEventStatus(e) === "upcoming").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bookmarked Resources</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{bookmarkedResources.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                  <p className="text-2xl font-bold text-green-600">{certificates.length}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                  <p className="text-2xl font-bold text-orange-600">{notifications.filter((n) => !n.read).length}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allEvents
                    .filter((event) => getEventStatus(event) === 'upcoming')
                    .map((event) => {
                      const isRegistered = Array.isArray(event.registeredUsers) && currentUser && event.registeredUsers.includes(currentUser._id);
                      return (
                        <Card key={event._id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>{event.location}</CardDescription>
                            </div>
                              {isRegistered ? (
                            <Badge className="bg-blue-100 text-blue-800">Registered</Badge>
                              ) : null}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.time}
                            </div>
                          </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Registered Users: {Array.isArray(event.registeredUsers) ? event.registeredUsers.length : 0}
                              {Array.isArray(event.registeredUsers) && event.registeredUsers.length > 0 && (
                                <ul className="ml-2 mt-1 list-disc text-xs">
                                  {event.registeredUsers.map((userId: string) => {
                                    const userObj = allUsers.find((u) => u._id === userId);
                                    return userObj ? (
                                      <li key={userId}>{userObj.name} ({userObj.email})</li>
                                    ) : null;
                                  })}
                                </ul>
                              )}
                            </div>
                            {!isRegistered && currentUser && (
                              <Button className="mt-2" size="sm" onClick={() => {
                                router.push(`/events/${event._id}/register`);
                              }}>
                                Register
                              </Button>
                            )}
                        </CardContent>
                      </Card>
                      );
                    })}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Completed Events (Registered)</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allEvents
                    .filter((event) => getEventStatus(event) === 'completed')
                    .filter((event) => Array.isArray(event.registeredUsers) && currentUser && event.registeredUsers.includes(currentUser._id))
                    .map((event) => (
                      <Card key={event._id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>{event.location}</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              {event.certificate && (
                                <Badge className="bg-green-100 text-green-800">Certificate Available</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </div>
                            {event.certificate && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-1" />
                                Certificate
                              </Button>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Registered Users: {Array.isArray(event.registeredUsers) ? event.registeredUsers.length : 0}
                            {Array.isArray(event.registeredUsers) && event.registeredUsers.length > 0 && (
                              <ul className="ml-2 mt-1 list-disc text-xs">
                                {event.registeredUsers.map((userId: string) => {
                                  const userObj = allUsers.find((u) => u._id === userId);
                                  return userObj ? (
                                    <li key={userId}>{userObj.name} ({userObj.email})</li>
                                  ) : null;
                                })}
                              </ul>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div>
              <h2 className="text-xl font-semibold mb-4">All Resources</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allResources.map((resource) => (
                  <Card key={resource._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{resource.type || resource.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Downloads: {resource.downloads || 0}
                        </span>
                        {resource.fileId && (
                          <a href={`/api/files/${resource.fileId}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">Download</Button>
                          </a>
                        )}
                      </div>
                      {resource.year && <div className="text-xs text-gray-500 mt-1">Year: {resource.year}</div>}
                      {resource.semester && <div className="text-xs text-gray-500">Semester: {resource.semester}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Certificates</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((certificate) => (
                  <Card key={certificate.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{certificate.title}</CardTitle>
                      <CardDescription>
                        Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-600">
                          <Award className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={!notification.read ? "border-blue-200 bg-blue-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? "bg-blue-500" : "bg-gray-300"}`}
                          />
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {notification.type === "event" && <Calendar className="w-4 h-4 text-blue-500" />}
                          {notification.type === "resource" && <BookOpen className="w-4 h-4 text-purple-500" />}
                          {notification.type === "certificate" && <Award className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
