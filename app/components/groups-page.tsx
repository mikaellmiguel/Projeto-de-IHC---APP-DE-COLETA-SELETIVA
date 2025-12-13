"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, LogOut, Lock, Users } from "lucide-react"

interface Group {
  id: string
  name: string
  code: string
  is_admin: boolean
  role: "admin" | "member"
}

interface GroupsPageProps {
  userName: string
  userEmail: string
  onSelectGroup: (group: Group) => void
  onLogout: () => void
}

export default function GroupsPage({ userName, userEmail, onSelectGroup, onLogout }: GroupsPageProps) {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "join">("create")
  const [groupName, setGroupName] = useState("")
  const [groupCode, setGroupCode] = useState("")

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await api.get("/groups", {
          headers: { Authorization: `Bearer ${token}` },
        })
        // O backend retorna: [{ id, name, code, is_admin, created_at }]
        setGroups(
          res.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            code: g.code,
            is_admin: g.is_admin,
            role: g.is_admin ? "admin" : "member",
          }))
        )
      } catch (err) {
        setGroups([])
      }
    }
    fetchGroups()
  }, [userEmail])



  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      await api.post(
        "/groups",
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGroupName("")
      setShowModal(false)
      // Atualiza lista após criar
      const res = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGroups(
        res.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          is_admin: g.is_admin,
          role: g.is_admin ? "admin" : "member",
        }))
      )
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Tente novamente mais tarde."
      alert("Erro ao criar grupo: " + msg)
    }
  }

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) return
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      await api.post(
        `/groups/join/${groupCode.toUpperCase()}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGroupCode("")
      setShowModal(false)
      // Atualiza lista após entrar
      const res = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGroups(
        res.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          is_admin: g.is_admin,
          role: g.is_admin ? "admin" : "member",
        }))
      )
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Tente novamente mais tarde."
      alert("Erro ao entrar no grupo: " + msg)
    }
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meus Grupos</h1>
            <p className="text-sm opacity-90">{userName}</p>
          </div>
          <Button onClick={onLogout} variant="ghost" className="text-primary-foreground hover:bg-primary/80" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum grupo ainda</h2>
            <p className="text-muted-foreground mb-6">Crie um novo grupo ou entre em um existente para começar</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectGroup(group)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            group.role === "admin"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary-foreground"
                          }`}
                        >
                          {group.role === "admin" ? "Administrador" : "Membro"}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {group.role === "admin" ? group.code : ""}
                        </span>
                      </div>
                    </div>
                    <Users className="w-6 h-6 text-primary/40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Adicionar grupo"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in">
          <div className="w-full bg-background rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex gap-2 mb-4">
              <Button
                variant={modalMode === "create" ? "default" : "outline"}
                onClick={() => {
                  setModalMode("create")
                  setGroupCode("")
                }}
                className="flex-1"
              >
                Criar Grupo
              </Button>
              <Button
                variant={modalMode === "join" ? "default" : "outline"}
                onClick={() => {
                  setModalMode("join")
                  setGroupName("")
                }}
                className="flex-1"
              >
                Entrar em Grupo
              </Button>
            </div>

            {modalMode === "create" ? (
              <>
                <Input
                  type="text"
                  placeholder="Nome do grupo (ex: Condomínio Flores)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Button onClick={handleCreateGroup} className="w-full bg-primary hover:bg-primary/90">
                  Criar Grupo
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Digite o código do grupo"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <Button onClick={handleJoinGroup} className="w-full bg-primary hover:bg-primary/90">
                  Entrar
                </Button>
              </>
            )}

            <Button variant="outline" onClick={() => setShowModal(false)} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
