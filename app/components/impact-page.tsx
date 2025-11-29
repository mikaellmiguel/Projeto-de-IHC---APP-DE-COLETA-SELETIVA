"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Droplets, Zap, Package } from "lucide-react"

export default function ImpactPage() {
  // Calculate impact metrics based on 25 bags recycled
  const bagsRecycled = 25
  const energySaved = bagsRecycled * 4 // kWh
  const co2Avoided = bagsRecycled * 0.4 // kg
  const waterSaved = bagsRecycled * 25 // liters
  const rawMaterialSaved = bagsRecycled * 0.5 // kg
  const landfillReduced = bagsRecycled * 50 // liters

  const impactData = [
    { name: "Semana 1", sacos: 4 },
    { name: "Semana 2", sacos: 6 },
    { name: "Semana 3", sacos: 8 },
    { name: "Semana 4", sacos: 7 },
  ]

  const energyData = [
    { name: "Energia Economizada (kWh)", value: energySaved },
    { name: "CO₂ Evitado (kg)", value: co2Avoided * 10 },
    { name: "Água Economizada (L)", value: waterSaved / 10 },
  ]

  const COLORS = ["#48a15a", "#5ab76a", "#65c57a"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          Impacto Ambiental
        </h1>
        <p className="text-muted-foreground mt-1">Veja o quanto você está ajudando o planeta</p>
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
          <CardTitle className="text-lg">Equivalências</CardTitle>
          <CardDescription>O que seus {bagsRecycled} sacos reciclados representam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              💡 Equivale a usar {(energySaved / 1000).toFixed(1)} kW de energia solar por 1 hora
            </p>
            <p className="text-sm font-medium text-foreground">
              🌍 Equivale a plantar {Math.round(co2Avoided / 20)} árvores
            </p>
            <p className="text-sm font-medium text-foreground">
              💧 Equivale a {Math.round(waterSaved / 10)} duchas de 5 minutos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
