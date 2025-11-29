"use client"

import { useState } from "react"
import { LayoutGrid, Leaf, BookOpen } from "lucide-react"
import CollectivePanel from "@/components/collective-panel"
import ImpactPage from "@/components/impact-page"
import CollectionGuide from "@/components/collection-guide"

type TabType = "collective" | "impact" | "guide"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("collective")

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 text-center flex-shrink-0">
        <h1 className="text-2xl font-bold">Recicla+ ♻️</h1>
        <p className="text-sm opacity-90">Juntos pela sustentabilidade</p>
      </header>

      {/* Main Content - removed padding and fixed layout to fill entire space */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "collective" && <CollectivePanel />}
        {activeTab === "impact" && <ImpactPage />}
        {activeTab === "guide" && <CollectionGuide />}
      </main>

      {/* Navigation Bar - removed fixed positioning and adjusted for full width */}
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
        </div>
      </nav>
    </div>
  )
}
