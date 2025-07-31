"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, BookOpen, Award, Bell, Download, Clock, CheckCircle, Play, Brain, Sparkles, Users, Star } from "lucide-react"
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import Chatbot from '../components/Chatbot';
import { useAuth } from "@/hooks/use-auth"

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [allResources, setAllResources] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    subject: '',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 30,
    description: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const [flashcardUploadForm, setFlashcardUploadForm] = useState({
    subject: '',
    description: '',
    cardCount: 10
  });
  const [isFlashcardUploading, setIsFlashcardUploading] = useState(false);
  const [flashcardUploadProgress, setFlashcardUploadProgress] = useState(0);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<any>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  // Memoize quiz results map - MUST be before any early returns
  const quizResultsMap = useMemo(() => {
    const map: Record<string, any> = {};
    quizResults.forEach((r: any) => { map[r.quizId] = r });
    return map;
  }, [quizResults]);

  // ALL useEffect hooks must be before any early returns
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Use the authenticated user from NextAuth
      if (user) {
        setCurrentUser(user);
      }
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
      setRegisteredEvents(events.filter((e: any) => Array.isArray(e.registeredUsers) && user && e.registeredUsers.includes(user.id)));
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
      setBookmarkedResources(allRes.filter((r: any) => Array.isArray(r.bookmarkedBy) && user && r.bookmarkedBy.includes(user.id)));
      // Fetch certificates (filter by user if possible)
      setCertificates(allRes.filter((r: any) => r.type === 'certifications' && Array.isArray(r.issuedTo) && user && r.issuedTo.includes(user.id)));
      // Fetch quizzes
      let quizzes: any[] = [];
      try {
        const res = await fetch('/api/resources?type=quizzes', { credentials: 'include' });
        quizzes = await res.json();
      } catch {}
      setAllQuizzes(Array.isArray(quizzes) ? quizzes : []);
      // Fetch quiz results for the user
      let results: any[] = [];
      try {
        const res = await fetch('/api/quiz-results', { credentials: 'include' });
        if (res.ok) results = await res.json();
      } catch {}
      setQuizResults(Array.isArray(results) ? results : []);
      // Fetch notifications
      let notifications: any[] = [];
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.ok) {
          notifications = await res.json();
        }
      } catch {}
      setNotifications(Array.isArray(notifications) ? notifications : []);
      // Fetch flashcard sets
      let flashcardSets: any[] = [];
      try {
        const res = await fetch('/api/resources?type=flashcardSets', { credentials: 'include' });
        flashcardSets = await res.json();
      } catch {}
      setFlashcardSets(Array.isArray(flashcardSets) ? flashcardSets : []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

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

  function handleDownloadResultPDF(quiz: any, result: any) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Quiz: ${quiz.title}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Subject: ${quiz.subject || ''}`, 10, 30);
    doc.text(`Score: ${result.score}%`, 10, 40);
    let y = 55;
    const questions = quiz.questions || [];
    questions.forEach((q: any, i: number) => {
      doc.setFontSize(12);
      doc.text(`Q${i + 1}: ${q.question}`, 10, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Your Answer: ${result.answers[i] || 'Not answered'}`, 12, y);
      y += 7;
      doc.text(`Correct Answer: ${q.correctAnswer}`, 12, y);
      y += 7;
      if (q.explanation) {
        doc.text(`Explanation: ${q.explanation}`, 12, y);
        y += 7;
      }
      y += 4;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`${quiz.title.replace(/\s+/g, '_')}_Result.pdf`);
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

        <Tabs defaultValue="events" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto mb-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="flashcards">Flash Cards</TabsTrigger>
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

          <TabsContent value="quizzes">
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
              {currentUser?.role === 'student' && (
                <div className="mb-6 flex justify-end">
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Generate Quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span>Generate AI Quiz</span>
                        </DialogTitle>
                        <DialogDescription>
                          Upload a PDF and configure your quiz settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Subject/Topic</label>
                          <Input
                            placeholder="e.g., Data Structures, Algorithms"
                            value={uploadForm.subject}
                            onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Difficulty</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={uploadForm.difficulty}
                            onChange={(e) => setUploadForm({...uploadForm, difficulty: e.target.value})}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Questions</label>
                            <Input
                              type="number"
                              min="5"
                              max="50"
                              value={uploadForm.questionCount}
                              onChange={(e) => setUploadForm({...uploadForm, questionCount: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time (min)</label>
                            <Input
                              type="number"
                              min="5"
                              max="180"
                              value={uploadForm.timeLimit}
                              onChange={(e) => setUploadForm({...uploadForm, timeLimit: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Input
                            placeholder="Brief description of the quiz"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Upload PDF</label>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={async (event) => {
                              const file = event.target.files?.[0]
                              if (!file) return
                              if (file.type !== 'application/pdf') {
                                alert('Please upload a PDF file')
                                return
                              }
                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size should be less than 10MB')
                                return
                              }
                              setIsUploading(true)
                              setUploadProgress(0)
                              try {
                                const formData = new FormData()
                                formData.append('file', file)
                                formData.append('type', 'quiz-generation')
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
                                if (!uploadRes.ok) throw new Error('Failed to upload file')
                                const uploadData = await uploadRes.json()
                                setUploadProgress(50)
                                const quizRes = await fetch('/api/quiz-generation', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileId: uploadData.fileId,
                                    filename: uploadData.filename,
                                    ...uploadForm
                                  })
                                })
                                if (!quizRes.ok) throw new Error('Failed to generate quiz')
                                const quizResult = await quizRes.json()
                                setUploadProgress(100)
                                setTimeout(() => {
                                  setShowUploadDialog(false)
                                  setIsUploading(false)
                                  setUploadProgress(0)
                                  setUploadForm({
                                    subject: '',
                                    difficulty: 'medium',
                                    questionCount: 10,
                                    timeLimit: 30,
                                    description: ''
                                  })
                                  
                                  // Show success message
                                  if (quizResult.success) {
                                    toast({
                                      title: "Quiz Generated Successfully!",
                                      description: "Your quiz has been created and is now available in the quiz list. You can attempt it whenever you want.",
                                    })
                                  }
                                }, 1000)
                              } catch (error) {
                                alert('Failed to generate quiz. Please try again.')
                                setIsUploading(false)
                                setUploadProgress(0)
                              }
                            }}
                            disabled={isUploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 10MB. Supported: PDF files only.
                          </p>
                        </div>
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Generating quiz from PDF...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {uploadProgress < 50 ? 'Uploading file...' : 'Processing content and generating questions...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allQuizzes.filter(quiz => quiz.isActive).map((quiz) => (
                  <Card key={quiz._id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }>
                              {quiz.difficulty}
                            </Badge>
                            {quizResultsMap[quiz._id] && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Completed
                              </Badge>
                            )}
                            {new Date(quiz.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                <Star className="w-3 h-3 mr-1" />
                                New
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg leading-tight mb-2">{quiz.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">{quiz.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Subject</span>
                          </div>
                          <p className="font-medium text-foreground">{quiz.subject}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Brain className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Questions</span>
                          </div>
                          <p className="font-medium text-foreground">{quiz.questionCount}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Time Limit</span>
                          </div>
                          <p className="font-medium text-foreground">{quiz.timeLimit} min</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Participants</span>
                          </div>
                          <p className="font-medium text-foreground">{quiz.participants || 0}</p>
                        </div>
                      </div>
                      
                      {quizResultsMap[quiz._id] ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">Completed</span>
                            </div>
                            <span className="text-lg font-bold text-green-800 dark:text-green-200">
                              {quizResultsMap[quiz._id].score}%
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              onClick={() => router.push(`/quizzes/${quiz._id}/take`)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Retake Quiz
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResultPDF(quiz, quizResultsMap[quiz._id])}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => router.push(`/quizzes/${quiz._id}/take`)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Take Quiz
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/notifications', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    type: 'quiz_assignment',
                                    title: 'Quiz Assignment Request',
                                    message: `Student ${currentUser?.name || currentUser?.email} is requesting access to quiz: ${quiz.title}`,
                                    targetRole: 'admin',
                                    quizId: quiz._id,
                                    studentId: currentUser?._id
                                  }),
                                  credentials: 'include'
                                });
                                if (res.ok) {
                                  toast({ 
                                    title: 'Request Sent', 
                                    description: 'Your request has been sent to the admin for approval.',
                                    variant: 'default' 
                                  });
                                } else {
                                  toast({ 
                                    title: 'Error', 
                                    description: 'Failed to send request. Please try again.',
                                    variant: 'destructive' 
                                  });
                                }
                              } catch (error) {
                                toast({ 
                                  title: 'Error', 
                                  description: 'Failed to send request. Please try again.',
                                  variant: 'destructive' 
                                });
                              }
                            }}
                          >
                            Request Access
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {allQuizzes.filter(quiz => quiz.isActive).length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active quizzes available.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            <div>
              <h2 className="text-xl font-semibold mb-4">AI-Powered Flash Cards</h2>
              {currentUser?.role === 'student' && (
                <div className="mb-6 flex justify-end">
                  <Dialog open={showFlashcardDialog} onOpenChange={setShowFlashcardDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Flash Cards
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span>Generate AI Flash Cards</span>
                        </DialogTitle>
                        <DialogDescription>
                          Upload a PDF or notes to generate flash cards
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Number of Cards</label>
                            <Input
                              type="number"
                              min="5"
                              max="50"
                              value={flashcardUploadForm.cardCount}
                              onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, cardCount: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Subject/Topic</label>
                            <Input
                              placeholder="e.g., Data Structures, Algorithms"
                              value={flashcardUploadForm.subject}
                              onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, subject: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Input
                            placeholder="Brief description of the flash cards"
                            value={flashcardUploadForm.description}
                            onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Upload PDF or Notes</label>
                          <Input
                            type="file"
                            accept=".pdf,.txt,.md"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (!(file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.md'))) {
                                alert('Please upload a PDF, TXT, or Markdown file');
                                return;
                              }
                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size should be less than 10MB');
                                return;
                              }
                              setIsFlashcardUploading(true);
                              setFlashcardUploadProgress(0);
                              try {
                                // Upload file first
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('type', 'flashcard-generation');
                                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                if (!uploadRes.ok) throw new Error('Failed to upload file');
                                const uploadData = await uploadRes.json();
                                setFlashcardUploadProgress(50);

                                // Generate flash cards using AI
                                const flashcardRes = await fetch('/api/flashcard-generation', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileId: uploadData.fileId,
                                    filename: uploadData.filename,
                                    ...flashcardUploadForm
                                  })
                                });
                                if (!flashcardRes.ok) throw new Error('Failed to generate flash cards');
                                const flashcardData = await flashcardRes.json();
                                
                                if (flashcardData.success) {
                                  const newSet = {
                                    id: flashcardData.flashcardSet._id,
                                    title: flashcardData.flashcardSet.title,
                                    description: flashcardData.flashcardSet.description,
                                    sourceFile: file.name,
                                    cardCount: flashcardData.flashcardSet.cardCount,
                                    cards: flashcardData.flashcardSet.cards,
                                    createdAt: flashcardData.flashcardSet.createdAt
                                  };
                                  setFlashcardSets(prev => [newSet, ...prev]);
                                  
                                  // Show success message
                                  toast({
                                    title: "Flash Cards Generated Successfully!",
                                    description: "Your flash card set has been created and is now available in the flash cards list.",
                                  });
                                } else {
                                  throw new Error(flashcardData.error || 'Failed to generate flash cards');
                                }
                                
                                setIsFlashcardUploading(false);
                                setFlashcardUploadProgress(100);
                                setShowFlashcardDialog(false);
                                setFlashcardUploadForm({ subject: '', description: '', cardCount: 10 });
                                setTimeout(() => setFlashcardUploadProgress(0), 1000);
                                                          } catch (error) {
                              console.error('Error generating flash cards:', error);
                              toast({
                                title: "Error",
                                description: "Failed to generate flash cards. Please try again.",
                                variant: "destructive"
                              });
                              setIsFlashcardUploading(false);
                              setFlashcardUploadProgress(0);
                            }
                            }}
                            disabled={isFlashcardUploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 10MB. Supported: PDF, TXT, and Markdown files.
                          </p>
                        </div>
                        {isFlashcardUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Generating flash cards from your file...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${flashcardUploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {flashcardUploadProgress < 50 ? 'Uploading file...' : 'Processing content and generating flash cards...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {!selectedFlashcardSet ? (
                // Flash Card Sets List
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcardSets.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No flash card sets created yet. Upload your notes to get started!</p>
                    </div>
                  ) : (
                    flashcardSets.map((set) => (
                      <Card key={set.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                        setSelectedFlashcardSet(set);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{set.title}</CardTitle>
                              <CardDescription>{set.description || 'No description'}</CardDescription>
                            </div>
                            <Badge variant="outline">{set.cards.length} cards</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Source:</span>
                              <span className="font-medium truncate max-w-32">{set.sourceFile}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{new Date(set.createdAt).toLocaleDateString()}</span>
                            </div>
                            {new Date(set.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <div className="flex items-center justify-center mt-2">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Star className="w-3 h-3 mr-1" />
                                  New
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            Study Set
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                // Study Mode for Selected Set
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <Button variant="outline" onClick={() => {
                        setSelectedFlashcardSet(null);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}>
                        ← Back to Sets
                      </Button>
                      <h3 className="text-lg font-semibold mt-2">{selectedFlashcardSet.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Card {currentFlashcardIndex + 1} of {selectedFlashcardSet.cards.length}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <Card className="min-h-[300px] flex flex-col">
                      <CardHeader className="flex-1">
                        <CardTitle className="text-xl text-center">
                          {selectedFlashcardSet.cards[currentFlashcardIndex]?.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-center">
                        {showFlashcardAnswer ? (
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700 mb-4">
                              {selectedFlashcardSet.cards[currentFlashcardIndex]?.answer}
                            </p>
                            <div className="flex justify-center space-x-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowFlashcardAnswer(false);
                                  if (currentFlashcardIndex < selectedFlashcardSet.cards.length - 1) {
                                    setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                  }
                                }}
                              >
                                Next Card
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowFlashcardAnswer(false);
                                  setCurrentFlashcardIndex(0);
                                }}
                              >
                                Start Over
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Button
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => setShowFlashcardAnswer(true)}
                            >
                              Reveal Answer
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
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
              <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Notifications</h2>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification._id} 
                      className={`transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? "border-primary/20 bg-primary/5 dark:bg-primary/10" 
                          : "border-border bg-card"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 transition-colors ${
                                !notification.read 
                                  ? "bg-primary animate-pulse" 
                                  : "bg-muted-foreground/30"
                              }`}
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                              {notification.status && (
                                <Badge 
                                  variant={
                                    notification.status === 'pending' ? 'outline' : 
                                    notification.status === 'approved' ? 'default' : 'destructive'
                                  }
                                  className={`mt-2 transition-colors ${
                                    notification.status === 'pending' 
                                      ? 'border-primary/50 text-primary bg-primary/10 dark:bg-primary/20' 
                                      : ''
                                  }`}
                                >
                                  {notification.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {notification.type === "quiz_assignment_approved" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Mark notification as read
                                  fetch('/api/notifications', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      notificationId: notification._id, 
                                      read: true 
                                    }),
                                    credentials: 'include'
                                  });
                                  // Refresh the page to show updated quiz access
                                  window.location.reload();
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                              >
                                View Quiz
                              </Button>
                            )}
                            <div className="flex items-center">
                              {notification.type === "event" && <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                              {notification.type === "resource" && <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
                              {notification.type === "certificate" && <Award className="w-4 h-4 text-green-500 dark:text-green-400" />}
                              {notification.type === "quiz_assignment" && <Brain className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
                              {notification.type === "quiz_assignment_approved" && <Brain className="w-4 h-4 text-green-500 dark:text-green-400" />}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {(activeTab === 'flashcards' || activeTab === 'quizzes') && <Chatbot />}
      </div>
    </div>
  )
}
