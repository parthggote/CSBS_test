"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Timer,
  Brain,
  Award
} from "lucide-react"

export default function TakeQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [showExplanations, setShowExplanations] = useState(false)

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/resources?type=quizzes`, { credentials: 'include' })
        const quizzes = await res.json()
        const foundQuiz = Array.isArray(quizzes) ? quizzes.find((q: any) => q._id === quizId) : null
        
        if (!foundQuiz) {
          setError("Quiz not found")
          return
        }
        
        setQuiz(foundQuiz)
        setTimeLeft(foundQuiz.timeLimit * 60) // Convert to seconds
        
        // Set questions if they exist, otherwise use mock questions
        if (foundQuiz.questions && Array.isArray(foundQuiz.questions)) {
          setQuestions(foundQuiz.questions)
        } else {
          // Generate mock questions if none exist
          const mockQuestions = []
          for (let i = 0; i < foundQuiz.questionCount; i++) {
            mockQuestions.push({
              question: `Sample question ${i + 1} for ${foundQuiz.subject}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'A'
            })
          }
          setQuestions(mockQuestions)
        }
      } catch (err) {
        setError("Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, isSubmitted])

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitted) return
    
    // Calculate actual score based on correct answers
    let correctAnswers = 0
    const totalQuestions = questions.length
    
    Object.keys(answers).forEach(questionIndex => {
      const question = questions[parseInt(questionIndex)]
      if (question && answers[parseInt(questionIndex)] === question.correctAnswer) {
        correctAnswers++
      }
    })
    
    const actualScore = Math.floor((correctAnswers / totalQuestions) * 100)
    setScore(actualScore)
    setIsSubmitted(true)

    // Save result to backend
    try {
      await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz._id,
          score: actualScore,
          answers
        }),
        credentials: 'include'
      })
    } catch (err) {
      // Ignore errors for now
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={() => router.push('/quizzes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                <CardDescription>You have successfully completed the quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{score}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{Object.keys(answers).length}</div>
                    <div className="text-sm text-gray-600">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowExplanations(!showExplanations)}
                    variant="outline"
                    className="w-full"
                  >
                    {showExplanations ? 'Hide' : 'Show'} Answer Explanations
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/quizzes')}
                  >
                    Take Another Quiz
                  </Button>
                </div>

                {showExplanations && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Answer Explanations</h3>
                    {questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <p className="font-medium">Question {index + 1}: {question.question}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Correct Answer:</strong> {question.correctAnswer}
                        </p>
                        {question.explanation && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                        <p className="text-sm">
                          <strong>Your Answer:</strong> {answers[index] || 'Not answered'}
                          {answers[index] === question.correctAnswer ? (
                            <span className="text-green-600 ml-2">✓ Correct</span>
                          ) : answers[index] ? (
                            <span className="text-red-600 ml-2">✗ Incorrect</span>
                          ) : (
                            <span className="text-gray-500 ml-2">- Skipped</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  <CardDescription>{quiz.subject} • {quiz.difficulty} level</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={
                    quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {quiz.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-2 text-red-600">
                    <Timer className="w-5 h-5" />
                    <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Object.keys(answers).length} answered
                </span>
              </div>
              <Progress 
                value={(Object.keys(answers).length / questions.length) * 100} 
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Question {currentQuestion + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg">
                <p>{questions[currentQuestion]?.question || `Question ${currentQuestion + 1} for ${quiz.subject}`}</p>
              </div>
              
              <div className="space-y-3">
                {questions[currentQuestion]?.options?.map((option: string, index: number) => {
                  const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                  return (
                    <Button
                      key={index}
                      variant={answers[currentQuestion] === optionLetter ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect(optionLetter)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          {optionLetter}
                        </div>
                        <span>{option}</span>
                      </div>
                    </Button>
                  )
                }) || (
                  // Fallback options if no questions are loaded
                  <>
                    <Button
                      variant={answers[currentQuestion] === 'A' ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect('A')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          A
                        </div>
                        <span>Option A</span>
                      </div>
                    </Button>
                    <Button
                      variant={answers[currentQuestion] === 'B' ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect('B')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          B
                        </div>
                        <span>Option B</span>
                      </div>
                    </Button>
                    <Button
                      variant={answers[currentQuestion] === 'C' ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect('C')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          C
                        </div>
                        <span>Option C</span>
                      </div>
                    </Button>
                    <Button
                      variant={answers[currentQuestion] === 'D' ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect('D')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          D
                        </div>
                        <span>Option D</span>
                      </div>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                    >
                      Next
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 