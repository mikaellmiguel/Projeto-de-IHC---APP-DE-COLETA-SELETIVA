"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, BookOpen, LinkIcon, Leaf, Droplets, Zap, Package, Trash2, Edit2 } from "lucide-react"
import {api} from "@/services/api"

interface RecyclingRecord {
  id: number
  bags: number
  date: string
  sharedToFeed: boolean
}

interface GuideItem {
  category: string
  color: string
  canRecycle: string[]
  cannotRecycle: string[]
  tips: string
  resources: { title: string; url: string }[]
}

interface ProfilePageProps {
  userName: string
  currentGroup: { id: string; name: string; code: string; role: "admin" | "member" } | null
  onLogout: () => void
  handleBackToGroups: () => void
}

export default function ProfilePage({ userName, currentGroup, onLogout, handleBackToGroups }: ProfilePageProps) {
  const [records, setRecords] = useState<RecyclingRecord[]>([])

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        console.log("Current Group:", currentGroup)
        const res = await api.get(`/records/${currentGroup?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Records fetched:", res.data)
        setRecords(res.data.map((r: any) => ({
          id: r.id,
          bags: r.qtd_bags,
          date: new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          sharedToFeed: r.show_feed,
        })))
      } catch (err) {
        setRecords([])
        console.log("Erro ao buscar registros:", err)
      }
    }
    fetchRecords()
  }, [currentGroup])

  // Fonte para a ponderação dos materias por saco reciclado: https://www.gov.br/mma/pt-br/acesso-a-informacao/acoes-e-programas/programa-projetos-acoes-obras-atividades/agendaambientalurbana/lixao-zero/plano_nacional_de_residuos_solidos-1.pdf
  // Fonte para os calculos de impacto ambiental: https://www.4menearme.com/tools/recycling-calculator , https://lessismore.org/materials/28-why-recycle
  // Fonte para os calculos de CO2 evitado: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator

  const userBagsRecycled = records.reduce((sum, r) => sum + Number(r.bags), 0)

  const WEIGHT_PER_BAG = 2 // kg de material reciclado por saco
  const PLASTIC_PER_KG = 0.52
  const PAPER_PER_KG = 0.32
  const METAL_PER_KG = 0.07
  const GLASS_PER_KG = 0.09


  const userEnergySaved = Math.round(
    Number(userBagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 5.7 + PAPER_PER_KG * 4.2 + METAL_PER_KG * 12 + GLASS_PER_KG * 0.42)
  ) // em kWh

  const userCo2Avoided = Math.round(
    Number(userBagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 1.02 + PAPER_PER_KG * 0.46 + METAL_PER_KG * 5.86 + GLASS_PER_KG * 0.31)
  ) // em kg de CO2

  const userWaterSaved = Math.round(
    Number(userBagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 37 + PAPER_PER_KG * 60 + METAL_PER_KG * 40 + GLASS_PER_KG * 15)
  ) // em litros

  const userRawMaterialSaved = Math.round(
    Number(userBagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 1 + PAPER_PER_KG * 1 + METAL_PER_KG * 1.4 + GLASS_PER_KG * 1.2)
  ) // em kg
  

  const  deleteRecord = async (id: number) => {
    try{
      await api.delete(`/records/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setRecords(records.filter((r) => r.id !== id))
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Tente novamente mais tarde."
      alert("Erro ao deletar registro : " + message)
    } 
   
  }

  const handleLeaveGroup = async () => {
    
    try {
      if (!currentGroup) return
      const confirmLeave = window.confirm(`Tem certeza que deseja sair do grupo "${currentGroup.name}"?`)
      if (!confirmLeave) return

      await api.post(`/groups/leave/${currentGroup.id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      alert("Você saiu do grupo com sucesso.")
      handleBackToGroups()
    }
    catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Tente novamente mais tarde."
      alert("Erro ao sair do grupo: " + message)
    }
  }


  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-1">Suas ações e impacto individual</p>
      </div>

      {/* User Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-2xl font-bold text-foreground">{userName}</p>
            {currentGroup && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Grupo: {currentGroup.name}</p>
                <p
                  className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                    currentGroup.role === "admin"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary-foreground"
                  }`}
                >
                  {currentGroup.role === "admin" ? "Administrador" : "Membro Ativo"}
                </p>
                {currentGroup.role === "admin" && (
                  <div className="mt-3 p-3 bg-background/50 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-2">Código para acessar:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold text-primary">{currentGroup.code}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentGroup.code)
                          alert("Código copiado!")
                        }}
                        className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Impact Metrics */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Seu Impacto</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Energia Economizada</p>
                  <p className="text-xl font-bold text-primary">{userEnergySaved} kWh</p>
                </div>
                <Zap className="w-8 h-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Evitado</p>
                  <p className="text-xl font-bold text-orange-600">{userCo2Avoided.toFixed(1)} kg</p>
                </div>
                <Package className="w-8 h-8 text-orange-600/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Água Economizada</p>
                  <p className="text-xl font-bold text-blue-600">{userWaterSaved} L</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-600/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Matéria-Prima Poupada</p>
                  <p className="text-xl font-bold text-amber-600">{userRawMaterialSaved.toFixed(1)} kg</p>
                </div>
                <Leaf className="w-8 h-8 text-amber-600/40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3 border-t border-muted pt-4">
        <h2 className="text-xl font-semibold text-foreground">Histórico de Registros</h2>
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum registro ainda</p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          +{record.bags} saco{record.bags > 1 ? "s" : ""}
                        </span>
                        {record.sharedToFeed && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">No feed</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-muted pt-4" />

      <div className="pt-6 pb-32 border-t border-muted mt-8">
        <button
          onClick={() => {
            handleLeaveGroup()
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Sair do Grupo
        </button>
      </div>
    </div>
  )
}
