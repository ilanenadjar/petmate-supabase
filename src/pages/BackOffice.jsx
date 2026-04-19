import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, Eye, PawPrint, Shield, BarChart3, FileText, Users, Coins, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const petEmojis = { dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾" };

export default function BackOffice() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("ads"); // ads | orders

  const { data: allAds = [], isLoading } = useQuery({
    queryKey: ["allAds"],
    queryFn: () => base44.entities.PetAd.list("-created_date", 500),
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list("-created_date", 200),
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.update(id, { status: "confirmed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allOrders"] }),
  });
  const cancelOrderMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.update(id, { status: "cancelled" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allOrders"] }),
  });

  const orderStats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === "pending").length,
    confirmed: allOrders.filter(o => o.status === "confirmed").length,
    revenue: allOrders.filter(o => o.status === "confirmed").reduce((s, o) => s + (o.amount || 0), 0),
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PetAd.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAds"] });
      setDeleteId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PetAd.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allAds"] }),
  });

  const filteredAds = allAds.filter(ad => {
    if (statusFilter !== "all" && ad.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return ad.title?.toLowerCase().includes(q) || ad.city?.toLowerCase().includes(q) || ad.created_by?.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: allAds.length,
    active: allAds.filter(a => a.status === "active").length,
    requests: allAds.filter(a => a.ad_type === "request").length,
    offers: allAds.filter(a => a.ad_type === "offer").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-900 rounded-2xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Back Office</h1>
            <p className="text-slate-500">Gestion des annonces & commandes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-slate-200 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("ads")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "ads" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            <PawPrint className="w-4 h-4 inline mr-2" />Annonces
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "orders" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Coins className="w-4 h-4" />Commandes
            {orderStats.pending > 0 && (
              <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{orderStats.pending}</span>
            )}
          </button>
        </div>

        {/* Stats */}
        {(() => {
          const statItems = activeTab === "ads" ? [
            { label: "Total", value: stats.total, icon: FileText, color: "bg-slate-100 text-slate-600" },
            { label: "Actives", value: stats.active, icon: BarChart3, color: "bg-green-100 text-green-600" },
            { label: "Recherches", value: stats.requests, icon: Search, color: "bg-rose-100 text-rose-600" },
            { label: "Offres", value: stats.offers, icon: Users, color: "bg-blue-100 text-blue-600" },
          ] : [
            { label: "Total", value: orderStats.total, icon: FileText, color: "bg-slate-100 text-slate-600" },
            { label: "En attente", value: orderStats.pending, icon: Clock, color: "bg-amber-100 text-amber-600" },
            { label: "Confirmées", value: orderStats.confirmed, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
            { label: "Revenus ₪", value: orderStats.revenue, icon: Coins, color: "bg-purple-100 text-purple-600" },
          ];
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statItems.map(s => (
                <Card key={s.label} className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}

        {/* Orders table */}
        {activeTab === "orders" && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Plan</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i}>{Array(7).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>
                    ))
                  ) : allOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">Aucune commande</TableCell></TableRow>
                  ) : (
                    allOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-sm">{order.plan_label}</TableCell>
                        <TableCell className="font-bold text-amber-600">{order.amount}₪</TableCell>
                        <TableCell>
                          <Badge className={`${order.payment_method === "paypal" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"} border-0 text-xs`}>
                            {order.payment_method === "paypal" ? "PayPal" : "Virement"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-[180px] truncate">{order.user_email}</TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${order.status === "confirmed" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            {order.status === "confirmed" ? "Confirmée" : order.status === "pending" ? "En attente" : "Annulée"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{order.created_at ? format(new Date(order.created_at), "d/MM/yy", { locale: fr }) : ""}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {order.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2" onClick={() => confirmOrderMutation.mutate(order.id)}>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> OK
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 text-xs px-2" onClick={() => cancelOrderMutation.mutate(order.id)}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Filters (ads only) */}
        {activeTab === "ads" && <>
        <Card className="border-0 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par titre, ville, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 h-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] rounded-xl h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Annonce</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <PawPrint className="w-8 h-8 mx-auto mb-2" />
                      Aucune annonce trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map(ad => (
                    <TableRow key={ad.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{petEmojis[ad.pet_type]}</span>
                          <span className="font-medium text-sm truncate max-w-[200px]">{ad.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${ad.ad_type === "request" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"} border-0 text-xs`}>
                          {ad.ad_type === "request" ? "Recherche" : "Offre"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{ad.city}</TableCell>
                      <TableCell>
                        <Select
                          value={ad.status}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: ad.id, status: v })}
                        >
                          <SelectTrigger className="w-[120px] h-8 rounded-lg text-xs border-0 bg-transparent">
                            <Badge className={`${statusColors[ad.status]} border-0 text-xs`}>
                              {ad.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">En pause</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 truncate max-w-[150px]">{ad.created_by}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {ad.created_at ? format(new Date(ad.created_at), "d/MM/yy", { locale: fr }) : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Link to={createPageUrl("AdDetail") + `?id=${ad.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteId(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        </>}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600 rounded-xl" onClick={() => deleteMutation.mutate(deleteId)}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}