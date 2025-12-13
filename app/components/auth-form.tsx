"use client"

import type React from "react"

import { useState } from "react"
import {api} from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf } from "lucide-react"

interface AuthFormProps {
  onAuth: (user: { name: string; email: string, id: number }) => void
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const res = await api.post("/sessions", {
          email,
          password,
        })

        const { token, user } = res.data
        if (token) {
          localStorage.setItem("token", token)
        }
        console.log("Logged in user:", user)
        onAuth({ name: user?.name ?? "Usuário", email: user?.email ?? email, id: user?.id ?? 0 })
      } else {
        // Register: POST /users then login
        if (!name || !email || !password) {
          setError("Preencha todos os campos")
          return
        }

        await api.post("/users", {
          name,
          email,
          password,
        })

        // Após cadastro, fazer login automático
        const res = await api.post("/sessions", {
          email,
          password,
        })

        const { token, user } = res.data
        if (token) {
          localStorage.setItem("token", token)
        }

        onAuth({ name: user?.name ?? name, email, id: user?.id ?? 0 })
      }
    } catch (err: any) {
      console.error(err)
      const message = err?.response?.data?.message || err.message || "Erro na autenticação"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Recicla+ ♻️</CardTitle>
          <CardDescription>Juntos pela sustentabilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete={isLogin ? "username" : "new-email"}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">{isLogin ? "Não tem conta?" : "Já tem conta?"}</p>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setName("")
                setEmail("")
                setPassword("")
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
