"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bookmark,
  Search,
  Heart,
  MessageCircle,
  Eye,
  Trash2,
  Share,
  FolderPlus,
  Folder,
  X,
  FolderOpen,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Library = () => {
  const { user, token } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [library, setLibrary] = useState([])
  const [folders, setFolders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState("bg-blue-500")
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [selectedBlogToMove, setSelectedBlogToMove] = useState(null)
  const [selectedMoveFolder, setSelectedMoveFolder] = useState("")

  const categories = [
    "All",
    "Technology",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Education",
    "Entertainment",
    "Sports",
    "Other",
  ]

  const colors = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Red", value: "bg-red-500" },
  ]

  // Fetch library data
  useEffect(() => {
    if (user && token) {
      fetchLibrary()
      fetchFolders()
      fetchStats()
    }
  }, [user, token, selectedFolder, selectedCategory, searchTerm])

  useEffect(() => {
    const handleWindowFocus = () => {
      if (user && token) {
        fetchLibrary()
        fetchStats()
      }
    }

    window.addEventListener("focus", handleWindowFocus)
    return () => window.removeEventListener("focus", handleWindowFocus)
  }, [user, token, selectedFolder, selectedCategory, searchTerm])

  const fetchLibrary = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        folder: selectedFolder,
        category: selectedCategory,
        search: searchTerm,
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/my-library?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setLibrary(data.library)
      }
    } catch (error) {
      console.error("Fetch library error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/folders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setFolders(data.folders)
      }
    } catch (error) {
      console.error("Fetch folders error:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Fetch stats error:", error)
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/folders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newFolderName,
          color: newFolderColor,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewFolderName("")
        setNewFolderColor("bg-blue-500")
        setShowNewFolderModal(false)
        fetchFolders()
      }
    } catch (error) {
      console.error("Create folder error:", error)
    }
  }

  const handleRemoveFromLibrary = async (libraryId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/${libraryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        fetchLibrary()
        fetchStats()
      }
    } catch (error) {
      console.error("Remove from library error:", error)
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Are you sure? Items in this folder will be moved to 'My Saves'")) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        fetchFolders()
        setSelectedFolder("all")
        fetchLibrary()
      }
    } catch (error) {
      console.error("Delete folder error:", error)
    }
  }

  const handleMoveBlog = async () => {
    if (!selectedBlogToMove || !selectedMoveFolder) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/library/${selectedBlogToMove._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folder: selectedMoveFolder,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMoveModalOpen(false)
        setSelectedBlogToMove(null)
        setSelectedMoveFolder("")
        fetchLibrary()
        fetchStats()
      }
    } catch (error) {
      console.error("Move blog error:", error)
    }
  }

  const BlogCard = ({ item }) => {
    const blog = item.blog
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={blog.coverImage || "/placeholder.svg?height=150&width=250&query=blog"}
              alt={blog.title}
              className="w-full h-32 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </div>
          <div className="md:w-2/3 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#AF0171] cursor-pointer mb-1">
                  {blog.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={`/.jpg?height=20&width=20&query=${blog.author.name}`} />
                    <AvatarFallback>
                      {blog.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{blog.author.name}</span>
                  <span>•</span>
                  <span>{blog.author.department}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFromLibrary(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">{blog.content}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{blog.likes.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{blog.comments.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">Saved {new Date(item.savedAt).toLocaleDateString()}</div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                <Folder className="h-3 w-3 mr-1" />
                {item.folder}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBlogToMove(item)
                  setSelectedMoveFolder(item.folder)
                  setMoveModalOpen(true)
                }}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Move
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Your collection of saved blogs and bookmarks</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0D3B99] to-[#007BFF]" onClick={() => setShowNewFolderModal(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSaved || 0}</div>
            <p className="text-xs text-muted-foreground">Blogs bookmarked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.folders || 0}</div>
            <p className="text-xs text-muted-foreground">Organized collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">New bookmarks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostActiveFolder || "None"}</div>
            <p className="text-xs text-muted-foreground">Top folder</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder("all")}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    selectedFolder === "all" ? "bg-[#0D3B99] text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4" />
                      <span>All Items</span>
                    </div>
                    <span className="text-sm">{stats.totalSaved || 0}</span>
                  </div>
                </button>
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className={`w-full text-left p-2 rounded-lg transition-colors group relative ${
                      selectedFolder === folder.name
                        ? "bg-[#0D3B99] text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedFolder(folder.name)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${folder.color}`}></div>
                        <span>{folder.name}</span>
                      </div>
                      <span className="text-sm">{folder.count}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder._id)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowNewFolderModal(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search saved blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase().replace(" ", "-")}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Saved Blogs */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF0171] mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
                  </div>
                </CardContent>
              </Card>
            ) : library.length > 0 ? (
              library.map((item) => <BlogCard key={item._id} item={item} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved blogs found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    {searchTerm || selectedCategory !== "all" || selectedFolder !== "all"
                      ? "Try adjusting your search or filters."
                      : "Start bookmarking blogs to build your personal library."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create New Folder</CardTitle>
              <button onClick={() => setShowNewFolderModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Folder Name</label>
                  <Input
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewFolderColor(color.value)}
                        className={`w-8 h-8 rounded-full ${color.value} ${
                          newFolderColor === color.value ? "ring-2 ring-offset-2" : ""
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-[#0D3B99] to-[#007BFF]">Create</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Move Blog Modal */}
      {moveModalOpen && selectedBlogToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Move Blog to Folder</CardTitle>
              <button
                onClick={() => {
                  setMoveModalOpen(false)
                  setSelectedBlogToMove(null)
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a folder to move "{selectedBlogToMove.blog.title}"
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setSelectedMoveFolder("My Saves")}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedMoveFolder === "My Saves"
                        ? "bg-[#AF0171] text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Bookmark className="h-4 w-4" />
                      <span>My Saves</span>
                    </div>
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => setSelectedMoveFolder(folder.name)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedMoveFolder === folder.name
                          ? "bg-[#AF0171] text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${folder.color}`}></div>
                        <span>{folder.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMoveModalOpen(false)
                      setSelectedBlogToMove(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-[#AF0171] to-[#E80F88]" onClick={handleMoveBlog}>
                    Move
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Library
