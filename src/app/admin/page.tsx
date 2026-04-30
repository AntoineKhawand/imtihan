"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { Award, Clock, Table, ImageIcon, Sparkles, X, Zap, Mail, Calendar, User, Search, RefreshCw } from "lucide-react";

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
  if (!expiresAt) return <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Free User</span>;
  const active = expiresAt > Date.now();
  const days = Math.ceil((expiresAt - Date.now()) / 86400000);
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
      active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
    }`}>
      {active ? `PRO · ${days}D LEFT` : `EXPIRED ${formatDate(expiresAt)}`}
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [view, setView] = useState<"all" | "requests">("all");

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
      setError((e as Error).message);
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

  const filtered = users.filter((u) => {
    const matchesSearch = !search || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()));
    
    let matchesDate = true;
    if (filterDate) {
      const targetDate = new Date(filterDate).toDateString();
      const regDate = new Date(u.createdAt).toDateString();
      const logDate = u.lastLoginAt ? new Date(u.lastLoginAt).toDateString() : "";
      matchesDate = regDate === targetDate || logDate === targetDate;
    }

    const matchesView = view === "all" || u.renewalRequested;
    return matchesSearch && matchesDate && matchesView;
  });

  const proCount = users.filter((u) => u.proExpiresAt && u.proExpiresAt > Date.now()).length;
  const requestCount = users.filter((u) => u.renewalRequested).length;
  const newTodayCount = users.filter((u) => new Date(u.createdAt).toDateString() === new Date().toDateString()).length;
  const activeTodayCount = users.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="serif text-3xl font-bold text-gray-900 mb-1">Admin Panel</h1>
            <p className="text-sm text-gray-500 font-medium">Monitoring {users.length} registered educators.</p>
          </div>
          <button 
            onClick={fetchUsers} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, color: "text-gray-900", bg: "bg-white" },
            { label: "Active Pro", value: proCount, color: "text-emerald-600", bg: "bg-emerald-50/30" },
            { label: "New Today", value: newTodayCount, color: "text-blue-600", bg: "bg-blue-50/30" },
            { label: "Active Today", value: activeTodayCount, color: "text-violet-600", bg: "bg-violet-50/30" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md`}>
              <div className={`text-2xl md:text-3xl font-bold ${s.color} tabular-nums mb-1`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setView("all")} 
              className={`px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${view === "all" ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              All Users
            </button>
            <button 
              onClick={() => setView("requests")} 
              className={`px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${view === "requests" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              Renewal Requests 
              {requestCount > 0 && <span className="bg-white text-amber-600 px-2 py-0.5 rounded text-[10px] font-black">{requestCount}</span>}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search email or name..." 
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:border-emerald-500 focus:ring-0 transition-all" 
              />
            </div>
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:border-emerald-500 focus:ring-0 transition-all" 
            />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 animate-pulse">
            <RefreshCw size={32} className="animate-spin mb-4 opacity-20" />
            <p className="text-sm font-medium tracking-widest uppercase">Loading Database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold">User Information</th>
                    <th className="text-left px-6 py-4 font-bold">Registration / Login</th>
                    <th className="text-left px-6 py-4 font-bold">Status</th>
                    <th className="text-right px-6 py-4 font-bold">Usage</th>
                    <th className="text-right px-6 py-4 font-bold">Quota</th>
                    <th className="text-right px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u) => {
                    const isPro = !!(u.proExpiresAt && u.proExpiresAt > Date.now());
                    return (
                      <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{u.email}</p>
                          <p className="text-xs text-gray-400">{u.displayName || "No name set"}</p>
                          {u.renewalRequested && <span className="inline-block mt-1 text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">RENEWAL REQUESTED</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-[11px] font-medium text-gray-500">
                            <div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-300" /> {formatDate(u.createdAt)}</div>
                            <div className="flex items-center gap-1.5 opacity-60"><Clock size={12} className="text-gray-300" /> {formatDate(u.lastLoginAt)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><ProBadge expiresAt={u.proExpiresAt} /></td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-bold tabular-nums">
                            {u.monthlyExamsGenerated ?? 0}
                          </span>
                          <span className="text-[10px] text-gray-300 ml-1">/ {isPro ? 10 : FREE_EXAM_LIMIT}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-bold text-blue-600 tabular-nums">+{u.extraExamsQuota ?? 0}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => handleExtend(u.uid, 30)} className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm">
                              {extending === `${u.uid}-30` ? "..." : "Extend"}
                            </button>
                            <button onClick={() => handleAddQuota(u.uid, 10)} className="h-8 px-3 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm">
                              {extending === `${u.uid}-q10` ? "..." : "+10 Q"}
                            </button>
                            <button onClick={() => handleAddQuota(u.uid, 30)} className="h-8 px-3 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm">
                              {extending === `${u.uid}-q30` ? "..." : "+30 Q"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="lg:hidden space-y-4">
              {filtered.map((u) => {
                const isPro = !!(u.proExpiresAt && u.proExpiresAt > Date.now());
                return (
                  <div key={u.uid} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <p className="font-bold text-gray-900 truncate">{u.email}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">{u.displayName || "Anonymous Educator"}</p>
                      </div>
                      <ProBadge expiresAt={u.proExpiresAt} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-50">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Registered</p>
                        <p className="text-xs font-semibold text-gray-700">{formatDate(u.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Usage / Limit</p>
                        <p className="text-xs font-semibold text-gray-700 tabular-nums">
                          {u.monthlyExamsGenerated ?? 0} / {isPro ? 10 : FREE_EXAM_LIMIT}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Last Login</p>
                        <p className="text-xs font-semibold text-gray-500">{formatDate(u.lastLoginAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Extra Quota</p>
                        <p className="text-xs font-bold text-blue-600">+{u.extraExamsQuota ?? 0}</p>
                      </div>
                    </div>

                    {u.renewalRequested && (
                      <div className="mb-4 p-2 bg-amber-50 rounded-lg border border-amber-100 text-center">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Renewal Requested</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleExtend(u.uid, 30)} className="w-full h-11 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-100">
                        {extending === `${u.uid}-30` ? "Processing..." : "Extend Pro (30 Days)"}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAddQuota(u.uid, 10)} className="h-11 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest">
                          {extending === `${u.uid}-q10` ? "..." : "+10 Quota"}
                        </button>
                        <button onClick={() => handleAddQuota(u.uid, 30)} className="h-11 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest">
                          {extending === `${u.uid}-q30` ? "..." : "+30 Quota"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center justify-center text-center px-10">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <User size={32} className="text-gray-200" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No educators found</h3>
                <p className="text-sm text-gray-400 max-w-[200px]">Try adjusting your search filters or check all users.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
