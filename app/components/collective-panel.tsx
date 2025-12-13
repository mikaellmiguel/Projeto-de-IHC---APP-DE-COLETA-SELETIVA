"use client"

import { useEffect, useState } from "react"
import { Heart, Trash2, Plus } from "lucide-react"
import { formatDistanceToNow, parseISO, set } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {api} from "@/services/api"

interface RecyclingPost {
  id: number
  user: string,
  user_id: number,
  avatar: string
  bags: number
  timestamp: string
  likes: number
  liked: number
}

interface RecyclingRecord {
  id: number
  bags: number
  timestamp: string
  sharedToFeed: boolean
}

interface ProfilePageProps {
  currentGroup: { id: string; name: string; code: string; role: "admin" | "member" } | null,
  userId: number
}

export default function CollectivePanel({ currentGroup, userId }: ProfilePageProps) {
  const [posts, setPosts] = useState<RecyclingPost[]>([])
  const [totalBags, setTotalBags] = useState(0)
  const [goal, setGoal] = useState<any>(null)

  useEffect(() => {
    const fetchFeedPosts = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        // Busca feed
        const res = await api.get(`/records/feed/${currentGroup?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPosts(
          res.data.records.map((r: any) => ({
            id: r.id,
            user: r.user_id === userId ? "Você" : r.user_name,
            user_id: r.user_id,
            avatar: "👤",
            bags: r.qtd_bags,
            timestamp: formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ptBR }),
            likes: r.likes,
            liked: r.liked_post_id,
          }))
        )
        setTotalBags(res.data.totalBags)
      } catch (err) {
        console.log("Erro ao buscar posts do feed:", err)
      }
    }

    const fetchGoal = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token || !currentGroup) return
        const now = new Date()
        const month = now.getMonth() + 1
        const year = now.getFullYear()
        const res = await api.get(`/groups/${currentGroup.id}/goals` , {
          headers: { Authorization: `Bearer ${token}` },
        })
        // goals pode ser array, filtrar pelo mês/ano atual
        const found = Array.isArray(res.data) ? res.data.find((g: any) => Number(g.month) === month && Number(g.year) === year) : null
        setGoal(found)
      } catch (err) {
        setGoal(null)
      }
    }

    fetchFeedPosts()
    fetchGoal()
  }, [currentGroup])

  const [showModal, setShowModal] = useState(false)
  const [bagsInput, setBagsInput] = useState("")
  const [shareToFeed, setShareToFeed] = useState(true)

  const toggleLike = async (id: number) => {
    
    const liked = posts.find((p) => p.id === id)?.liked ? true: false;

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await api.post(`/records/${liked ? "unlike" : "like"}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if(liked){
        setPosts(posts.map((p) => p.id === id ? { ...p, likes: Number(p.likes) - 1, liked: 0 } : p))
      }
      else{
        setPosts(posts.map((p) => p.id === id ? { ...p, likes: Number(p.likes) + 1, liked: 1 } : p))
      }

    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Tente novamente mais tarde."
      alert("Erro ao curtir/descurtir post: " + msg)
      return
    }

  }

  const deletePost = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      await api.delete(`/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setPosts(posts.filter((p) => p.id !== id))
    } catch (err) {
      console.log("Erro ao deletar post:", err)
    }
  }

  const handleRegisterRecycling = async () => {
    const bags = Number.parseInt(bagsInput)
    if (!isNaN(bags) && bags > 0) {
      
      try{
        await api.post(`/records/${currentGroup?.id}`, {
          qtd_bags: bags,
          show_feed: shareToFeed,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        
        if (shareToFeed) {
          const newPost: RecyclingPost = {
            id: posts.length + 1,
            user: "Você",
            avatar: "🎉",
            bags,
            user_id: userId,
            timestamp: "agora",
            likes: 0,
            liked: 0,
          }
          setPosts([newPost, ...posts])
        }
        // Aqui você salvaria também no histórico de registros do usuário
        setBagsInput("")
        setShareToFeed(true)
        setShowModal(false)
        setTotalBags(Number(totalBags) + Number(bags))

      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || "Tente novamente mais tarde."
        alert("Erro ao registrar reciclagem: " + msg)
      }
    }
  }

  // Calculate team progress
  const goalBags = goal?.qtd_bags || 100
  const progressPercentage = (totalBags / goalBags) * 100

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trash2 className="w-8 h-8 text-primary" />
          Painel Coletivo
        </h1>
        <p className="text-muted-foreground mt-1">Acompanhe as metas do condomínio</p>
      </div>

      {/* Team Goal Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Meta do Mês</CardTitle>
          <CardDescription>Objetivo coletivo de reciclagem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {totalBags}/{goalBags} sacos
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Faltam <span className="font-bold text-primary">{Math.max(0, goalBags - totalBags)}</span> sacos para
            atingir a meta!
          </p>
          {goal?.rewards && (
            <div className="flex items-center justify-center gap-2 mt-2 bg-yellow-50 p-3 rounded-lg">
              <span className="text-3xl">🏆</span>
              <span className="text-sm text-yellow-700 font-semibold mt-1"><strong>Recompensa:</strong> {goal.rewards}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recycling Feed */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Feed de Reciclagens</h2>
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              {/* User Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{post.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{post.user}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
                {(post.user_id === userId) && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                    title="Deletar post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Post Content */}
              <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium mb-3">
                +{post.bags} saco{post.bags > 1 ? "s" : ""}
              </div>

              {/* Like Action */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Heart className={`w-5 h-5 ${post.liked ? "fill-primary text-primary" : ""}`} />
                  <span className="text-sm">{post.likes}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-32 right-4 bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all"
        title="Registrar reciclagem"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-background w-full rounded-t-lg p-6 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">Registre sua Reciclagem</h2>

            {/* Input de sacos */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantos sacos <strong>(≈ 2kg cada)</strong> você reciclou?</label>
              <Input
                type="number"
                placeholder="0"
                value={bagsInput}
                onChange={(e) => setBagsInput(e.target.value)}
                className="bg-muted/50 text-lg"
                min="1"
              />
            </div>

            {/* Checkbox para compartilhar */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <input
                type="checkbox"
                id="shareFeed"
                checked={shareToFeed}
                onChange={(e) => setShareToFeed(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
              <label htmlFor="shareFeed" className="flex-1 cursor-pointer text-foreground">
                Compartilhar no feed de reciclagens
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              {shareToFeed
                ? "Seu registro será visível para todos do grupo"
                : "Seu registro será contabilizado nas métricas, mas não será visível no feed"}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterRecycling}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
