"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Heart,
  MessageCircle,
  Eye,
  Mail,
  MessageSquare,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Bookmark,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const BlogFeed = () => {
  const { user, token } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [blogInteractions, setBlogInteractions] = useState({})
  const [visibleCount, setVisibleCount] = useState(4)
  const [expandedComments, setExpandedComments] = useState({})
  const [newComments, setNewComments] = useState({})
  const [submittingComment, setSubmittingComment] = useState({})

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
      initializeInteractions(sortedBlogs)
    } catch (err) {
      console.error("Error fetching blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  const initializeInteractions = (blogs) => {
    const data = {}
    blogs.forEach((blog) => {
      data[blog._id] = {
        likes: blog.likes?.length || 0,
        comments: blog.comments?.length || 0,
        views: blog.views || 0,
        isLiked: blog.likes?.some((id) => id.toString() === user?._id) || false,
        isSaved: false,
        userComments: blog.comments || [],
      }
    })
    setBlogInteractions(data)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleLike = async (id) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/blogs/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setBlogInteractions((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
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
        setExpandedComments((prev) => ({ ...prev, [blogId]: false }))
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("Failed to post comment. Please try again.")
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [blogId]: false }))
    }
  }

  const handleEmailShare = (blog) => {
    const subject = encodeURIComponent(`Check out this blog: ${blog.title}`)
    const body = encodeURIComponent(
      `${blog.content.substring(0, 200)}...\n\nRead more at: ${window.location.origin}/blog/${blog._id}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = (blog) => {
    const text = encodeURIComponent(`Check out "${blog.title}" - ${window.location.origin}/blog/${blog._id}`)
    window.open(`https://wa.me/?text=${text}`)
  }

  const handleSocialShare = (platform, blog) => {
    const url = encodeURIComponent(`${window.location.origin}/blog/${blog._id}`)
    const text = encodeURIComponent(blog.title)
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
    navigator.clipboard.writeText(`${window.location.origin}/blog/${blog._id}`).then(() => alert("Link copied!"))
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.author?.name && blog.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory
    return matchesSearch && matchesCategory && !blog.isDraft
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Blogs</h1>
          <p className="text-gray-600">Explore posts from the community</p>
        </div>
        <Button className="bg-gradient-to-r from-[#071952] to-[#088395]">Write a Blog</Button>
      </div>

      {/* Search + Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Blogs List */}
      {loading ? (
        <p>Loading blogs...</p>
      ) : filteredBlogs.length === 0 ? (
        <p className="text-center text-gray-600">No blogs found.</p>
      ) : (
        <div className="space-y-6">
          {filteredBlogs.slice(0, visibleCount).map((blog) => {
            const interactions = blogInteractions[blog._id] || {
              likes: 0,
              comments: 0,
              views: 0,
              isLiked: false,
              isSaved: false,
            }
            return (
              <Card key={blog._id} className="hover:shadow-md transition">
                <div className="md:flex">
                  {blog.coverImage && (
                    <div className="md:w-1/3">
                      <img
                        src={blog.coverImage || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-full h-30 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                  )}
                  <div className="md:w-2/3 p-6">
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        {blog.author?.profilePic ? (
                          <AvatarImage src={blog.author.profilePic || "/placeholder.svg"} />
                        ) : (
                          <AvatarFallback>{blog.author?.name?.[0] || "U"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-sm text-gray-600">
                        {blog.author?.name || "Anonymous"} • {formatDate(blog.createdAt)}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#088395] cursor-pointer">
                      {blog.title}
                    </h2>
                    <p className="text-gray-700 mb-4 line-clamp-3">{blog.content}</p>

                    {/* Tags */}
                    {blog.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {expandedComments[blog._id] && (
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
                            disabled={submittingComment[blog._id]}
                            className="bg-[#088395]"
                          >
                            {submittingComment[blog._id] ? "Posting..." : "Post Comment"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedComments((prev) => ({ ...prev, [blog._id]: false }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Display comments */}
                    {interactions.userComments?.length > 0 && (
                      <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
                        {interactions.userComments.map((comment) => (
                          <div key={comment._id} className="bg-gray-50 p-2 rounded text-sm">
                            <span className="font-medium text-[#071952]">{comment.author?.name || "Anonymous"}:</span>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleLike(blog._id)}
                          className={`flex items-center gap-1 ${interactions.isLiked ? "text-red-500" : ""}`}
                        >
                          <Heart className={`h-4 w-4 ${interactions.isLiked ? "fill-current" : ""}`} />{" "}
                          {interactions.likes}
                        </button>
                        <button
                          onClick={() => setExpandedComments((prev) => ({ ...prev, [blog._id]: !prev[blog._id] }))}
                          className="flex items-center gap-1 hover:text-[#088395]"
                        >
                          <MessageCircle className="h-4 w-4" /> {interactions.comments}
                        </button>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> {interactions.views}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveBlog(blog._id)}
                          className={interactions.isSaved ? "text-yellow-500" : ""}
                        >
                          <Bookmark className={`h-4 w-4 ${interactions.isSaved ? "fill-current" : ""}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEmailShare(blog)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleWhatsAppShare(blog)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSocialShare("twitter", blog)}>
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSocialShare("facebook", blog)}>
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSocialShare("linkedin", blog)}>
                          <Linkedin className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCopyLink(blog)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {visibleCount < filteredBlogs.length && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                className="bg-gradient-to-r from-[#071952] to-[#088395] text-white transition-colors"
              >
                Load More Blogs
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BlogFeed
