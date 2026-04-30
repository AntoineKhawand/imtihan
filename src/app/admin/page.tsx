"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { RefreshCw, Search, Calendar, Clock, Info, ShieldCheck, Mail, User, Zap, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchUsers() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.replace("/dashboard"); return; }
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const filtered = users.filter((u) => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingRequests = users.filter(u => u.renewalRequested).length;

  const now = Date.now();
  const stats = {
    total: users.length,
    pro: users.filter(u => u.proExpiresAt && u.proExpiresAt > now).length,
    free: users.filter(u => !u.proExpiresAt || u.proExpiresAt <= now).length,
    active: users.filter(u => u.lastLoginAt && u.lastLoginAt > now - 7 * 24 * 60 * 60 * 1000).length,
  };

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
              onClick={fetchUsers} 
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={cn("text-gray-600", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Community</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-gray-400">Lifetime Teachers</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-emerald-500 border-b-2">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Pro Active</p>
            <p className="text-2xl font-black text-gray-900">{stats.pro}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-600">{Math.round((stats.pro / stats.total) * 100) || 0}% Conversion</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Free Tier</p>
            <p className="text-2xl font-black text-gray-900">{stats.free}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-medium text-blue-600">{stats.free} Potential Pro</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-purple-500 border-b-2">
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Weekly Active</p>
            <p className="text-2xl font-black text-gray-900">{stats.active}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[10px] font-medium text-purple-600">{Math.round((stats.active / stats.total) * 100) || 0}% Retention</span>
            </div>
          </div>
        </div>
        {/* Legend Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-emerald-200 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Extend</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">Gives **30 Days Pro** and resets monthly generator.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">+10 Q / +30 Q</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">Adds **Bonus Quota** (Permanent exams beyond limit).</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-amber-200 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Renewal Req</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">Users who clicked **"Request Renewal"** on pricing page.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-purple-200 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Info size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Pro Usage</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">Pro users get **10 exams/mo**. Free users get **2 lifetime**.</p>
            </div>
          </div>
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
                            <p className="text-xs text-gray-400 font-medium">{u.displayName || "Unknown Teacher"}</p>
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
