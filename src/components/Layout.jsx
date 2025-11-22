"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true) // Sidebar open by default

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <Navbar onMenuClick={() => setIsOpen(!isOpen)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}