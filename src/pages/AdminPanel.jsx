"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, Flag, TrendingUp, Search, CheckCircle, XCircle, Eye, Trash2, Shield, Star, Loader } from 'lucide-react'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [pendingBlogs, setPendingBlogs] = useState([])
  const [allBlogs, setAllBlogs] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [allJournals, setAllJournals] = useState([])
  
  const [userSearch, setUserSearch] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [blogSearch, setBlogSearch] = useState("")
  const [blogStatusFilter, setBlogStatusFilter] = useState("all")
  const [currentUserPage, setCurrentUserPage] = useState(1)
  const [currentBlogPage, setCurrentBlogPage] = useState(1)

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        
        const [statsRes, recentUsersRes, pendingContentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/admin/users/recent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/admin/content/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const statsData = await statsRes.json()
        const recentUsersData = await recentUsersRes.json()
        const pendingContentData = await pendingContentRes.json()

        if (statsData.success) {
          setStats(statsData.stats)
        }
        if (recentUsersData.success) {
          setRecentUsers(recentUsersData.users)
        }
        if (pendingContentData.success) {
          setPendingBlogs(pendingContentData.blogs)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const fetchAllUsers = async (page = 1, search = "", userType = "all") => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        userType: userType !== "all" ? userType : "all",
      })

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setAllUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchAllBlogs = async (page = 1, search = "", status = "all") => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        status: status !== "all" ? status : "all",
      })

      const response = await fetch(`${API_BASE_URL}/admin/blogs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setAllBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    }
  }

  const fetchAllTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setAllTasks(data.tasks)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchAllJournals = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/admin/journals`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setAllJournals(data.journals)
      }
    } catch (error) {
      console.error("Error fetching journals:", error)
    }
  }

  const handleUserSearch = (search) => {
    setUserSearch(search)
    setCurrentUserPage(1)
    fetchAllUsers(1, search, userTypeFilter)
  }

  const handleUserTypeFilter = (userType) => {
    setUserTypeFilter(userType)
    setCurrentUserPage(1)
    fetchAllUsers(1, userSearch, userType)
  }

  const handleBlogSearch = (search) => {
    setBlogSearch(search)
    setCurrentBlogPage(1)
    fetchAllBlogs(1, search, blogStatusFilter)
  }

  const handleBlogStatusFilter = (status) => {
    setBlogStatusFilter(status)
    setCurrentBlogPage(1)
    fetchAllBlogs(1, blogSearch, status)
  }

  const handleApproveBlog = async (blogId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setPendingBlogs(pendingBlogs.filter((blog) => blog._id !== blogId))
        alert("Blog approved successfully")
      }
    } catch (error) {
      console.error("Error approving blog:", error)
    }
  }

  const handleRejectBlog = async (blogId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}/reject`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setPendingBlogs(pendingBlogs.filter((blog) => blog._id !== blogId))
        alert("Blog rejected successfully")
      }
    } catch (error) {
      console.error("Error rejecting blog:", error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their data?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setRecentUsers(recentUsers.filter((user) => user._id !== userId))
        alert("User deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, content, and platform settings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{stats.studentUsers}</span> students,{" "}
                <span className="text-green-600">{stats.professionalUsers}</span> professionals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogs}</div>
              <p className="text-xs text-muted-foreground">Blog posts created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Journals</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJournals}</div>
              <p className="text-xs text-muted-foreground">Journal entries created</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {user.userType === "student" ? user.department : user.profession}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">{user.blogCount || 0} blogs</Badge>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{user.userType}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No users yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Content */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Content awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBlogs.length > 0 ? (
                    pendingBlogs.map((blog) => (
                      <div key={blog._id} className="border-l-4 border-yellow-500 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{blog.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              By {blog.author?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-transparent"
                              onClick={() => handleApproveBlog(blog._id)}
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-transparent"
                              onClick={() => handleRejectBlog(blog._id)}
                            >
                              <XCircle className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No pending content</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                  />
                </div>
                <Select value={userTypeFilter} onValueChange={handleUserTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.userType === "student" ? user.department : user.profession} • Joined{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge variant="default" className="capitalize">
                            {user.userType}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{user.blogCount} blogs</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 bg-transparent"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Blog Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blogs..."
                    className="pl-10"
                    value={blogSearch}
                    onChange={(e) => handleBlogSearch(e.target.value)}
                  />
                </div>
                <Select value={blogStatusFilter} onValueChange={handleBlogStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Review and manage blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allBlogs.length > 0 ? (
                  allBlogs.map((blog) => (
                    <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{blog.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          By {blog.author?.name || "Unknown"} • {blog.author?.userType}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">{blog.category}</Badge>
                          <Badge variant={blog.isDraft ? "secondary" : "default"}>
                            {blog.isDraft ? "Draft" : "Published"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">{blog.views} views</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {blog.isDraft && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveBlog(blog._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No blogs found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Content */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Content</CardTitle>
              <CardDescription>Manage featured blogs and announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No featured content selected</p>
                <Button className="mt-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]">
                  Feature Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Platform usage and activity reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Total Content Created</h4>
                  <p className="text-2xl font-bold">
                    {(stats?.totalBlogs || 0) + (stats?.totalTasks || 0) + (stats?.totalJournals || 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {stats?.totalBlogs || 0} blogs, {stats?.totalTasks || 0} tasks, {stats?.totalJournals || 0} journals
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">User Distribution</h4>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {stats?.studentUsers || 0} students, {stats?.professionalUsers || 0} professionals
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Pending Reviews</h4>
                  <p className="text-2xl font-bold">{pendingBlogs.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Blogs awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPanel
