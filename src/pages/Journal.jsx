
"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  PenTool,
  CalendarIcon,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  PlusCircle,
  CheckCircle,
} from "lucide-react"

// Set axios base URL (adjust to your backend's port)
axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}`// Update if backend is on a different port

const Journal = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "",
    tags: [],
    privacy: "private",
  })
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", status: "todo" })
  const [tasks, setTasks] = useState([])
  const [journalEntries, setJournalEntries] = useState([])

  const moodOptions = [
    { value: "happy", label: "Happy", icon: Smile, color: "text-green-500" },
    { value: "neutral", label: "Neutral", icon: Meh, color: "text-yellow-500" },
    { value: "sad", label: "Sad", icon: Frown, color: "text-red-500" },
  ]

  // Fetch journal entries and tasks on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get("/api/journals", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setJournalEntries(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Error fetching entries:", error.response?.data?.message || error.message)
        alert(`Failed to fetch journal entries: ${error.response?.data?.message || error.message}`)
        setJournalEntries([])
      }
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setTasks(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Error fetching tasks:", error.response?.data?.message || error.message)
        alert(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`)
        setTasks([])
      }
    }

    const token = localStorage.getItem("token")
    if (!token) {
      alert("No authentication token found. Please log in.")
      return
    }
    fetchEntries()
    fetchTasks()
  }, [])

  const calculateMonthlyStats = (entries) => {
    const totalEntries = entries.length
    const happyDays = entries.filter((e) => e.mood === "happy").length
    const neutralDays = entries.filter((e) => e.mood === "neutral").length
    const sadDays = entries.filter((e) => e.mood === "sad").length
    const tagCounts = entries.flatMap((e) => e.tags || []).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {})
    const mostUsedTags = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 4)

    return { totalEntries, happyDays, neutralDays, sadDays, mostUsedTags }
  }

  const monthlyStats = calculateMonthlyStats(journalEntries)

  const handleCreateEntry = async () => {
    if (!newEntry.title || !newEntry.content) {
      alert("Please provide a title and content for the entry.")
      return
    }

    const newEntryWithMetadata = {
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood || "neutral",
      tags: newEntry.tags.length ? newEntry.tags : ["general"],
      privacy: newEntry.privacy,
    }

    try {
      const response = await axios.post("/api/journals", newEntryWithMetadata, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setJournalEntries((prev) => [response.data, ...prev])
      alert("Entry saved successfully!")
    } catch (error) {
      console.error("Error creating entry:", error.response?.data?.message || error.message)
      alert(`Failed to save entry: ${error.response?.data?.message || error.message}`)
    }

    setNewEntry({ title: "", content: "", mood: "", tags: [], privacy: "private" })
  }

  const handleCreateTask = async () => {
    if (!newTask.title) {
      alert("Please provide a title for the task.")
      return
    }

    const newTaskWithMetadata = {
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate || undefined,
      status: newTask.status,
    }

    try {
      const response = await axios.post("/api/tasks", newTaskWithMetadata, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setTasks((prev) => [response.data, ...prev])
      alert("Task added successfully!")
    } catch (error) {
      console.error("Error creating task:", error.response?.data?.message || error.message)
      alert(`Failed to add task: ${error.response?.data?.message || error.message}`)
    }

    setNewTask({ title: "", description: "", dueDate: "", status: "todo" })
  }

  const toggleTask = async (id) => {
    try {
      const response = await axios.put(
        `/api/tasks/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      )
      alert(`Task marked as ${response.data.status}!`)
    } catch (error) {
      console.error("Error updating task:", error.response?.data?.message || error.message)
      alert(`Failed to update task status: ${error.response?.data?.message || error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071952]">Personal Journal</h1>
        <p className="text-gray-600">Document your learning journey and personal growth</p>
      </div>

      <Tabs defaultValue="journal">
        <TabsList className="bg-[#EBF4F6]">
          <TabsTrigger value="journal">My Journal</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#EBF4F6]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <PenTool className="h-4 w-4 text-[#088395]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.totalEntries}</div>
                <p className="text-xs text-gray-600">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-[#EBF4F6]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Happy Days</CardTitle>
                <Smile className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{monthlyStats.happyDays}</div>
                <p className="text-xs text-gray-600">
                  {monthlyStats.totalEntries > 0
                    ? Math.round((monthlyStats.happyDays / monthlyStats.totalEntries) * 100)
                    : 0}% of entries
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#EBF4F6]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#37B7C3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-gray-600">Days in a row</p>
              </CardContent>
            </Card>

            <Card className="bg-[#EBF4F6]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reflection Score</CardTitle>
                <CalendarIcon className="h-4 w-4 text-[#071952]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-gray-600">Monthly average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Entry</CardTitle>
                  <CardDescription>Share your thoughts and experiences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Entry title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px]"
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newEntry.tags.join(", ")}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        tags: e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag),
                      }))
                    }
                  />
                  <div className="flex gap-4">
                    <Select
                      value={newEntry.mood}
                      onValueChange={(value) => setNewEntry((prev) => ({ ...prev, mood: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            <div className="flex items-center space-x-2">
                              <mood.icon className={`h-4 w-4 ${mood.color}`} />
                              <span>{mood.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newEntry.privacy}
                      onValueChange={(value) => setNewEntry((prev) => ({ ...prev, privacy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateEntry}
                      className="bg-gradient-to-r from-[#071952] to-[#37B7C3] text-white"
                    >
                      <PenTool className="h-4 w-4 mr-2" /> Save Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="timeline">
                    <TabsList className="bg-[#EBF4F6]">
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="space-y-4">
                      {journalEntries.length === 0 && <p className="text-gray-500">No entries available.</p>}
                      {journalEntries.map((entry) => {
                        if (!entry || !entry._id) return null
                        const mood = moodOptions.find((m) => m.value === entry.mood)
                        return (
                          <div key={entry._id} className="border-l-4 border-[#088395] pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{entry.title}</h3>
                              <div className="flex items-center space-x-2">
                                {mood && <mood.icon className={`h-4 w-4 ${mood.color}`} />}
                                <span className="text-sm text-gray-500">
                                  {new Date(entry.date).toISOString().split("T")[0]}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{entry.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {(entry.tags || []).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs bg-[#EBF4F6] text-[#071952]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Badge
                                variant={entry.privacy === "private" ? "outline" : "default"}
                                className="bg-[#37B7C3] text-white"
                              >
                                {entry.privacy}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </TabsContent>
                    <TabsContent value="calendar">
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mood Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smile className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Happy</span>
                      </div>
                      <span className="text-sm font-medium">{monthlyStats.happyDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Meh className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Neutral</span>
                      </div>
                      <span className="text-sm font-medium">{monthlyStats.neutralDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Frown className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Sad</span>
                      </div>
                      <span className="text-sm font-medium">{monthlyStats.sadDays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Used Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {monthlyStats.mostUsedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#088395] hover:text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description..."
                value={newTask.description}
                onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))}
              />
              <Button
                onClick={handleCreateTask}
                className="bg-gradient-to-r from-[#071952] to-[#37B7C3] text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 && <p className="text-gray-500">No tasks available.</p>}
              {tasks.map((task) => {
                if (!task || !task._id) return null
                return (
                  <div
                    key={task._id}
                    className={`p-3 rounded flex justify-between items-center ${
                      task.status === "completed" ? "bg-green-100" : "bg-[#EBF4F6]"
                    }`}
                  >
                    <div>
                      <h4 className="font-medium text-[#071952]">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      {task.dueDate && (
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toISOString().split("T")[0]}
                        </p>
                      )}
                    </div>
                    {task.status === "todo" ? (
                      <Button size="sm" onClick={() => toggleTask(task._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Done
                      </Button>
                    ) : (
                      <Badge className="bg-green-600 text-white">Completed</Badge>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Journal
