"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { COURSES, THEME } from "./learning-materials"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, CheckCircle2, Trophy, BookOpen } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { jsPDF } from "jspdf"

const PROGRESS_KEY = (uid) => `sb_progress_${uid}`
const CERTS_KEY = (uid) => `sb_certificates_${uid}`
const BLOG_FEED_KEY = "sb_blog_feed"

// Helpers
function loadProgress(uid) {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY(uid)) || "{}")
  } catch {
    return {}
  }
}
function saveProgress(uid, progress) {
  localStorage.setItem(PROGRESS_KEY(uid), JSON.stringify(progress))
}
function loadCerts(uid) {
  try {
    return JSON.parse(localStorage.getItem(CERTS_KEY(uid)) || "{}")
  } catch {
    return {}
  }
}
function saveCerts(uid, certs) {
  localStorage.setItem(CERTS_KEY(uid), JSON.stringify(certs))
}
function appendBlogPost(post) {
  const prev = JSON.parse(localStorage.getItem(BLOG_FEED_KEY) || "[]")
  localStorage.setItem(BLOG_FEED_KEY, JSON.stringify([post, ...prev]))
}

function generateCertificatePdf({ name, courseTitle, dateISO }) {
  const date = new Date(dateISO).toLocaleDateString()
  const doc = new jsPDF({ orientation: "landscape" })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(235, 244, 246) // surface
  doc.rect(0, 0, w, h, "F")

  // Border
  doc.setDrawColor(7, 25, 82) // primary
  doc.setLineWidth(2)
  doc.rect(10, 10, w - 20, h - 20)

  // Heading
  doc.setTextColor(7, 25, 82)
  doc.setFontSize(26)
  doc.text("Certificate of Completion", w / 2, 40, { align: "center" })

  // Subtitle
  doc.setFontSize(14)
  doc.setTextColor(8, 131, 149)
  doc.text("This certifies that", w / 2, 55, { align: "center" })

  // Name
  doc.setFontSize(28)
  doc.setTextColor(7, 25, 82)
  doc.text(name || "Learner", w / 2, 72, { align: "center" })

  // Body
  doc.setFontSize(14)
  doc.setTextColor(7, 25, 82)
  doc.text(`has successfully completed the course`, w / 2, 90, { align: "center" })
  doc.setFontSize(18)
  doc.setTextColor(55, 183, 195)
  doc.text(courseTitle, w / 2, 105, { align: "center" })
  doc.setFontSize(12)
  doc.setTextColor(7, 25, 82)
  doc.text(`Date: ${date}`, w / 2, 120, { align: "center" })

  // Seal
  doc.setFillColor(8, 131, 149)
  doc.circle(w - 40, h - 35, 18, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Skill", w - 40, h - 39, { align: "center" })
  doc.text("Builder", w - 40, h - 30, { align: "center" })

  return doc
}

export default function SkillBuilder() {
  const { user } = useAuth() || {}
  const userId = user?._id || "guest"
  const userName = user?.name || "Learner"

  const [selectedCourseId, setSelectedCourseId] = useState(COURSES[0].id)
  const [progress, setProgress] = useState({})
  const [certs, setCerts] = useState({})
  const [answers, setAnswers] = useState({}) // { [courseId]: { [moduleId]: { [idx]: option } } }
  const [blogContent, setBlogContent] = useState("")

  // Load persisted state
  useEffect(() => {
    setProgress(loadProgress(userId))
    setCerts(loadCerts(userId))
  }, [userId])

  // Derived data
  const selectedCourse = useMemo(() => COURSES.find((c) => c.id === selectedCourseId), [selectedCourseId])

  const courseProgressPct = useMemo(() => {
    const mods = selectedCourse?.modules?.length || 0
    if (!mods) return 0
    const completed = Object.values(progress[selectedCourseId] || {}).filter(Boolean).length
    return Math.round((completed / mods) * 100)
  }, [progress, selectedCourseId, selectedCourse])

  const courseCompleted = useMemo(() => {
    const mods = selectedCourse?.modules?.length || 0
    if (!mods) return false
    return Object.values(progress[selectedCourseId] || {}).filter(Boolean).length === mods
  }, [progress, selectedCourseId, selectedCourse])

  // Handlers
  const setAnswer = (moduleId, qIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [selectedCourseId]: {
        ...(prev[selectedCourseId] || {}),
        [moduleId]: { ...(prev[selectedCourseId]?.[moduleId] || {}), [qIndex]: option },
      },
    }))
  }

  const submitQuiz = (module) => {
    const given = answers[selectedCourseId]?.[module.id] || {}
    const allCorrect = module.quiz.every((q, i) => q.answer === given[i])
    if (!allCorrect) {
      alert("Incorrect answers. Please review materials and try again.")
      return
    }
    const next = {
      ...progress,
      [selectedCourseId]: { ...(progress[selectedCourseId] || {}), [module.id]: true },
    }
    setProgress(next)
    saveProgress(userId, next)

    // If finished all modules → set certificate
    const total = selectedCourse.modules.length
    const done = Object.values(next[selectedCourseId] || {}).filter(Boolean).length
    if (done === total) {
      const nextCerts = {
        ...certs,
        [selectedCourseId]: { date: new Date().toISOString(), courseTitle: selectedCourse.title },
      }
      setCerts(nextCerts)
      saveCerts(userId, nextCerts)
    }
  }

  const downloadCertificate = (courseId) => {
    const meta = certs[courseId]
    if (!meta) return
    const doc = generateCertificatePdf({
      name: userName,
      courseTitle: meta.courseTitle,
      dateISO: meta.date,
    })
    doc.save(`${userName}-${meta.courseTitle}-certificate.pdf`)
  }

  const shareAchievement = (courseId) => {
    const meta = certs[courseId]
    if (!meta) return
    const post = {
      userId,
      userName,
      title: `Completed ${meta.courseTitle}!`,
      content: `I just completed the ${meta.courseTitle} course and earned a certificate!`,
      date: new Date().toISOString(),
      courseId,
    }
    appendBlogPost(post)
    alert("Shared your achievement to the blog feed!")
  }

  // Theme helpers
  const chip = (text) => (
    <Badge key={text} className="text-xs" style={{ backgroundColor: THEME.accent, color: "#00313A" }}>
      {text}
    </Badge>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg p-6" style={{ backgroundColor: THEME.primary, color: "white" }}>
        <h1 className="text-3xl font-bold text-balance">Skill Builder</h1>
        <p className="opacity-90">Explore learning paths and track your progress</p>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COURSES.map((course) => {
          const mods = course.modules.length
          const done = Object.values(progress[course.id] || {}).filter(Boolean).length
          const pct = Math.round((done / mods) * 100)
          const completed = done === mods
          return (
            <Card
              key={course.id}
              className={`cursor-pointer transition-all ${selectedCourseId === course.id ? "ring-2" : ""}`}
              style={{
                borderColor: selectedCourseId === course.id ? THEME.accent : undefined,
              }}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{course.title}</span>
                  {completed ? (
                    <Trophy style={{ color: THEME.accent }} className="w-5 h-5" />
                  ) : (
                    <BookOpen style={{ color: THEME.secondary }} className="w-5 h-5" />
                  )}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex gap-2 flex-wrap">
                    {chip(`${done}/${mods} modules`)}
                    {completed && chip("Completed")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Course */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{selectedCourse.title}</CardTitle>
          <CardDescription className="text-pretty">{selectedCourse.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="materials">All Materials</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            {/* Modules */}
            <TabsContent value="modules" className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{courseProgressPct}%</span>
                  </div>
                  <Progress value={courseProgressPct} className="h-2" />
                </div>
                {courseCompleted && certs[selectedCourseId] && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadCertificate(selectedCourseId)}
                      style={{ backgroundColor: THEME.secondary, color: "white" }}
                    >
                      Download Certificate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareAchievement(selectedCourseId)}
                      style={{ borderColor: THEME.accent, color: THEME.primary }}
                    >
                      Share Achievement
                    </Button>
                  </div>
                )}
              </div>

              {selectedCourse.modules.map((module, idx) => {
                const unlocked = idx === 0 || !!progress[selectedCourseId]?.[module.id - 1]
                const completed = !!progress[selectedCourseId]?.[module.id]
                const moduleAnswers = answers[selectedCourseId]?.[module.id] || {}

                return (
                  <Card
                    key={module.id}
                    className={`transition-all ${!unlocked ? "opacity-60" : ""}`}
                    style={{
                      backgroundColor: completed ? THEME.surface : undefined,
                      borderColor: completed ? THEME.accent : undefined,
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{module.title}</CardTitle>
                        {completed && <CheckCircle2 className="w-6 h-6" style={{ color: "#16a34a" }} />}
                      </div>
                      <CardDescription>{module.content}</CardDescription>
                    </CardHeader>
                    <CardContent className={`${!unlocked ? "pointer-events-none" : ""}`}>
                      {/* Learning Materials */}
                      <div className="space-y-3">
                        <h4 className="font-semibold" style={{ color: THEME.primary }}>
                          Learning Materials
                        </h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {module.materials.map((m, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              onClick={() => window.open(m.url, "_blank")}
                              className="justify-start"
                              style={{
                                borderColor: THEME.accent,
                                color: THEME.primary,
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {m.type.toUpperCase()}: {m.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Quiz */}
                      <div className="mt-6 space-y-3">
                        <h4 className="font-semibold" style={{ color: THEME.primary }}>
                          MCQs
                        </h4>
                        <div className="space-y-4">
                          {module.quiz.map((q, qIndex) => (
                            <div key={qIndex}>
                              <p className="text-sm font-medium">{q.question}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {q.options.map((opt) => {
                                  const selected = moduleAnswers[qIndex] === opt
                                  return (
                                    <Button
                                      key={opt}
                                      size="sm"
                                      variant={selected ? "default" : "outline"}
                                      onClick={() => setAnswer(module.id, qIndex, opt)}
                                      style={
                                        selected
                                          ? { backgroundColor: THEME.secondary, color: "white" }
                                          : { borderColor: THEME.accent, color: THEME.primary }
                                      }
                                      disabled={completed}
                                    >
                                      {opt}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="mt-2"
                          onClick={() => submitQuiz(module)}
                          disabled={completed}
                          style={{ backgroundColor: THEME.secondary, color: "white" }}
                        >
                          {completed ? "Completed" : "Submit Quiz to Unlock Next"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            {/* All materials list */}
            <TabsContent value="materials" className="pt-4 space-y-4">
              {selectedCourse.modules.map((m) => (
                <Card key={m.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{m.title}</CardTitle>
                    <CardDescription>{m.content}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {m.materials.map((mat, i) => (
                      <Button
                        key={`${m.id}-${i}`}
                        variant="outline"
                        onClick={() => window.open(mat.url, "_blank")}
                        style={{ borderColor: THEME.accent, color: THEME.primary }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {mat.type.toUpperCase()}: {mat.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Community share */}
            <TabsContent value="community" className="pt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Learning Journey</CardTitle>
                  <CardDescription>Post to the community blog feed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder={`What did you learn in ${selectedCourse.title}?`}
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!blogContent.trim()) return
                        appendBlogPost({
                          userId,
                          userName,
                          title: `My ${selectedCourse.title} Journey`,
                          content: blogContent.trim(),
                          date: new Date().toISOString(),
                          courseId: selectedCourseId,
                        })
                        setBlogContent("")
                        alert("Blog posted successfully!")
                      }}
                      style={{ backgroundColor: THEME.secondary, color: "white" }}
                    >
                      Post Blog
                    </Button>
                    {certs[selectedCourseId] && (
                      <Button
                        variant="outline"
                        onClick={() => shareAchievement(selectedCourseId)}
                        style={{ borderColor: THEME.accent, color: THEME.primary }}
                      >
                        Share Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

