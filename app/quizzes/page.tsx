"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Brain, 
  Clock, 
  Users, 
  Award, 
  Search, 
  Lock, 
  Play, 
  BookOpen,
  Target,
  Timer,
  CheckCircle,
  Star,
  Upload,
  FileText,
  Sparkles,
  Loader2
} from "lucide-react"
import Chatbot from '../../../components/Chatbot';

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    subject: '',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 30,
    description: ''
  })
  const [quizResults, setQuizResults] = useState<any[]>([])

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      try {
        const res = await fetch("/api/resources?type=quizzes")
        const data = await res.json()
        setQuizzes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/quiz-results', { credentials: 'include' })
        if (res.ok) {
          setQuizResults(await res.json())
        }
      } catch {}
    }
    fetchResults()
  }, [])

  const quizResultsMap = useMemo(() => {
    const map: Record<string, any> = {}
    quizResults.forEach((r: any) => { map[r.quizId] = r })
    return map
  }, [quizResults])

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      (quiz.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quiz.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quiz.difficulty?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800'
    ]
    const index = subject?.length || 0
    return colors[index % colors.length]
  }

  const handleStartQuiz = (quiz: any) => {
    if (!isLoggedIn) {
      // Redirect to login or show login modal
      return
    }
    // Navigate to quiz taking page
    window.location.href = `/quizzes/${quiz._id}/take`
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size should be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'quiz-generation')
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file')
      }

      const uploadData = await uploadRes.json()
      setUploadProgress(50)

      // Generate quiz from PDF using AI
      const quizRes = await fetch('/api/quiz-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          filename: uploadData.filename,
          ...uploadForm
        })
      })

      if (!quizRes.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quizResult = await quizRes.json()
      if (quizResult.success) {
        setQuizzes(prev => [quizResult.quiz, ...prev])
      } else {
        throw new Error(quizResult.error || 'Failed to generate quiz')
      }
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
      }, 1000)

    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  function handleDownloadResult(quiz: any, result: any) {
    // Generate a detailed result with explanations and user answers
    const questions = quiz.questions || [];
    let content = `Quiz: ${quiz.title}\nSubject: ${quiz.subject}\nScore: ${result.score}%\n\n`;
    questions.forEach((q: any, i: number) => {
      content += `Q${i + 1}: ${q.question}\n`;
      content += `Your Answer: ${result.answers[i] || 'Not answered'}\n`;
      content += `Correct Answer: ${q.correctAnswer}\n`;
      if (q.explanation) content += `Explanation: ${q.explanation}\n`;
      content += '\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, '_')}_Result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Interactive Quizzes</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test your knowledge with interactive quizzes. Upload your study materials to generate AI-powered quizzes!
          </p>
        </div>

        {/* AI Quiz Generation Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Generate Quiz from PDF</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your notes, textbooks, or study materials to create AI-generated quizzes
                    </p>
                  </div>
                </div>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
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
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum file size: 10MB. Supported: PDF files only.
                        </p>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
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
            </CardContent>
          </Card>
        </div>

        {!isLoggedIn && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Login required to take quizzes and track your progress.{" "}
              <Button variant="link" className="p-0 h-auto">
                Sign in
              </Button>{" "}
              to access all features.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">All Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Popular</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, subject, or difficulty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading quizzes...</p>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No quizzes found.</p>
                </div>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <CardDescription>{quiz.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty || 'Medium'}
                          </Badge>
                          {quiz.generatedFromPDF && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Subject:</span>
                          <Badge variant="outline" className={getSubjectColor(quiz.subject)}>
                            {quiz.subject || 'General'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{quiz.questionCount || 10}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Limit:</span>
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 mr-1" />
                            <span>{quiz.timeLimit || 30} min</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Participants:</span>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{quiz.participants || 0}</span>
                          </div>
                        </div>

                        {quiz.bestScore && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Best Score:</span>
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-1" />
                              <span>{quiz.bestScore}%</span>
                            </div>
                          </div>
                        )}

                        {quiz.generatedFromPDF && quiz.originalFile && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Source:</span>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              <span className="text-xs truncate max-w-20">{quiz.originalFile}</span>
                            </div>
                          </div>
                        )}

                        {quizResultsMap[quiz._id] && (
                          <div className="flex flex-col space-y-2 mt-2">
                            <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">Attempted</Badge>
                            <span className="text-sm text-gray-700 font-semibold">Score: {quizResultsMap[quiz._id].score}%</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDownloadResult(quiz, quizResultsMap[quiz._id])}
                            >
                              Download Result
                            </Button>
                          </div>
                        )}

                        <div className="pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full mb-2">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{quiz.title}</DialogTitle>
                                <DialogDescription>
                                  {quiz.subject} • {quiz.difficulty} • {quiz.questionCount} questions
                                  {quiz.generatedFromPDF && (
                                    <span className="ml-2">
                                      • <Sparkles className="w-3 h-3 inline mr-1" />
                                      AI Generated
                                    </span>
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-gray-700">{quiz.fullDescription || quiz.description}</p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Subject:</strong> {quiz.subject || 'General'}
                                  </div>
                                  <div>
                                    <strong>Difficulty:</strong> {quiz.difficulty || 'Medium'}
                                  </div>
                                  <div>
                                    <strong>Questions:</strong> {quiz.questionCount || 10}
                                  </div>
                                  <div>
                                    <strong>Time Limit:</strong> {quiz.timeLimit || 30} minutes
                                  </div>
                                  <div>
                                    <strong>Participants:</strong> {quiz.participants || 0}
                                  </div>
                                  <div>
                                    <strong>Best Score:</strong> {quiz.bestScore || 'N/A'}%
                                  </div>
                                </div>

                                {quiz.generatedFromPDF && quiz.originalFile && (
                                  <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center">
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      AI Generated Quiz
                                    </h4>
                                    <p className="text-sm text-gray-700">
                                      This quiz was automatically generated from: <strong>{quiz.originalFile}</strong>
                                    </p>
                                  </div>
                                )}

                                {quiz.instructions && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Instructions:</h4>
                                    <p className="text-sm text-gray-700">{quiz.instructions}</p>
                                  </div>
                                )}

                                <Button
                                  onClick={() => handleStartQuiz(quiz)}
                                  className="w-full"
                                  disabled={!isLoggedIn}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  {isLoggedIn ? "Start Quiz" : "Login to Start"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            onClick={() => handleStartQuiz(quiz)}
                            className="w-full"
                            disabled={!isLoggedIn}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            {isLoggedIn ? "Take Quiz" : "Login Required"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Recent quizzes will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Popular quizzes will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Completed quizzes will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Section */}
        <section className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">Quiz Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{quizzes.length}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {quizzes.filter(q => q.difficulty?.toLowerCase() === 'easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {quizzes.filter(q => q.difficulty?.toLowerCase() === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {quizzes.filter(q => q.difficulty?.toLowerCase() === 'hard').length}
              </div>
              <div className="text-sm text-gray-600">Hard Level</div>
            </div>
          </div>
        </section>
      </div>
      <Chatbot />
    </>
  )
} 