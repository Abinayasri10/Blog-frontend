import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PenTool, Target, BookMarked, Users, ArrowRight } from "lucide-react"

const LandingPage = () => {
  const features = [
    {
      icon: PenTool,
      title: "Write Blogs",
      description: "Share your thoughts, experiences, and knowledge with the community",
    },
    {
      icon: Target,
      title: "Build Skills",
      description: "Access curated learning paths and improve your technical abilities",
    },
    {
      icon: BookMarked,
      title: "Personal Journal",
      description: "Keep track of your learning journey and personal growth",
    },
    {
      icon: Users,
      title: "Collaborate with Peers",
      description: "Connect with fellow students and learn from each other",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF4F6] to-[#37B7C3]">
      {/* Header */}
      <header className="px-4 py-6">
        <nav className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#071952] to-[#088395] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BlogSpace</span>
          </div>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-[#071952] to-[#088395] hover:from-[#051440] hover:to-[#066b7a]"
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Voice,{" "}
            <span className="bg-gradient-to-r from-[#071952] to-[#088395] bg-clip-text text-transparent">
              Your Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A student-centric blogging site for learning, sharing, and growing. Connect with peers, build skills, and
            document your journey in the world of technology and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-[#071952] to-[#088395] hover:from-[#051440] hover:to-[#066b7a]"
            >
              <Link to="/signup" className="flex items-center">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Login to Continue</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to grow</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#071952] to-[#088395] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-[#071952] to-[#088395]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start your blogging journey?</h2>
          <p className="text-[#EBF4F6] mb-8 text-lg">
            Join thousands of students already sharing their knowledge and experiences.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-[#071952]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#EBF4F6]">© 2024 BlogSpace. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage