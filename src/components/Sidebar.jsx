"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home, BookOpen, FileText, Target, BookMarked,
  Users, Calendar, Bookmark, Settings, Shield, X
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "All Blogs", href: "/blogs", icon: BookOpen },
  { name: "Create Blog", href: "/my-blogs", icon: FileText },
  { name: "Skill Builder", href: "/skill-builder", icon: Target },
  { name: "Journal", href: "/journal", icon: BookMarked },
  { name: "Mentorship", href: "/mentorship", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Library", href: "/library", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: Settings },
  { name: "Admin", href: "/admin", icon: Shield },
  { name: "Connections", href: "/connections", icon: Users },
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    // Only close on mobile when clicking a link
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar