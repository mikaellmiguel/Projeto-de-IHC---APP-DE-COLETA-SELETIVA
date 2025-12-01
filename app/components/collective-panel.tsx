"use client"

import { useState } from "react"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Achievement {
  id: number
  user: string
  avatar: string
  description: string
  bags: number
  timestamp: string
  likes: number
  liked: boolean
}

export default function CollectivePanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      user: "Maria Silva",
      avatar: "👩",
      description: "Reciclou 3 sacos de papel e papelão",
      bags: 3,
      timestamp: "há 2 horas",
      likes: 12,
      liked: false,
    },
    {
      id: 2,
      user: "João Santos",
      avatar: "👨",
      description: "Reciclou 2 sacos de plástico",
      bags: 2,
      timestamp: "há 4 horas",
      likes: 8,
      liked: false,
    },
    {
      id: 3,
      user: "Ana Costa",
      avatar: "👩‍🦰",
      description: "Reciclou 1 saco de vidro",
      bags: 1,
      timestamp: "há 6 horas",
      likes: 5,
      liked: false,
    },
  ])

  const [newAchievement, setNewAchievement] = useState("")

  const toggleLike = (id: number) => {
    setAchievements(
      achievements.map((a) =>
        a.id === id ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 } : a,
      ),
    )
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const newItem: Achievement = {
        id: achievements.length + 1,
        user: "Você",
        avatar: "🎉",
        description: newAchievement,
        bags: 1,
        timestamp: "agora",
        likes: 0,
        liked: false,
      }
      setAchievements([newItem, ...achievements])
      setNewAchievement("")
    }
  }

  // Calculate team progress
  const totalBags = achievements.reduce((sum, a) => sum + a.bags, 0)
  const goalBags = 100
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
        </CardContent>
      </Card>

      {/* Add Achievement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registre sua Reciclagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="O que você reciclou hoje?"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            className="bg-muted/50"
          />
          <Button onClick={addAchievement} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Compartilhar
          </Button>
        </CardContent>
      </Card>

      {/* Achievements Feed */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Feed de Conquistas</h2>
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              {/* User Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{achievement.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{achievement.user}</p>
                  <p className="text-xs text-muted-foreground">{achievement.timestamp}</p>
                </div>
              </div>

              {/* Achievement Content */}
              <p className="text-foreground mb-3">{achievement.description}</p>

              {/* Bag Badge */}
              <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium mb-3">
                +{achievement.bags} saco{achievement.bags > 1 ? "s" : ""}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <button
                  onClick={() => toggleLike(achievement.id)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Heart className={`w-5 h-5 ${achievement.liked ? "fill-primary text-primary" : ""}`} />
                  <span className="text-sm">{achievement.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Comentar</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
