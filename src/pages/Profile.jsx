"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Edit, Save, Camera, Bell, Shield, Trophy } from 'lucide-react'
import jsPDF from "jspdf";

const PROGRESS_KEY = (uid) => `sb_progress_${uid}`
const CERTS_KEY = (uid) => `sb_certificates_${uid}`
const BLOG_FEED_KEY = "sb_blog_feed"

const COURSE_TITLES = {
  "ui-ux": "UI/UX Design",
  "web-dev": "Web Development",
  devops: "DevOps",
  "data-structures": "Data Structures",
}

function loadProgress(uid) {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY(uid)) || "{}")
  } catch {
    return {}
  }
}
function loadCerts(uid) {
  try {
    return JSON.parse(localStorage.getItem(CERTS_KEY(uid)) || "{}")
  } catch {
    return {}
  }
}
function appendBlogPost(post) {
  const prev = JSON.parse(localStorage.getItem(BLOG_FEED_KEY) || "[]")
  localStorage.setItem(BLOG_FEED_KEY, JSON.stringify([post, ...prev]))
}

function generateCertificatePdf({ name, courseTitle, dateISO }) {
  const doc = new jsPDF({ orientation: "landscape" })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Simple styled certificate (matches Skill Builder)
  doc.setFillColor(235, 244, 246)
  doc.rect(0, 0, w, h, "F")
  doc.setDrawColor(7, 25, 82)
  doc.setLineWidth(2)
  doc.rect(10, 10, w - 20, h - 20)

  doc.setTextColor(7, 25, 82)
  doc.setFontSize(26)
  doc.text("Certificate of Completion", w / 2, 40, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(8, 131, 149)
  doc.text("This certifies that", w / 2, 55, { align: "center" })
  doc.setFontSize(28)
  doc.setTextColor(7, 25, 82)
  doc.text(name || "Learner", w / 2, 72, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(7, 25, 82)
  doc.text(`has successfully completed`, w / 2, 90, { align: "center" })
  doc.setFontSize(18)
  doc.setTextColor(55, 183, 195)
  doc.text(courseTitle, w / 2, 105, { align: "center" })
  const date = new Date(dateISO).toLocaleDateString()
  doc.setFontSize(12)
  doc.setTextColor(7, 25, 82)
  doc.text(`Date: ${date}`, w / 2, 120, { align: "center" })

  return doc
}

export default function Profile() {
  const { user, token } = useAuth() || {}
  const userId = user?._id || "guest"
  const userName = user?.name || "Learner"

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    department: user?.department || "",
    year: user?.year || "",
    interests: user?.interests || [],
    website: user?.website || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? false,
    weeklyDigest: user?.preferences?.weeklyDigest ?? true,
    mentorshipRequests: user?.preferences?.mentorshipRequests ?? true,
    blogComments: user?.preferences?.blogComments ?? true,
    profileVisibility: user?.preferences?.profileVisibility || "public",
    showEmail: user?.preferences?.showEmail ?? false,
    showPhone: user?.preferences?.showPhone ?? false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [completedCourses, setCompletedCourses] = useState([])

  useEffect(() => {
    const progress = loadProgress(userId)
    const certs = loadCerts(userId)
    const results = Object.keys(progress)
      .map((courseId) => {
        const modules = Object.values(progress[courseId] || {})
        const complete = modules.length >= 5 && modules.filter(Boolean).length === 5
        if (!complete) return null
        const title = COURSE_TITLES[courseId] || certs[courseId]?.courseTitle || courseId
        const dateISO = certs[courseId]?.date || new Date().toISOString()
        return { courseId, title, dateISO }
      })
      .filter(Boolean)
    setCompletedCourses(results)
  }, [userId])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        department: user.department || "",
        year: user.year || "",
        interests: user.interests || [],
        website: user.website || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
      })
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? false,
        weeklyDigest: user.preferences?.weeklyDigest ?? true,
        mentorshipRequests: user.preferences?.mentorshipRequests ?? true,
        blogComments: user.preferences?.blogComments ?? true,
        profileVisibility: user.preferences?.profileVisibility || "public",
        showEmail: user.preferences?.showEmail ?? false,
        showPhone: user.preferences?.showPhone ?? false,
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          preferences
        }),
        credentials: "include"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      
      localStorage.setItem("user", JSON.stringify(data.user))
      window.location.reload()
    } catch (err) {
      setError(err.message || "Error updating profile")
      console.error("Profile update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match")
        return
      }

      setLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
        credentials: "include"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password")
      }

      setSuccess("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (err) {
      setError(err.message || "Error updating password")
      console.error("Password update error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button 
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={loading}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg?height=96&width=96&query=avatar"}
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <h2 className="text-xl font-semibold mt-4">{user?.name || "User"}</h2>
                <p className="text-muted-foreground">{user?.department}</p>
                <p className="text-sm text-muted-foreground">{user?.year}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 w-[430px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
              </CardTitle>
              <CardDescription>Your completed courses and certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed courses yet. Start learning in Skill Builder!
                </p>
              ) : (
                completedCourses.map((c) => (
                  <div key={c.courseId} className="flex items-center gap-3">
                    <Badge variant="secondary">{c.title}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(c.dateISO).toLocaleDateString()}</span>
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadCertificate(c)}>
                        Download Certificate
                      </Button>
                      <Button size="sm" onClick={() => shareAchievement(c)}>
                        Share
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData((p) => ({ ...p, location: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData((p) => ({ ...p, bio: e.target.value }))}
                      disabled={!isEditing}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData((p) => ({ ...p, website: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={profileData.github}
                        onChange={(e) => setProfileData((p) => ({ ...p, github: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData((p) => ({ ...p, linkedin: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" /> Notifications
                  </CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, emailNotifications: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, pushNotifications: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly summaries</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyDigest}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, weeklyDigest: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mentorship Requests</Label>
                      <p className="text-sm text-muted-foreground">Allow mentorship requests</p>
                    </div>
                    <Switch
                      checked={preferences.mentorshipRequests}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, mentorshipRequests: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Blog Comments</Label>
                      <p className="text-sm text-muted-foreground">Notify about blog comments</p>
                    </div>
                    <Switch
                      checked={preferences.blogComments}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, blogComments: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && passwordData.currentPassword && (
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      Update Password
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
