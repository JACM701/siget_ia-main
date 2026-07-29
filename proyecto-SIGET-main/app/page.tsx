"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { DashboardOverview } from "@/components/dashboard-overview"
import { IncidentForm } from "@/components/incident-form"
import { EvidenceRepository } from "@/components/evidence-repository"
import { LegalDocuments } from "@/components/legal-documents"
import { AIAssistant } from "@/components/ai-assistant"
import { LoginScreen, type OfficerData} from "@/components/login-screen"
import { useEffect } from "react"
import { OfficerProfile } from "@/components/officer-profile"

export default function SIGETDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentOfficer, setCurrentOfficer] = useState<OfficerData | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [profileInitialTab, setProfileInitialTab] = useState<'info' | 'stats' | 'activity' | 'settings'>('info')

  const handleLogin = (officer: OfficerData) => {
    setCurrentOfficer(officer)
    setIsAuthenticated(true)
  }

  const handleShowProfile = (tab: 'info' | 'stats' | 'activity' | 'settings' = 'info') => {
    setProfileInitialTab(tab)
    setShowProfile(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentOfficer(null)
    setShowProfile(false)
    setActiveView("dashboard")
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview />
      case "incidents":
        return <IncidentForm />
      case "evidence":
        return <EvidenceRepository />
      case "documents":
        return <LegalDocuments />
      case "assistant":
        return <AIAssistant />
      default:
        return <DashboardOverview />
    }
  }

  // Auto-login when URL contains ?demo=1 (helps when button click doesn't work remotely)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('demo') === '1' && !isAuthenticated) {
        handleLogin(mockOfficer)
      }
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          officer={currentOfficer}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader 
            sidebarOpen={sidebarOpen} 
            onMobileMenuToggle={() => setMobileSidebarOpen((open) => !open)}
            officer={currentOfficer}
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {renderView()}
          </main>
        </div>
      </div>

      {showProfile && currentOfficer && (
        <OfficerProfile
          officer={currentOfficer}
          initialTab={profileInitialTab}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
