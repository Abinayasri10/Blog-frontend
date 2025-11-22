import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext";



import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserPlus, UserMinus, Check, X, Mail, MapPin, Briefcase } from 'lucide-react'

const MyConnections = () => {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState("connections")
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserType, setSelectedUserType] = useState("all")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const apiBaseURL = `${import.meta.env.VITE_API_URL}/api`

  useEffect(() => {
    fetchConnections()
    fetchPendingRequests()
  }, [token])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${apiBaseURL}/connections?search=${searchTerm}&userType=${selectedUserType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setConnections(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
      setMessage("Failed to load connections")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${apiBaseURL}/connections/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      if (res.data.success) {
        setPendingRequests(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${apiBaseURL}/connections/available-users?search=${searchTerm}&userType=${selectedUserType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setAvailableUsers(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching available users:", error)
      setMessage("Failed to load available users")
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (receiverId) => {
    try {
      const res = await axios.post(
        `${apiBaseURL}/connections/request/send`,
        { receiverId, message: "" },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setMessage("Connection request sent successfully!")
        fetchAvailableUsers()
      }
    } catch (error) {
      console.error("Error sending request:", error)
      setMessage(error.response?.data?.message || "Failed to send connection request")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await axios.post(
        `${apiBaseURL}/connections/request/accept`,
        { requestId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setMessage("Connection accepted!")
        fetchPendingRequests()
        fetchConnections()
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      setMessage("Failed to accept connection request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await axios.post(
        `${apiBaseURL}/connections/request/reject`,
        { requestId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setMessage("Connection request rejected")
        fetchPendingRequests()
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      setMessage("Failed to reject connection request")
    }
  }

  const handleRemoveConnection = async (connectedUserId) => {
    try {
      const res = await axios.post(
        `${apiBaseURL}/connections/remove`,
        { connectedUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        setMessage("Connection removed")
        fetchConnections()
      }
    } catch (error) {
      console.error("Error removing connection:", error)
      setMessage("Failed to remove connection")
    }
  }

  const UserCard = ({ user, isConnected = false, isPending = false, isRequest = false, requestId = null }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              {user.profession || user.department || "Professional"}
            </CardDescription>
          </div>
          {isConnected && <Badge className="bg-green-500">Connected</Badge>}
          {isPending && <Badge variant="outline">Pending</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {user.bio && <p className="text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>}
        <div className="space-y-2 text-sm">
          {user.email && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              {user.location}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {isConnected && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="w-full">
                  <UserMinus className="h-4 w-4 mr-1" /> Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {user.name} from your connections?
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRemoveConnection(user._id)}
                    className="bg-red-600"
                  >
                    Remove
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isRequest && (
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleAcceptRequest(requestId)}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleRejectRequest(requestId)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}

          {!isConnected && !isRequest && !isPending && (
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-[#0793f0] to-[#15a2e8]"
              onClick={() => handleSendRequest(user._id)}
            >
              <UserPlus className="h-4 w-4 mr-1" /> Connect
            </Button>
          )}

          {isPending && (
            <Button size="sm" disabled className="w-full">
              <UserPlus className="h-4 w-4 mr-1" /> Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Connections</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your professional network and connections
        </p>
      </div>

      {message && (
        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">{message}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">
            My Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="discover">Find Users</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchConnections}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {connections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No connections yet. Start connecting with others!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <UserCard key={connection._id} user={connection.connectedUserId} isConnected />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <UserCard
                  key={request._id}
                  user={request.senderId}
                  isRequest
                  requestId={request._id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search users to connect..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAvailableUsers}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {availableUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No users available to connect with at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableUsers.map((availableUser) => (
                <UserCard key={availableUser._id} user={availableUser} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MyConnections
