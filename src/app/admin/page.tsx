"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { RefreshCw, Search, Calendar, Clock, Info, ShieldAlert } from "lucide-react";

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
  if (!expiresAt) return <span className="text-xs text-gray-400">Free</span>;
  const active = expiresAt > Date.now();
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
      active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
    }`}>
      {active ? "PRO" : "EXPIRED"}
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

  const filtered = users.filter((u) => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage users and subscriptions</p>
          </div>
          <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* LEGEND / GUIDE */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-4 items-start">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">Extend</p>
              <p className="text-xs text-amber-800 leading-relaxed">Adds **30 days** of Pro status to the user. Resets their monthly usage counter to 0.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">+10 Q / +30 Q</p>
              <p className="text-xs text-amber-800 leading-relaxed">Adds **Bonus Quota**. If a user has 10 bonus exams, they can generate 10 more regardless of their monthly limit.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">Renewal Req.</p>
              <p className="text-xs text-amber-800 leading-relaxed">Highlighted users have clicked "Request Renewal" from their dashboard, signaling they want to pay.</p>
            </div>
          </div>
        </div>

        <div className="mb-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by email or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading users...</div>
        ) : (
          <div className="bg-white border rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created / Last Login</th>
                  <th className="px-6 py-4 text-center">Usage (Monthly)</th>
                  <th className="px-6 py-4 text-center">Bonus Quota</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filtered.map((u) => (
                  <tr key={u.uid} className={`hover:bg-gray-50 ${u.renewalRequested ? "bg-amber-50/50" : ""}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.displayName || "No Name"}</p>
                      {u.renewalRequested && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full mt-1 inline-block uppercase">Pending Request</span>}
                    </td>
                    <td className="px-6 py-4"><ProBadge expiresAt={u.proExpiresAt} /></td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(u.createdAt)}</span>
                        <span className="flex items-center gap-1 opacity-60"><Clock size={10} /> {formatDate(u.lastLoginAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-bold">{u.monthlyExamsGenerated || 0}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-gray-400">{u.proExpiresAt ? "10" : FREE_EXAM_LIMIT}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs">+{u.extraExamsQuota || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleExtend(u.uid, 30)}
                          disabled={!!extending}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {extending === `${u.uid}-30` ? "..." : "Extend"}
                        </button>
                        <button 
                          onClick={() => handleAddQuota(u.uid, 10)}
                          disabled={!!extending}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                          {extending === `${u.uid}-q10` ? "..." : "+10 Q"}
                        </button>
                        <button 
                          onClick={() => handleAddQuota(u.uid, 30)}
                          disabled={!!extending}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {extending === `${u.uid}-q30` ? "..." : "+30 Q"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
