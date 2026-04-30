"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { RefreshCw, Search, Calendar, Clock, Info, ShieldCheck, Mail, User, Zap, Sparkles, Plus, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const subjectMap: Record<string, string> = {
  mathematics: "Mathématiques", physics: "Physique", chemistry: "Chimie",
  biology: "Biologie", history: "Histoire", geography: "Géographie",
  philosophy: "Philosophie", arabic: "Arabe", french: "Français",
  english: "Anglais", economics: "Économie", accounting: "Comptabilité",
  informatics: "Informatique", "visual-arts": "Arts Plastiques",
  svt: "SVT", nsi: "NSI",
};

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  lastLoginAt: number | null;
  renewalRequested?: boolean;
  proExpiresAt: number | null;
  examsGenerated: number;
  monthlyExamsGenerated?: number;
  extraExamsQuota?: number;
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ProBadge({ expiresAt }: { expiresAt: number | null }) {
  if (!expiresAt) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider">Free User</span>;
  const active = expiresAt > Date.now();
  return (
    <span className={cn(
      "text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 w-fit uppercase tracking-wider",
      active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
      {active ? "Pro Active" : "Pro Expired"}
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statsData, setStatsData] = useState<{ subjects: Record<string, number>; lastUpdated: number }>({ subjects: {}, lastUpdated: Date.now() });
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "requests">("all");

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      // Fetch users
      const userRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.status === 401 || userRes.status === 403) {
        setIsAuthorized(false);
        setTimeout(() => router.replace("/dashboard"), 2000);
        return;
      }
      
      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersData = await userRes.json();
      const sData = await statsRes.json();

      setUsers(usersData.users);
      setStatsData(sData);
      setIsAuthorized(true);
    } catch (e) {
      console.error(e);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExtend(targetUid: string, days: number) {
    if (!user) return;
    setExtending(`${targetUid}-${days}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/extend-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid, days }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => u.uid === targetUid
          ? { ...u, proExpiresAt: data.proExpiresAt, monthlyExamsGenerated: 0, renewalRequested: false }
          : u)
      );
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    } finally {
      setExtending(null);
    }
  }

  async function handleAddQuota(targetUid: string, amount: number) {
    if (!user) return;
    setExtending(`${targetUid}-q${amount}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/add-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid, amount }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => u.uid === targetUid
          ? { ...u, extraExamsQuota: data.extraExamsQuota }
          : u)
      );
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    } finally {
      setExtending(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterType === "requests" ? u.renewalRequested : true;
    return matchesSearch && matchesFilter;
  });

  const pendingRequests = users.filter(u => u.renewalRequested).length;

  const now = Date.now();
  const stats = {
    total: users.length,
    pro: users.filter(u => u.proExpiresAt && u.proExpiresAt > now).length,
    free: users.filter(u => !u.proExpiresAt || u.proExpiresAt <= now).length,
    active: users.filter(u => u.lastLoginAt && u.lastLoginAt > now - 7 * 24 * 60 * 60 * 1000).length,
  };

  if (loading && isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFE]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-emerald-600" size={32} />
          <p className="text-sm font-medium text-gray-500">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFE]">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 border border-red-100">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-sm text-gray-500 mb-8">
            You do not have permission to view the admin dashboard. 
            Redirecting you back to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 px-6 py-8 md:px-10 mb-8 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400 font-medium">{stats.total} Total Users</span>
                {pendingRequests > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                    {pendingRequests} Renewal Requests
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all border"
              />
            </div>
            <button 
              onClick={fetchData} 
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={cn("text-gray-600", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Pending Requests Alert */}
        {pendingRequests > 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900">Pending Renewal Requests</h2>
                <p className="text-sm text-amber-700/80 font-medium">There are {pendingRequests} teachers waiting for their Pro plan to be extended.</p>
              </div>
            </div>
            <button 
              onClick={() => setFilterType("requests")} 
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all"
            >
              Show Requests
            </button>
          </div>
        )}

        {/* KPI Cards Section */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
              <User size={16} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Community</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-gray-400">Lifetime Teachers</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <Plus size={16} />
            </div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Pro Active</p>
            <p className="text-2xl font-black text-gray-900">{stats.pro}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-600">{Math.round((stats.pro / stats.total) * 100) || 0}% Conversion</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Sparkles size={16} />
            </div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Revenue Est.</p>
            <p className="text-2xl font-black text-gray-900">${(stats.pro * 5.99).toFixed(0)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-medium text-blue-600">Monthly Run Rate</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
              <Zap size={16} />
            </div>
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Engagement</p>
            <p className="text-2xl font-black text-gray-900">{(users.reduce((s, u) => s + u.examsGenerated, 0) / stats.total || 0).toFixed(1)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[10px] font-medium text-purple-600">Avg Exams/Teacher</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
              <Clock size={16} />
            </div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Weekly Active</p>
            <p className="text-2xl font-black text-gray-900">{stats.active}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-medium text-amber-600">{Math.round((stats.active / stats.total) * 100) || 0}% Retention</span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group min-h-[440px] flex flex-col">
            <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-500 group-hover:-rotate-12">
              <BarChart3 size={240} />
            </div>
            <div className="flex items-start justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Disciplines</h3>
                <p className="text-sm text-gray-400 font-medium mt-1">Global generation volume by subject</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-0.5">Last Sync</p>
                <p className="text-xs font-black text-gray-500 tabular-nums">{new Date(statsData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {Object.keys(statsData.subjects).length > 0 ? (
                Object.entries(statsData.subjects)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([subject, count]) => (
                    <div key={subject} className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-700 capitalize">
                          {subjectMap[subject] || subject}
                        </span>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          {count}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${(count / Math.max(...Object.values(statsData.subjects))) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                    <div className="w-64 h-64 rounded-full border-4 border-emerald-500 animate-ping" />
                  </div>
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner mb-6 relative z-10">
                    <TrendingUp size={32} className="animate-pulse" />
                  </div>
                  <h4 className="text-base font-black text-gray-900 mb-1 relative z-10">Waiting for first generation</h4>
                  <p className="text-sm text-gray-400 font-medium max-w-[240px] text-center leading-relaxed relative z-10">
                    The analytics engine is live and ready. Data will appear here as soon as teachers start creating exams.
                  </p>
                  <div className="mt-8 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time stats active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Admin Legend</h3>
             <p className="text-xs text-gray-400 font-medium mb-8">Reference for management actions</p>
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <Clock size={18} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Extend</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Gives 30 Days Pro and resets monthly generator count.</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Zap size={18} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Quota</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Adds permanent bonus exams beyond the monthly limit.</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Sparkles size={18} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Renewal</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Flag for users who requested a plan extension via UI.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              filterType === "all"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600"
            )}
          >
            All Users ({stats.total})
          </button>
          <button
            onClick={() => setFilterType("requests")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
              filterType === "requests"
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-white text-gray-500 border-gray-200 hover:border-amber-200 hover:text-amber-600"
            )}
          >
            Renewal Requests ({pendingRequests})
            {pendingRequests > 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-4">
            <RefreshCw size={32} className="animate-spin opacity-20" />
            <span className="text-sm font-medium tracking-wide">Fetching users...</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    <th className="px-8 py-5">Identities</th>
                    <th className="px-6 py-5">Subscription</th>
                    <th className="px-6 py-5">Engagement</th>
                    <th className="px-6 py-5 text-center">Usage</th>
                    <th className="px-6 py-5 text-center">Quota</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filtered.map((u) => (
                    <tr key={u.uid} className={cn(
                      "hover:bg-gray-50/80 transition-colors group",
                      u.renewalRequested && "bg-amber-50/30"
                    )}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm border",
                            u.renewalRequested ? "bg-amber-100 text-amber-700 border-amber-200 animate-pulse" : "bg-gray-50 text-gray-400 border-gray-100"
                          )}>
                            {u.displayName?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">{u.email}</p>
                              {u.renewalRequested && (
                                <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">REQ</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 font-medium">{u.displayName || "Anonymized Educator"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6"><ProBadge expiresAt={u.proExpiresAt} /></td>
                      <td className="px-6 py-6">
                        <div className="text-[11px] text-gray-400 flex flex-col gap-1 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-300" /> Joined {formatDate(u.createdAt)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> Seen {formatDate(u.lastLoginAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-bold text-gray-900">{u.monthlyExamsGenerated || 0}</span>
                          <div className="h-1 w-8 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${Math.min(100, ((u.monthlyExamsGenerated || 0) / (u.proExpiresAt ? 10 : FREE_EXAM_LIMIT)) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-[11px] border border-blue-100">
                          <Plus size={10} />
                          {u.extraExamsQuota || 0}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleExtend(u.uid, 30)}
                            disabled={!!extending}
                            className={cn(
                              "h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                              u.renewalRequested ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
                              "disabled:opacity-50"
                            )}
                          >
                            {extending === `${u.uid}-30` ? <RefreshCw size={12} className="animate-spin" /> : "Extend"}
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-1" />
                          <button 
                            onClick={() => handleAddQuota(u.uid, 10)}
                            disabled={!!extending}
                            className="h-9 px-3 bg-white border border-gray-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors"
                          >
                            {extending === `${u.uid}-q10` ? "..." : "+10Q"}
                          </button>
                          <button 
                            onClick={() => handleAddQuota(u.uid, 30)}
                            disabled={!!extending}
                            className="h-9 px-3 bg-white border border-gray-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
                          >
                            {extending === `${u.uid}-q30` ? "..." : "+30Q"}
                          </button>
                        </div>
                        {/* Mobile Fallback for Actions */}
                        <div className="flex md:hidden justify-end mt-2 opacity-100">
                           <button onClick={() => handleExtend(u.uid, 30)} className="text-xs text-emerald-600 font-bold underline">Quick Extend</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-sm">No users match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Card Layout (Hidden on Desktop) */}
      <style jsx>{`
        @media (max-width: 768px) {
          table { display: none; }
          .mobile-cards { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        }
        @media (min-width: 769px) {
          .mobile-cards { display: none; }
        }
      `}</style>
      
      {!loading && (
        <div className="mobile-cards px-6 mt-4 md:hidden">
          {filtered.map(u => (
            <div key={u.uid} className={cn(
              "bg-white p-5 rounded-3xl border border-gray-100 shadow-sm",
              u.renewalRequested && "border-amber-200 bg-amber-50/20"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border",
                    u.renewalRequested ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-400 border-gray-100"
                  )}>
                    {u.displayName?.[0] || u.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[150px]">{u.email}</p>
                    <ProBadge expiresAt={u.proExpiresAt} />
                  </div>
                </div>
                {u.renewalRequested && <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded">REQ</span>}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Monthly Usage</p>
                  <p className="text-sm font-bold text-gray-900">{u.monthlyExamsGenerated || 0} / {u.proExpiresAt ? "10" : "2"}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Bonus Quota</p>
                  <p className="text-sm font-bold text-blue-700">+{u.extraExamsQuota || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleExtend(u.uid, 30)}
                  className="flex-1 h-10 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Extend 30D
                </button>
                <button 
                  onClick={() => handleAddQuota(u.uid, 10)}
                  className="h-10 px-4 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
                >
                  +10Q
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
