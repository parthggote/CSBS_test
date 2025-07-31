"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, Search, Plus, Clock, CheckCircle } from "lucide-react"

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const discussions = [
    {
      id: 1,
      title: "How to prepare for TCS CodeVita?",
      content:
        "I'm planning to participate in TCS CodeVita this year. Can anyone share preparation tips and resources?",
      author: {
        name: "Priya Sharma",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Student",
        semester: "6th",
      },
      category: "Competitive Programming",
      createdAt: "2024-01-20T10:30:00Z",
      replies: 12,
      likes: 8,
      dislikes: 0,
      solved: false,
      tags: ["TCS", "CodeVita", "Programming"],
    },
    {
      id: 2,
      title: "Best resources for learning React.js?",
      content:
        "I want to learn React.js for my final year project. What are the best online resources and tutorials you'd recommend?",
      author: {
        name: "Rahul Kumar",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Student",
        semester: "7th",
      },
      category: "Web Development",
      createdAt: "2024-01-19T15:45:00Z",
      replies: 18,
      likes: 15,
      dislikes: 1,
      solved: true,
      tags: ["React", "JavaScript", "Frontend"],
    },
    {
      id: 3,
      title: "Database normalization doubt",
      content: "Can someone explain the difference between 2NF and 3NF with examples? I'm confused about the concepts.",
      author: {
        name: "Anita Patel",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Student",
        semester: "5th",
      },
      category: "Database",
      createdAt: "2024-01-18T09:15:00Z",
      replies: 7,
      likes: 12,
      dislikes: 0,
      solved: true,
      tags: ["Database", "Normalization", "SQL"],
    },
    {
      id: 4,
      title: "Internship opportunities at TCS",
      content: "Has anyone applied for TCS internships? What's the selection process like and what should I prepare?",
      author: {
        name: "Vikram Singh",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Student",
        semester: "6th",
      },
      category: "Career",
      createdAt: "2024-01-17T14:20:00Z",
      replies: 25,
      likes: 22,
      dislikes: 2,
      solved: false,
      tags: ["TCS", "Internship", "Career"],
    },
  ]

  const categories = [
    "all",
    "Programming",
    "Web Development",
    "Database",
    "Career",
    "Competitive Programming",
    "Projects",
    "General",
  ]

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch =
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || discussion.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discussion Forum</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with peers, ask questions, and share knowledge
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search discussions, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start a New Discussion</DialogTitle>
                <DialogDescription>Ask a question or start a discussion with your peers</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter discussion title..." />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" placeholder="Describe your question or topic in detail..." rows={6} />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="e.g., React, JavaScript, Frontend" />
                </div>
                <Button className="w-full">Post Discussion</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Discussion List */}
        <div className="space-y-6">
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar>
                      <AvatarImage src={discussion.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {discussion.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">{discussion.title}</CardTitle>
                        {discussion.solved && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{discussion.author.name}</span>
                        <span>•</span>
                        <span>{discussion.author.semester} Semester</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(discussion.createdAt)}
                        </div>
                      </div>
                      <CardDescription className="mb-3">{discussion.content}</CardDescription>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline">{discussion.category}</Badge>
                        {discussion.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {discussion.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        {discussion.dislikes}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{discussion.replies} replies</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDiscussions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No discussions found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to start a discussion!"}
            </p>
          </div>
        )}

        {/* Forum Guidelines */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Forum Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Be respectful and constructive in your discussions</li>
              <li>• Search existing discussions before posting new ones</li>
              <li>• Use clear, descriptive titles for your posts</li>
              <li>• Mark discussions as solved when your question is answered</li>
              <li>• Help others by sharing your knowledge and experience</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
