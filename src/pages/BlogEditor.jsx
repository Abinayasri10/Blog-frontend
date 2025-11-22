"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, Eye, Send, ImageIcon, X } from "lucide-react"

const BlogEditor = () => {
  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
    coverImage: "",
    visibility: "public",
    isDraft: false,
  })
  const [currentTag, setCurrentTag] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const categories = [
    "Web Development",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Mobile Development",
    "DevOps",
    "Competitive Programming",
    "Interview Prep",
    "Personal Experience",
  ]

  const handleAddTag = () => {
    if (currentTag.trim() && !blogData.tags.includes(currentTag.trim())) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSaveDraft = () => {
    // Save as draft logic
    toast({
      title: "Draft saved",
      description: "Your blog has been saved as a draft.",
    })
  }

  const handlePublish = () => {
    if (!blogData.title || !blogData.content || !blogData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Publish logic
    toast({
      title: "Blog published!",
      description: "Your blog has been published successfully.",
    })
    navigate("/my-blogs")
  }

  const handlePreview = () => {
    setIsPreview(!isPreview)
  }

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Preview</h1>
          <Button onClick={handlePreview} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
        </div>

        <Card>
          <CardContent className="p-8">
            {blogData.coverImage && (
              <img
                src={blogData.coverImage || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{blogData.title || "Untitled Blog"}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <span>By You</span>
              <span>•</span>
              <span>{blogData.category}</span>
              <span>•</span>
              <span>Just now</span>
            </div>
            {blogData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blogData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="prose max-w-none">
              {blogData.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the community</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} className="bg-gradient-to-r from-[#AF0171] to-[#E80F88]">
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog title..."
                  value={blogData.title}
                  onChange={(e) => setBlogData((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-image">Cover Image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cover-image"
                    placeholder="https://example.com/image.jpg"
                    value={blogData.coverImage}
                    onChange={(e) => setBlogData((prev) => ({ ...prev, coverImage: e.target.value }))}
                  />
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {blogData.coverImage && (
                  <img
                    src={blogData.coverImage || "/placeholder.svg"}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your blog content here..."
                  value={blogData.content}
                  onChange={(e) => setBlogData((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-[400px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={blogData.category}
                  onValueChange={(value) => setBlogData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={blogData.visibility}
                  onValueChange={(value) => setBlogData((prev) => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="draft"
                  checked={blogData.isDraft}
                  onCheckedChange={(checked) => setBlogData((prev) => ({ ...prev, isDraft: checked }))}
                />
                <Label htmlFor="draft">Save as draft</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>

              {blogData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blogData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Use clear, descriptive titles</li>
                <li>• Break content into readable sections</li>
                <li>• Add relevant tags for discoverability</li>
                <li>• Include code examples when applicable</li>
                <li>• Proofread before publishing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BlogEditor
