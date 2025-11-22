"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Star, BookOpen, Award, Clock } from "lucide-react"

const Mentorship = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [mentors, setMentors] = useState([])

  // Fetch professionals from backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/professionals`, {
          withCredentials: true,
        })
        if (res.data.success) {
          setMentors(res.data.professionals)
        }
      } catch (error) {
        console.error("Error fetching mentors:", error)
      }
    }
    fetchMentors()
  }, [])

  const handleConnect = async (mentor) => {
  try {
    // Replace with logged-in user's details
    const menteeName = "Abinayasri J"  
    const menteeEmail = "abinayasrij.23cse@kongu.edu"

    await axios.post(`${import.meta.env.VITE_API_URL}/api/email/connect-request`, {
      mentorEmail: mentor.email,
      menteeName,
      menteeEmail,
    });

    alert(`Connection request sent to ${mentor.name}!`);
  } catch (error) {
    console.error("Error sending connect email:", error);
    alert("Failed to send connection request.");
  }
};


  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.profession && mentor.profession.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDepartment = selectedDepartment === "all" || mentor.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mentorship</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with experienced professionals and peers
        </p>
      </div>

      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="questions">Ask Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-6">
          {/* Search + Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search professionals by name or profession..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Professionals Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription>{mentor.profession}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mentor.department ? `${mentor.department}` : "Professional Mentor"}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#0793f0] to-[#15a2e8]"
                    onClick={() => handleConnect(mentor)}
              >
  <MessageCircle className="h-4 w-4 mr-1" /> Connect
</Button>

                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Mentorship
