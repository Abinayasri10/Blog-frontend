"use client"

import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Link } from "react-router-dom"

import {
  PenTool,
  Search,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  User,
  Filter,
  TrendingUp,
  Calendar,
  BookOpen,
  ChevronRight,
  ChevronUp,
  Send,
  Mail,
  MessageSquare,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Bookmark,
} from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

const Dashboard = () => {
  const { user, token } = useAuth() // Added token
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [featuredBlog, setFeaturedBlog] = useState(null)
  const [blogInteractions, setBlogInteractions] = useState({})
  const [showCommentForm, setShowCommentForm] = useState({})
  const [newComments, setNewComments] = useState({})
  const [expandedBlogs, setExpandedBlogs] = useState({}) // New state for expanded blogs
  const [expandedFeatured, setExpandedFeatured] = useState(false) // New state for featured blog
  const [submittingComment, setSubmittingComment] = useState({}) // New state for submitting comment

  const categories = [
    "all",
    "Technology",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Education",
    "Entertainment",
    "Sports",
  ]

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs`)
      const allBlogs = response.data.blogs || []
      const sortedBlogs = allBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setBlogs(sortedBlogs)
      initializeBlogInteractions(sortedBlogs)
      if (sortedBlogs.length > 0) setFeaturedBlog(sortedBlogs[0])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeBlogInteractions = (blogs) => {
    const interactions = {}
    blogs.forEach((blog) => {
      interactions[blog._id] = {
        likes: blog.likes?.length || 0, // Use actual like count from backend
        comments: blog.comments?.length || 0, // Use actual comment count from backend
        views: blog.views || 0, // Use actual view count from backend
        isLiked: blog.likes?.some((id) => id.toString() === user?._id) || false, // Check if current user liked it
        isSaved: false, // Initialize isSaved to false
        userComments: blog.comments || [], // Use actual comments from backend
      }
    })
    setBlogInteractions(interactions)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleLike = async (blogId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/blogs/${blogId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setBlogInteractions((prev) => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            likes: response.data.likesCount,
            isLiked: response.data.isLiked,
          },
        }))
      }
    } catch (error) {
      console.error("Error liking blog:", error)
      alert("Failed to like blog. Please try again.")
    }
  }

  const handleSaveBlog = async (blogId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/library/save`,
        { blogId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setBlogInteractions((prev) => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            isSaved: response.data.isSaved,
          },
        }))
        alert(response.data.isSaved ? "Blog saved to library!" : "Blog saved to library!")
      }
    } catch (error) {
      console.error("Error saving blog:", error)
      alert("Failed to save blog. Please try again.")
    }
  }

  const handleCommentSubmit = async (blogId) => {
    const commentText = newComments[blogId]
    if (!commentText?.trim()) return

    setSubmittingComment((prev) => ({ ...prev, [blogId]: true }))
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/blogs/${blogId}/comment`,
        { content: commentText.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setBlogInteractions((prev) => ({
          ...prev,
          [blogId]: {
            ...prev[blogId],
            comments: response.data.comments?.length || 0,
            userComments: response.data.comments || [],
          },
        }))
        setNewComments((prev) => ({ ...prev, [blogId]: "" }))
        setShowCommentForm((prev) => ({ ...prev, [blogId]: false }))
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("Failed to post comment. Please try again.")
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [blogId]: false }))
    }
  }

  const toggleCommentForm = (blogId) => {
    setShowCommentForm((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }))
  }

  // New function to toggle blog expansion
  const toggleBlogExpansion = (blogId) => {
    setExpandedBlogs((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }))

    // Increment view count when expanding
    // This part was removed as it's handled by the API in actual applications
    // setBlogInteractions(prev => ({
    //   ...prev,
    //   [blogId]: {
    //     ...prev[blogId],
    //     views: prev[blogId].views + 1
    //   }
    // }))
  }

  // New function to toggle featured blog expansion
  const toggleFeaturedExpansion = () => {
    setExpandedFeatured(!expandedFeatured)

    // Increment view count for featured blog
    // This part was removed as it's handled by the API in actual applications
    // if (featuredBlog && blogInteractions[featuredBlog._id]) {
    //   setBlogInteractions(prev => ({
    //     ...prev,
    //     [featuredBlog._id]: {
    //       ...prev[featuredBlog._id],
    //       views: prev[featuredBlog._id].views + 1
    //     }
    //   }))
    // }
  }

  const handleEmailShare = (blog) => {
    const subject = encodeURIComponent(`Check out this blog: ${blog.title}`)
    const body = encodeURIComponent(`I thought you might be interested in this blog post:

Title: ${blog.title}
Author: ${blog.author?.name || "Anonymous"}

${blog.content.substring(0, 200)}...

Read more at: ${window.location.origin}/blog/${blog._id}`)

    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = (blog) => {
    const text = encodeURIComponent(
      `Check out this blog: "${blog.title}" by ${blog.author?.name || "Anonymous"} - ${window.location.origin}/blog/${blog._id}`,
    )
    window.open(`https://wa.me/?text=${text}`)
  }

  const handleSocialShare = (platform, blog) => {
    const url = encodeURIComponent(`${window.location.origin}/blog/${blog._id}`)
    const text = encodeURIComponent(`Check out "${blog.title}" by ${blog.author?.name || "Anonymous"}`)

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
        break
      default:
        break
    }
  }

  const handleCopyLink = (blog) => {
    const url = `${window.location.origin}/blog/${blog._id}`
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard!"))
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.author && blog.author.name && blog.author.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory

    return matchesSearch && matchesCategory && !blog.isDraft
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const truncateContent = (content, maxLength = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
  }

  const getAuthorInitials = (authorName) => {
    if (!authorName) return "U"
    return authorName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#071952] to-[#088395] rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-[#EBF4F6] opacity-90">Discover amazing stories from our community</p>
      </div>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#071952] to-[#088395] rounded-xl">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Share Your Story</h3>
                <p className="text-sm text-gray-600 mb-3">Write and publish your thoughts with the community</p>
                <Button asChild className="bg-gradient-to-r from-[#071952] to-[#088395]">
                  <Link to="/my-blogs">Create New Post</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#071952]">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">Community posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"> Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#088395]">
              {new Set(blogs.map((blog) => blog.author?.email || blog.author)).size}
            </div>
            <p className="text-xs text-muted-foreground">Contributing writers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#088395] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Post */}
      {featuredBlog && (
        <Card className="bg-gradient-to-r from-[#EBF4F6] to-[#37B7C3]/20 border-[#37B7C3]/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#088395]" />
              <CardTitle className="text-[#071952]">Featured Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                {featuredBlog.author?.profilePic ? (
                  <AvatarImage
                    src={featuredBlog.author.profilePic || "/placeholder.svg"}
                    alt={featuredBlog.author?.name}
                  />
                ) : (
                  <AvatarFallback className="bg-[#088395] text-white">
                    {getAuthorInitials(featuredBlog.author?.name || featuredBlog.author)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#071952] mb-2 hover:text-[#088395] cursor-pointer">
                  {featuredBlog.title}
                </h3>
                <p className="text-gray-700 mb-3">
                  {expandedFeatured ? featuredBlog.content : truncateContent(featuredBlog.content, 200)}
                </p>

                {featuredBlog.coverImage && (
                  <img
                    src={featuredBlog.coverImage || "/placeholder.svg"}
                    alt={featuredBlog.title}
                    className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain mx-auto rounded-lg shadow-sm mb-3"
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{featuredBlog.author?.name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(featuredBlog.createdAt)}</span>
                    </div>
                    {featuredBlog.category && (
                      <Badge variant="secondary" className="bg-[#37B7C3]/20 text-[#071952]">
                        {featuredBlog.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={toggleFeaturedExpansion}
                    className="bg-gradient-to-r from-[#071952] to-[#088395]"
                  >
                    {expandedFeatured ? "Show Less" : "Read More"}
                    {expandedFeatured ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#071952]">Latest Posts</CardTitle>
          <CardDescription>Discover stories from our community ({filteredBlogs.length} posts)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to share your story with the community!"}
              </p>
              <Button asChild className="bg-gradient-to-r from-[#071952] to-[#088395]">
                <Link to="/my-blog">Write Your First Post</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => {
                const interactions = blogInteractions[blog._id] || {
                  likes: 0,
                  comments: 0,
                  views: 0,
                  isLiked: false,
                  isSaved: false, // Initialize isSaved here
                }
                const isExpanded = expandedBlogs[blog._id]

                return (
                  <div
                    key={blog._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#37B7C3] transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        {blog.author?.profilePic ? (
                          <AvatarImage src={blog.author.profilePic || "/placeholder.svg"} />
                        ) : (
                          <AvatarFallback className="bg-[#088395] text-white">
                            {getAuthorInitials(blog.author?.name || blog.author)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-[#071952] hover:text-[#088395] cursor-pointer truncate">
                            {blog.title}
                          </h3>
                          {blog.category && (
                            <Badge variant="secondary" className="bg-[#EBF4F6] text-[#071952] text-xs">
                              {blog.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>{blog.author?.name || "Anonymous"}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {isExpanded ? blog.content : truncateContent(blog.content)}
                        </p>

                        {/* Blog Cover Image */}
                        {blog.coverImage && (
                          <img
                            src={blog.coverImage || "/placeholder.svg"}
                            alt={blog.title}
                            className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain mx-auto rounded-lg shadow-sm mb-3"
                          />
                        )}

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-[#37B7C3] text-[#088395]">
                                #{tag}
                              </Badge>
                            ))}
                            {blog.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs border-[#37B7C3] text-[#088395]">
                                +{blog.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Comment Form - Show when expanded and comment form is toggled */}
                        {showCommentForm[blog._id] && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <Textarea
                              placeholder="Write a comment..."
                              value={newComments[blog._id] || ""}
                              onChange={(e) =>
                                setNewComments((prev) => ({
                                  ...prev,
                                  [blog._id]: e.target.value,
                                }))
                              }
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleCommentSubmit(blog._id)}
                                disabled={submittingComment[blog._id]} // Disable button while submitting
                                className="bg-[#088395]"
                              >
                                {submittingComment[blog._id] ? "Posting..." : "Post Comment"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toggleCommentForm(blog._id)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Display user comments when expanded */}
                        {isExpanded && interactions.userComments && interactions.userComments.length > 0 && (
                          <div className="mb-4 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">Comments:</h4>
                            {interactions.userComments.map((comment) => (
                              <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                                {" "}
                                {/* Use comment._id for key */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-[#071952]">
                                    {comment.author?.name || "Anonymous"}
                                  </span>{" "}
                                  {/* Display author name */}
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>{" "}
                                {/* Display comment content */}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <button
                              onClick={() => handleLike(blog._id)}
                              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                                interactions.isLiked ? "text-red-500" : "text-gray-500"
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${interactions.isLiked ? "fill-current" : ""}`} />
                              <span>{interactions.likes}</span>
                            </button>

                            <button
                              onClick={() => toggleCommentForm(blog._id)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-[#088395] transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{interactions.comments}</span>
                            </button>

                            {/* Removed repost logic as it's not in updates */}
                            {/* <button
                              onClick={() => handleRepost(blog._id)}
                              className={`flex items-center space-x-1 hover:text-green-500 transition-colors ${
                                interactions.isReposted ? 'text-green-500' : 'text-gray-500'
                              }`}
                            >
                              <Repeat2 className="h-4 w-4" />
                              <span>{interactions.reposts}</span>
                            </button> */}

                            <div className="flex items-center space-x-1 text-gray-500">
                              <Eye className="h-4 w-4" />
                              <span>{interactions.views}</span>
                            </div>

                            <button
                              onClick={() => handleSaveBlog(blog._id)}
                              className={`flex items-center space-x-1 hover:text-yellow-500 transition-colors ${
                                interactions.isSaved ? "text-yellow-500" : "text-gray-500"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${interactions.isSaved ? "fill-current" : ""}`} />
                            </button>

                            {/* Share */}
                            <div className="relative group">
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#088395] p-1">
                                <Send className="h-4 w-4" />
                              </Button>
                              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <button
                                  onClick={() => handleEmailShare(blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send via Email
                                </button>
                                <button
                                  onClick={() => handleWhatsAppShare(blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Share on WhatsApp
                                </button>
                                <button
                                  onClick={() => handleSocialShare("twitter", blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <Twitter className="h-4 w-4 mr-2" />
                                  Share on Twitter
                                </button>
                                <button
                                  onClick={() => handleSocialShare("facebook", blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <Facebook className="h-4 w-4 mr-2" />
                                  Share on Facebook
                                </button>
                                <button
                                  onClick={() => handleSocialShare("linkedin", blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <Linkedin className="h-4 w-4 mr-2" />
                                  Share on LinkedIn
                                </button>
                                <button
                                  onClick={() => handleCopyLink(blog)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </button>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBlogExpansion(blog._id)}
                            className="text-[#088395] hover:text-[#071952]"
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-1" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredBlogs.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-[#37B7C3] text-[#088395] hover:bg-[#EBF4F6] bg-transparent">
                Load More Posts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
