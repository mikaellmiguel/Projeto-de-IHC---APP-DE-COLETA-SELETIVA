"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Leaf, UserIcon, ChevronLeft, BookOpen, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthForm from "@/components/auth-form"
import GroupsPage from "@/components/groups-page"
import CollectivePanel from "@/components/collective-panel"
import ImpactPage from "@/components/impact-page"
import ProfilePage from "@/components/profile-page"
import CollectionGuide from "@/components/collection-guide"
import AdminPanel from "@/components/admin-panel"

type TabType = "collective" | "impact" | "profile" | "guide" | "admin"

interface AppUser {
  name: string
  email: string
  id: number
}

interface Group {
  id: string
  name: string
  code: string
  role: "admin" | "member"
}

export default function Home() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("collective")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("recyclaUser")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      const storedGroup = localStorage.getItem(`selectedGroup_${parsedUser.email}`)
      if (storedGroup) {
        setSelectedGroup(JSON.parse(storedGroup))
      }
    }
    setIsLoading(false)
  }, [])

  const handleAuth = (newUser: AppUser) => {
    setUser(newUser)
    localStorage.setItem("recyclaUser", JSON.stringify(newUser))
  }

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group)
    if (user) {
      localStorage.setItem(`selectedGroup_${user.email}`, JSON.stringify(group))
    }
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedGroup(null)
    localStorage.removeItem("recyclaUser")
    localStorage.removeItem("token")
  }

  const handleBackToGroups = () => {
    setSelectedGroup(null)
    setActiveTab("collective")
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">♻️</div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />
  }

  if (!selectedGroup) {
    return (
      <GroupsPage
        userName={user.name}
        userEmail={user.email}
        onSelectGroup={handleSelectGroup}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recicla+ ♻️</h1>
            <p className="text-sm opacity-90">{selectedGroup.name}</p>
          </div>
          <Button
            onClick={handleBackToGroups}
            variant="ghost"
            className="text-primary-foreground hover:bg-primary/80"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "collective" && <CollectivePanel currentGroup={selectedGroup} userId={user.id} />}
        {activeTab === "impact" && <ImpactPage currentGroup={selectedGroup} />}
        {activeTab === "profile" && (
          <ProfilePage userName={user.name} currentGroup={selectedGroup} onLogout={handleLogout} handleBackToGroups={handleBackToGroups} />
        )}
        {activeTab === "guide" && <CollectionGuide />}
        {activeTab === "admin" && selectedGroup?.role === "admin" && <AdminPanel currentGroup={selectedGroup} />}
      </main>

      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground border-t border-primary/20 shadow-lg flex-shrink-0">
        <div className="flex justify-around items-center h-20 w-full">
          <button
            onClick={() => setActiveTab("collective")}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              activeTab === "collective" ? "bg-primary/90" : "hover:bg-primary/80"
            }`}
            aria-label="Painel Coletivo"
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-xs font-medium">Painel</span>
          </button>
          <button
            onClick={() => setActiveTab("impact")}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              activeTab === "impact" ? "bg-primary/90" : "hover:bg-primary/80"
            }`}
            aria-label="Impacto Ambiental"
          >
            <Leaf className="w-6 h-6" />
            <span className="text-xs font-medium">Impacto</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              activeTab === "guide" ? "bg-primary/90" : "hover:bg-primary/80"
            }`}
            aria-label="Guia de Coleta"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-medium">Guia</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              activeTab === "profile" ? "bg-primary/90" : "hover:bg-primary/80"
            }`}
            aria-label="Meu Perfil"
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
          {selectedGroup?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                activeTab === "admin" ? "bg-primary/90" : "hover:bg-primary/80"
              }`}
              aria-label="Painel Admin"
            >
              <Shield className="w-6 h-6" />
              <span className="text-xs font-medium">Admin</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
