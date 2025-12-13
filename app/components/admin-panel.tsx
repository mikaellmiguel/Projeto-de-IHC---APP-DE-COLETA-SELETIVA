"use client"

import { Leaf, PaintBucket, Shield, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { api } from "@/services/api"

interface AdminPanelProps {
    currentGroup: { id: string; name: string; code: string; role: "admin" | "member" } | null
}

export default function AdminPanel({ currentGroup }: AdminPanelProps) {

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [bags, setBags] = useState(100);
    const [reward, setReward] = useState("");
    const [goals, setGoals] = useState<any[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    const months = [
        { value: 1, label: "Janeiro" },
        { value: 2, label: "Fevereiro" },
        { value: 3, label: "Março" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Maio" },
        { value: 6, label: "Junho" },
        { value: 7, label: "Julho" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Setembro" },
        { value: 10, label: "Outubro" },
        { value: 11, label: "Novembro" },
        { value: 12, label: "Dezembro" },
    ];
    const years = [now.getFullYear(), now.getFullYear() + 1];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token || !currentGroup) return;
            setLoading(true);
            if (hasGoal && editMode) {
                // Editar meta existente
                await api.put(`/groups/${currentGroup.id}/goals/${month}/${year}`, {
                    qtd_bags: bags,
                    rewards: reward,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEditMode(false);
                alert("Meta editada com sucesso!");
            } else if (!hasGoal) {
                // Criar nova meta
                await api.post(`/groups/${currentGroup.id}/goals/${month}/${year}`, {
                    qtd_bags: bags,
                    rewards: reward,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Meta salva com sucesso!");
            }
            // Atualiza metas após salvar/editar
            fetchGoals();
        } catch (err: any) {
            const message = err.response?.data?.message || "Erro ao salvar a meta. Tente novamente.";
            alert(message);
        } finally {
            setLoading(false);
        }
    }

    // Busca metas já definidas
    const fetchGoals = async () => {
        if (!currentGroup) return;
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await api.get(`/groups/${currentGroup.id}/goals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(res.data || []);
        } catch {
            setGoals([]);
        }
    };

    // Busca membros do grupo
    const fetchMembers = async () => {
        if (!currentGroup) return;
        setMembersLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await api.get(`/groups/members/${currentGroup.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers(res.data || []);
        } catch {
            setMembers([]);
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
        fetchMembers();
    }, [currentGroup]);

    // Atualiza os campos se já houver meta para o mês/ano selecionado
    useEffect(() => {
        const found = goals.find(g => Number(g.month) === Number(month) && Number(g.year) === Number(year));
        if (found) {
            console.log("Found existing goal for selected month/year:", found);
            setBags(found.qtd_bags || 0);
            setReward(found.rewards ?? found.rewards ?? "");
            setEditMode(false);
        } else {
            setBags(100);
            setReward("");
            setEditMode(false);
        }
    }, [month, year, goals]);

    const hasGoal = goals.some(g => Number(g.month) === Number(month) && Number(g.year) === Number(year));

    // Funções de ação para membros
    const handleRemoveMember = async (userId: string) => {
        if (!currentGroup) return;
        if (!window.confirm("Tem certeza que deseja remover este membro?")) return;
        try {
            const token = localStorage.getItem("token");
            await api.post(`/groups/remove-member/${currentGroup.id}`, { user_id: userId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMembers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao remover membro.");
        }
    };

    const handleAddAdmin = async (userId: string) => {
        if (!currentGroup) return;
        try {
            const token = localStorage.getItem("token");
            await api.post(`/groups/add-admin/${currentGroup.id}`, { user_id: userId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMembers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao tornar admin.");
        }
    };

    const handleRemoveAdmin = async (userId: string) => {
        if (!currentGroup) return;
        try {
            const token = localStorage.getItem("token");
            await api.post(`/groups/remove-admin/${currentGroup.id}`, { user_id: userId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMembers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao remover admin.");
        }
    };


    return (
        <div className="pt-4">
            <div className="p-4 max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Shield className="w-8 h-8 text-primary" /> Painel do Administrador</h1>
                <p className="text-muted-foreground">Gerenciar membros, incluir metas e recompensas</p>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-primary">Definir Meta do Mês</CardTitle>
                    <CardDescription>Objetivo coletivo de reciclagem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label htmlFor="month">Mês</Label>
                                <select
                                    id="month"
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    value={month}
                                    onChange={e => setMonth(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="year">Ano</Label>
                                <select
                                    id="year"
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    value={year}
                                    onChange={e => setYear(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="bags">Quantidade de sacos (≈ 2kg cada)</Label>
                            <Input
                                id="bags"
                                type="number"
                                min={1}
                                value={bags}
                                onChange={e => setBags(Number(e.target.value))}
                                className="mt-1"
                                required
                                disabled={hasGoal && !editMode}
                            />
                        </div>
                        <div>
                            <Label htmlFor="reward">Recompensa (opcional)</Label>
                            <Input
                                id="reward"
                                type="text"
                                value={reward}
                                onChange={e => setReward(e.target.value)}
                                className="mt-1"
                                placeholder="Ex: Vale presente, certificado, etc."
                                disabled={hasGoal && !editMode}
                            />
                        </div>
                        {hasGoal && !editMode ? (
                                <button
                                    type="button"
                                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
                                    onClick={e => {
                                        e.preventDefault();
                                        setEditMode(true);
                                    }}
                                >
                                    Editar Meta
                                </button>
                        ) : (
                            <Button type="submit" className={`w-full ${hasGoal ? 'bg-yellow-500' : 'bg-primary'} text-white font-semibold py-2 rounded`} disabled={loading}>
                                {hasGoal ? 'Salvar Edição' : 'Salvar Meta'}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Listagem de membros */}
            <div className="max-w-2xl mx-auto mt-8 p-4">
                <h2 className="text-xl font-bold mb-4">Membros do Grupo</h2>
                {membersLoading ? (
                    <div className="text-center text-muted-foreground">Carregando membros...</div>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between bg-white/80 rounded border px-4 py-2 shadow-sm">
                                <div>
                                    <div className="font-semibold text-foreground">{member.name} {member.is_admin ? <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded ml-2">admin</span> : null}</div>
                                    <div className="text-xs text-muted-foreground">{member.email}</div>
                                    <div className="mt-1 flex items-center gap-1 text-sm"><Leaf/> <span className="font-bold text-primary">{member.qtd_bags}</span>  Bolsas Recicladas</div>
                                </div>
                                <div className="flex gap-2">
                                    {!member.is_admin && (
                                        <Button size="sm" variant="outline" onClick={() => handleAddAdmin(member.id)}>
                                            Tornar admin
                                        </Button>
                                    )}
                                    {member.is_admin && (
                                        <Button size="sm" variant="outline" onClick={() => handleRemoveAdmin(member.id)}>
                                            Remover admin
                                        </Button>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveMember(member.id)}>
                                        <Trash2/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <div className="text-center text-muted-foreground">Nenhum membro encontrado.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}