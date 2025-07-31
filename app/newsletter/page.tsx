"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Eye, Calendar, FileText, Mail, Bell, Archive } from "lucide-react"
import Image from "next/image"

export default function NewsletterPage() {
  const newsletters = [
    {
      id: 1,
      title: "CSBS Monthly - February 2024",
      description: "Latest updates on department activities, student achievements, and upcoming events",
      publishDate: "2024-02-01",
      coverImage: "/placeholder.svg?height=300&width=400",
      pdfUrl: "/newsletters/csbs-feb-2024.pdf",
      highlights: [
        "TCS Partnership Expansion",
        "Student Placement Updates",
        "Research Paper Publications",
        "Upcoming Tech Events",
      ],
      featured: true,
    },
    {
      id: 2,
      title: "CSBS Monthly - January 2024",
      description: "New year initiatives, hackathon results, and faculty achievements",
      publishDate: "2024-01-01",
      coverImage: "/placeholder.svg?height=300&width=400",
      pdfUrl: "/newsletters/csbs-jan-2024.pdf",
      highlights: ["New Year Resolutions", "Hackathon Winners", "Faculty Research Updates", "Alumni Success Stories"],
      featured: false,
    },
    {
      id: 3,
      title: "CSBS Monthly - December 2023",
      description: "Year-end review, achievements, and holiday celebrations",
      publishDate: "2023-12-01",
      coverImage: "/placeholder.svg?height=300&width=400",
      pdfUrl: "/newsletters/csbs-dec-2023.pdf",
      highlights: ["Year in Review", "Student Achievements", "Holiday Celebrations", "Looking Ahead to 2024"],
      featured: false,
    },
    {
      id: 4,
      title: "CSBS Monthly - November 2023",
      description: "Technical fest highlights, placement drives, and research updates",
      publishDate: "2023-11-01",
      coverImage: "/placeholder.svg?height=300&width=400",
      pdfUrl: "/newsletters/csbs-nov-2023.pdf",
      highlights: [
        "Technical Fest Success",
        "Placement Drive Results",
        "Research Collaborations",
        "Industry Partnerships",
      ],
      featured: false,
    },
  ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription")
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">CSBS Newsletter</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with monthly insights, achievements, and announcements from the CSBS department
          </p>
        </div>

        {/* Newsletter Subscription */}
        <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-blue-800">Subscribe to Our Newsletter</CardTitle>
            <CardDescription>
              Get the latest CSBS newsletter delivered directly to your inbox every month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <Input type="email" placeholder="Enter your email address" className="flex-1" required />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Join 500+ students and faculty members who receive our monthly updates
            </p>
          </CardContent>
        </Card>

        {/* Featured Newsletter */}
        {newsletters
          .filter((n) => n.featured)
          .map((newsletter) => (
            <Card key={newsletter.id} className="mb-12 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative">
                  <Image
                    src={newsletter.coverImage || "/placeholder.svg"}
                    alt={newsletter.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-600">Latest Issue</Badge>
                </div>
                <div className="p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(newsletter.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">{newsletter.title}</h2>
                  <p className="text-muted-foreground mb-6">{newsletter.description}</p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">In This Issue:</h3>
                    <ul className="space-y-2">
                      {newsletter.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {/* Newsletter Archive */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Newsletter Archive</h2>
            <div className="flex items-center text-muted-foreground">
              <Archive className="w-5 h-5 mr-2" />
              <span>{Array.isArray(newsletters) ? newsletters.length : 0} Issues Available</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsletters
              .filter((n) => !n.featured)
              .map((newsletter) => (
                <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={newsletter.coverImage || "/placeholder.svg"}
                      alt={newsletter.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(newsletter.publishDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-foreground">{newsletter.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{newsletter.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-foreground mb-2">Highlights:</h4>
                      <ul className="space-y-1">
                        {Array.isArray(newsletter.highlights) ? newsletter.highlights.slice(0, 2).map((highlight, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            {highlight}
                          </li>
                        )) : null}
                        {Array.isArray(newsletter.highlights) && newsletter.highlights.length > 2 && (
                          <li className="text-xs text-muted-foreground">+{newsletter.highlights.length - 2} more topics</li>
                        )}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Newsletter Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{Array.isArray(newsletters) ? newsletters.length : 0}</h3>
              <p className="text-muted-foreground">Issues Published</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">500+</h3>
              <p className="text-muted-foreground">Subscribers</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">2.5K+</h3>
              <p className="text-muted-foreground">Total Downloads</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
