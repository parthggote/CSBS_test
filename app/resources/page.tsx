"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Award,
  Code,
  MessageSquare,
  Download,
  Search,
  Lock,
  ExternalLink,
  BookOpen,
  Trophy,
  HelpCircle,
} from "lucide-react"

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from auth context
  const [resources, setResources] = useState({ pyqs: [], certifications: [], hackathons: [], interviews: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      const types = ["pyqs", "certifications", "hackathons", "interviews"];
      const results: any = {};
      for (const type of types) {
        const res = await fetch(`/api/resources?type=${type}`);
        const data = await res.json();
        results[type] = Array.isArray(data) ? data : [];
      }
      setResources(results);
      setLoading(false);
    }
    fetchResources();
  }, []);

  const filteredPyqs = (resources.pyqs as any[]).filter(
    (pyq) =>
      (pyq.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pyq.year || '').includes(searchTerm) ||
      (pyq.semester || '').includes(searchTerm)
  )

  const handleDownload = (type: string, resourceId: string) => {
    setResources((prev: any) => {
      const updated = { ...prev };
      updated[type] = updated[type].map((res: any) =>
        res._id === resourceId ? { ...res, downloads: (res.downloads || 0) + 1 } : res
      );
      return updated;
    });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Academic Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access study materials, certifications, hackathon alerts, and interview preparation resources
          </p>
        </div>

        {!isLoggedIn && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Some resources require student login.{" "}
              <Button variant="link" className="p-0 h-auto">
                Sign in
              </Button>{" "}
              to access all materials.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pyqs" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="pyqs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PYQs</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Certifications</span>
            </TabsTrigger>
            <TabsTrigger value="hackathons" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Hackathons</span>
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Interviews</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pyqs">
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by subject, year, or semester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPyqs.map((pyq: any) => (
                <Card key={pyq._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pyq.title || pyq.subject}</CardTitle>
                        <CardDescription>
                          Semester: {pyq.semester || "-"} • Year: {pyq.year || "-"}
                        </CardDescription>
                      </div>
                      <Badge variant={pyq.examType === "mid-term" ? "default" : "secondary"}>{pyq.examType || pyq.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">{pyq.downloads || 0} downloads</span>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    {pyq.fileId ? (
                      <Button
                        className="w-full"
                        asChild
                        disabled={!isLoggedIn}
                        onClick={() => handleDownload(pyq.type || 'pyqs', pyq._id)}
                      >
                        <a href={`/api/files/${pyq.fileId}?type=${pyq.type || 'pyqs'}&resourceId=${pyq._id}`} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          {isLoggedIn ? "Download" : "Login to Download"}
                        </a>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                      <Download className="w-4 h-4 mr-2" />
                        Not Available
                    </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(resources.certifications) ? resources.certifications : []).map((cert: any) => (
                <Card key={cert._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        <CardDescription>{cert.provider}</CardDescription>
                      </div>
                      {cert.recommended && <Badge className="bg-green-100 text-green-800">Recommended</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cert.level && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Level:</span>
                        <Badge variant="outline">{cert.level}</Badge>
                      </div>
                      )}
                      {cert.duration && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span>{cert.duration}</span>
                      </div>
                      )}
                      {cert.year && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span>{cert.year}</span>
                        </div>
                      )}
                      {cert.semester && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Semester:</span>
                          <span>{cert.semester}</span>
                        </div>
                      )}
                      {cert.downloads !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Downloads:</span>
                          <span>{cert.downloads}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-700">{cert.description}</p>
                      {cert.fileId && (
                        <Button className="w-full" asChild disabled={!isLoggedIn}>
                          <a href={`/api/files/${cert.fileId}?type=certifications&resourceId=${cert._id}`} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            {isLoggedIn ? "Download" : "Login to Download"}
                          </a>
                        </Button>
                      )}
                      {cert.link && (
                      <Button className="w-full" asChild>
                        <a href={cert.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </a>
                      </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hackathons">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(resources.hackathons) ? resources.hackathons : []).map((hackathon: any) => (
                <Card key={hackathon._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{hackathon.title}</CardTitle>
                        <CardDescription>{hackathon.organizer}</CardDescription>
                      </div>
                      {hackathon.status && (
                        <Badge className={hackathon.status === "Open" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{hackathon.status}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hackathon.deadline && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(hackathon.deadline).toLocaleDateString()}</span>
                      </div>
                      )}
                      {hackathon.prize && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prize:</span>
                        <span className="font-medium text-green-600">{hackathon.prize}</span>
                      </div>
                      )}
                      {hackathon.year && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span>{hackathon.year}</span>
                        </div>
                      )}
                      {hackathon.semester && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Semester:</span>
                          <span>{hackathon.semester}</span>
                        </div>
                      )}
                      {hackathon.downloads !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Downloads:</span>
                          <span>{hackathon.downloads}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-700">{hackathon.description}</p>
                      {hackathon.fileId && (
                        <Button className="w-full" asChild disabled={!isLoggedIn}>
                          <a href={`/api/files/${hackathon.fileId}?type=hackathons&resourceId=${hackathon._id}`} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            {isLoggedIn ? "Download" : "Login to Download"}
                          </a>
                        </Button>
                      )}
                      {hackathon.link && (
                        <Button className="w-full" asChild>
                          <a href={hackathon.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Learn More
                          </a>
                      </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid md:grid-cols-2 gap-6">
              {(Array.isArray(resources.interviews) ? resources.interviews : []).map((interview: any) => (
                <Card key={interview._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{interview.company || interview.title}</CardTitle>
                        <CardDescription>{interview.role}</CardDescription>
                      </div>
                      {interview.difficulty && (
                      <Badge
                        variant={
                          interview.difficulty === "Easy"
                            ? "default"
                            : interview.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {interview.difficulty}
                      </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interview.questions && Array.isArray(interview.questions) && interview.questions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Sample Questions:</h4>
                        <ul className="space-y-1">
                            {Array.isArray(interview.questions) ? interview.questions.slice(0, 2).map((question: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {question}
                            </li>
                            )) : null}
                        </ul>
                          {Array.isArray(interview.questions) && interview.questions.length > 2 && (
                          <p className="text-sm text-gray-500 mt-2">+{interview.questions.length - 2} more questions</p>
                        )}
                      </div>
                      )}
                      {interview.year && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span>{interview.year}</span>
                        </div>
                      )}
                      {interview.semester && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Semester:</span>
                          <span>{interview.semester}</span>
                        </div>
                      )}
                      {interview.downloads !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Downloads:</span>
                          <span>{interview.downloads}</span>
                        </div>
                      )}
                      {interview.lastUpdated && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Updated: {new Date(interview.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      )}
                      {interview.fileId && (
                        <Button className="w-full" asChild disabled={!isLoggedIn}>
                          <a href={`/api/files/${interview.fileId}?type=interviews&resourceId=${interview._id}`} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            {isLoggedIn ? "Download" : "Login to Download"}
                          </a>
                      </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>

        {/* Admin Notice */}
        <div className="mt-12 text-center">
          <Alert className="max-w-2xl mx-auto">
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Resources are regularly updated by department administrators. Contact faculty for specific resource
              requests or to report issues.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
