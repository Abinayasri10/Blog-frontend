"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const SignupPage = () => {
  const [formData, setFormData] = useState({
    userType: "student", // default
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    interests: [],
    profession: "",
  })

  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const departments = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ]

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

  const interestOptions = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cybersecurity",
    "UI/UX Design",
    "DevOps",
    "Blockchain",
  ]

  const handleInterestChange = (value) => {
    setFormData((prev) => {
      if (prev.interests.includes(value)) {
        return { ...prev, interests: prev.interests.filter((i) => i !== value) }
      } else {
        return { ...prev, interests: [...prev.interests, value] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await signup(formData)

      // ✅ Success toast with animated line
      toast({
        title: "✅ Account created successfully",
        description: "Redirecting to login...",
        className:
          "fixed top-4 right-4 w-80 p-4 rounded-lg shadow-lg bg-green-600 text-white border border-green-700 relative overflow-hidden",
      })

      // Wait before redirect
      setTimeout(() => navigate("/login"), 2000)
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF4F6] to-[#EBF4F6] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#071952] to-[#088395] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="text-xl font-bold text-gray-900">BlogSpace</div>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Join the community and start sharing your knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type */}
              <div className="space-y-2">
                <Label>User Type</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, userType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Common Fields */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Student Fields */}
              {formData.userType === "student" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, department: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, year: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Areas of Interest</Label>
                    <Select onValueChange={handleInterestChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interests" />
                      </SelectTrigger>
                      <SelectContent>
                        {interestOptions.map((interest) => (
                          <SelectItem key={interest} value={interest}>
                            {interest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-[#A8F1FF] text-[#071952] rounded-md text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Professional Fields */}
              {formData.userType === "professional" && (
                <div className="space-y-2">
                  <Label>Profession</Label>
                  <Input
                    placeholder="Enter your profession"
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        profession: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#071952] to-[#088395]"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#071952] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignupPage
