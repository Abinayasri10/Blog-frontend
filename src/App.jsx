import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Toaster, toast } from "sonner";


// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import Dashboard from "./pages/Dashboard"
import BlogFeed from "./pages/BlogFeed"
import BlogEditor from "./pages/BlogEditor"
import MyBlogs from "./pages/MyBlogs"
import SkillBuilder from "./pages/SkillBuilder"
import Journal from "./pages/Journal"
import Mentorship from "./pages/Mentorship"
import Events from "./pages/Events"
import Library from "./pages/Library"
import Profile from "./pages/Profile"
import AdminPanel from "./pages/AdminPanel"
import MyConnections from "./pages/MyConnections"

// Layout
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/blogs"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <BlogFeed />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-blog"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <BlogEditor />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-blogs"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyBlogs />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/skill-builder"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SkillBuilder />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Journal />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mentorship"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Mentorship />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Events />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Library />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/connections"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyConnections />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
