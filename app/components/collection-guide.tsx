"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, BookOpen, LinkIcon } from "lucide-react"

interface GuideItem {
  category: string
  color: string
  canRecycle: string[]
  cannotRecycle: string[]
  tips: string
  resources: { title: string; url: string }[]
}

export default function CollectionGuide() {
  const guides: GuideItem[] = [
    {
      category: "♻️ Plástico",
      color: "from-yellow-500/10 to-yellow-600/10",
      canRecycle: ["Garrafas PET", "Potes de alimento", "Sacos de compras", "Tupperware"],
      cannotRecycle: ["Filme plástico", "Sacolas de lixo", "Isopor", "Plástico sujo de óleo"],
      tips: "Limpe bem os recipientes antes de descartar e remova os rótulos quando possível.",
      resources: [
        { title: "Guia de Plásticos Recicláveis", url: "https://www.example.com" },
        { title: "Como limpar corretamente", url: "https://www.example.com" },
      ],
    },
    {
      category: "📰 Papel e Papelão",
      color: "from-orange-500/10 to-orange-600/10",
      canRecycle: ["Jornais", "Revistas", "Caixas de papelão", "Papel de escritório"],
      cannotRecycle: ["Papel úmido", "Papel sanitário", "Papel alumínio", "Papel com graxa"],
      tips: "Desmonte as caixas para economizar espaço e mantenha secas.",
      resources: [
        { title: "Reciclagem de Papel", url: "https://www.example.com" },
        { title: "Composição do papelão", url: "https://www.example.com" },
      ],
    },
    {
      category: "🥫 Metal e Alumínio",
      color: "from-gray-500/10 to-gray-600/10",
      canRecycle: ["Latas de alumínio", "Latas de aço", "Tampas metálicas", "Tubos de toothpaste"],
      cannotRecycle: ["Spray em aerossol", "Latas danificadas", "Fitas magnéticas"],
      tips: "Lave as latas e remova os rótulos. Amasse para economizar espaço.",
      resources: [
        { title: "Alumínio vs Aço", url: "https://www.example.com" },
        { title: "Processo de reciclagem", url: "https://www.example.com" },
      ],
    },
    {
      category: "🥃 Vidro",
      color: "from-green-500/10 to-green-600/10",
      canRecycle: ["Garrafas", "Potes de conserva", "Frascos de remédio", "Vidro transparente"],
      cannotRecycle: ["Vidro espelhado", "Vidro temperado", "Cerâmica", "Vidro fosco"],
      tips: "Lave bem para remover resíduos de alimento. Coloque em sacos separados.",
      resources: [
        { title: "Tipos de vidro", url: "https://www.example.com" },
        { title: "Segurança na reciclagem", url: "https://www.example.com" },
      ],
    },
  ]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          Guia de Coleta
        </h1>
        <p className="text-muted-foreground mt-1">Aprenda o que pode e não pode reciclar</p>
      </div>

      {/* Guide Items */}
      <div className="space-y-4">
        {guides.map((guide, idx) => (
          <Card key={idx} className={`bg-gradient-to-br ${guide.color} border-primary/10`}>
            <CardHeader>
              <CardTitle className="text-lg">{guide.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Can Recycle */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Pode reciclar
                </h4>
                <ul className="space-y-1 ml-7">
                  {guide.canRecycle.map((item, i) => (
                    <li key={i} className="text-sm text-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cannot Recycle */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-red-600 mb-2">
                  <XCircle className="w-5 h-5" />
                  Não pode reciclar
                </h4>
                <ul className="space-y-1 ml-7">
                  {guide.cannotRecycle.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                <p className="text-sm">
                  <span className="font-semibold text-primary">💡 Dica: </span>
                  {guide.tips}
                </p>
              </div>

              {/* Resources */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">SAIBA MAIS:</p>
                <div className="space-y-1">
                  {guide.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Educational Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Importância da Reciclagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            A reciclagem é fundamental para a preservação do nosso planeta. Cada material reciclado evita que novos
            recursos naturais sejam extraídos e reduz a quantidade de lixo em aterros.
          </p>
          <p>
            Quando você recicla corretamente, contribui para: diminuição da poluição, economia de energia, conservação
            de água e redução de emissão de gases de efeito estufa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
