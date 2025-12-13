"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Droplets, Zap, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/services/api"

interface ImpactPageProps {
  currentGroup:{id: string; name: string; code: string; role: "admin" | "member" } | null
}


export default function ImpactPage({ currentGroup }: ImpactPageProps) {
  
  const [bagsRecycled, setBagsRecycled] = useState(0)
  const [impactData, setImpactData] = useState<Array<{ name: string; sacos: number }>>([])

   useEffect(() => {
      const fetchFeedPosts = async () => {
        try {
          const token = localStorage.getItem("token")
          if (!token) return
          console.log("Current Group in Feed Fetch:", currentGroup)

          const now = new Date();
          const month = now.getMonth() + 1;
          const year = now.getFullYear();
          
          console.log(`Fetching impact data for group ${currentGroup?.id}, month: ${month}, year: ${year}`);
          const res = await api.get(`/records/impact/${currentGroup?.id}/${month}/${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          console.log("Impact data received:", res.data)
          setBagsRecycled(res.data.totalBags)

          const weeklyData = res.data.weeklyData.map((item: any) => ({
            name: `Semana ${item.week}`,
            sacos: item.qtd_bags,
          }))
          setImpactData(weeklyData)
  
        } catch (err) {
          console.log("Erro ao buscar posts do feed:", err)
        }
      }
      fetchFeedPosts()
    }, [])

  // Fonte para a ponderação dos materias por saco reciclado: https://www.gov.br/mma/pt-br/acesso-a-informacao/acoes-e-programas/programa-projetos-acoes-obras-atividades/agendaambientalurbana/lixao-zero/plano_nacional_de_residuos_solidos-1.pdf
  // Fonte para os calculos de impacto ambiental: https://www.4menearme.com/tools/recycling-calculator , https://lessismore.org/materials/28-why-recycle
  // Fonte para os calculos de CO2 evitado: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator

  const WEIGHT_PER_BAG = 2 // kg de material reciclado por saco
  const PLASTIC_PER_KG = 0.52
  const PAPER_PER_KG = 0.32
  const METAL_PER_KG = 0.07
  const GLASS_PER_KG = 0.09


  const energySaved = Math.round(
    Number(bagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 5.7 + PAPER_PER_KG * 4.2 + METAL_PER_KG * 12 + GLASS_PER_KG * 0.42)
  ) // em kWh

  const co2Avoided = Math.round(
    Number(bagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 1.02 + PAPER_PER_KG * 0.46 + METAL_PER_KG * 5.86 + GLASS_PER_KG * 0.31)
  ) // em kg de CO2

  const waterSaved = Math.round(
    Number(bagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 37 + PAPER_PER_KG * 60 + METAL_PER_KG * 40 + GLASS_PER_KG * 15)
  ) // em litros

  const rawMaterialSaved = Math.round(
    Number(bagsRecycled) *
      WEIGHT_PER_BAG *
      (PLASTIC_PER_KG * 1 + PAPER_PER_KG * 1 + METAL_PER_KG * 1.4 + GLASS_PER_KG * 1.2)
  ) // em kg

  const landfillReduced = Math.round(Number(bagsRecycled) * WEIGHT_PER_BAG * (
    PLASTIC_PER_KG * 25 + PAPER_PER_KG * 20 + METAL_PER_KG * 3 + GLASS_PER_KG * 1
  )) // em litros

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          Impacto do Condomínio
        </h1>
        <p className="text-muted-foreground mt-1">Veja o impacto coletivo da nossa comunidade</p>
      </div>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energia Economizada</p>
                <p className="text-2xl font-bold text-primary">{energySaved} kWh</p>
              </div>
              <Zap className="w-10 h-10 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Evitado</p>
                <p className="text-2xl font-bold text-orange-600">{co2Avoided} kg</p>
              </div>
              <Package className="w-10 h-10 text-orange-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Água Economizada</p>
                <p className="text-2xl font-bold text-blue-600">{waterSaved} L</p>
              </div>
              <Droplets className="w-10 h-10 text-blue-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matéria-Prima Poupada</p>
                <p className="text-2xl font-bold text-amber-600">{rawMaterialSaved} kg</p>
              </div>
              <Leaf className="w-10 h-10 text-amber-600/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Landfill Reduction */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Redução em Aterros</CardTitle>
          <CardDescription>Quantidade de lixo não descartado em aterros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-4xl font-bold text-primary">{landfillReduced}</p>
            <p className="text-muted-foreground mt-2">litros a menos</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coleta por Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sacos" fill="#48a15a" name="Sacos Reciclados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Equivalent Conversions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equivalências do Condomínio</CardTitle>
          <CardDescription>O que nossos {bagsRecycled} sacos reciclados representam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              💡 Equivale ao consumo mensal de {(energySaved / 150).toFixed(1)} casas
            </p>
            <p className="text-sm font-medium text-foreground">
              🌍 Equivale a plantar {Math.round(co2Avoided / 20)} árvores
            </p>
            <p className="text-sm font-medium text-foreground">
              💧 Equivale a {Math.round(waterSaved / (5*10))} duchas de 5 minutos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
