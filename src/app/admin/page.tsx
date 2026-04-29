"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FREE_EXAM_LIMIT } from "@/lib/utils";

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
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ProBadge({ expiresAt }: { expiresAt: number | null }) {
  if (!expiresAt) return <span className="text-xs text-gray-400">Free</span>;
  const active = expiresAt > Date.now();
  const days = Math.ceil((expiresAt - Date.now()) / 86400000);
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
    }`}>
      {active ? `Pro · ${days}d left` : `Expired ${formatDate(expiresAt)}`}
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
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD
  const [view, setView] = useState<"all" | "requests">("all");

  async function fetchUsers() {
  async function fetchUsers() {
    if (!user) return;
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

  const filtered = users.filter((u) => {
    // Search filter
    const matchesSearch = !search || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase());
    
    // Date filter
    let matchesDate = true;
    if (filterDate) {
      const targetDate = new Date(filterDate).toDateString();
      const regDate = new Date(u.createdAt).toDateString();
      const logDate = u.lastLoginAt ? new Date(u.lastLoginAt).toDateString() : "";
      matchesDate = regDate === targetDate || logDate === targetDate;
    }

    // View filter
    const matchesView = view === "all" || u.renewalRequested;

    return matchesSearch && matchesDate && matchesView;
  });

  const proCount = users.filter((u) => u.proExpiresAt && u.proExpiresAt > Date.now()).length;
  const requestCount = users.filter((u) => u.renewalRequested).length;
  const newTodayCount = users.filter((u) => {
    const today = new Date().toDateString();
    return new Date(u.createdAt).toDateString() === today;
  }).length;
  const activeTodayCount = users.filter((u) => {
    const today = new Date().toDateString();
    return u.lastLoginAt && new Date(u.lastLoginAt).toDateString() === today;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage subscriptions and monitor user activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsers}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users", value: users.length, color: "text-gray-900" },
            { label: "Active Pro", value: proCount, color: "text-emerald-600" },
            { label: "New Today", value: newTodayCount, color: "text-blue-600" },
            { label: "Active Today", value: activeTodayCount, color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`text-2xl font-bold ${s.color} tabular-nums`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => setView("all")}
              className={`px-4 h-10 rounded-xl text-sm font-medium transition-all ${
                view === "all" 
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setView("requests")}
              className={`px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                view === "requests" 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-100" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Renewal Requests
              {requestCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${view === "requests" ? "bg-white text-amber-600" : "bg-amber-100 text-amber-600"}`}>
                  {requestCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email..."
                className="w-64 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 bg-white px-3 border border-gray-200 rounded-xl">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-sm bg-transparent focus:outline-none"
              />
              {filterDate && (
                <button 
                  onClick={() => setFilterDate("")}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading users…</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Registered / Login</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Expires</th>
                  <th className="text-right px-4 py-3 font-medium">Quota</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => {
                  const isPro = !!(u.proExpiresAt && u.proExpiresAt > Date.now());
                  const monthlyLimit = isPro ? 100 : FREE_EXAM_LIMIT;
                  const monthlyUsed = u.monthlyExamsGenerated ?? 0;
                  const isNearLimit = monthlyUsed >= monthlyLimit * 0.8;

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{u.email}</p>
                          {u.displayName && <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{u.displayName}</p>}
                          {u.renewalRequested && (
                            <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 animate-pulse">
                              RENEWAL REQUESTED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600">R: {formatDate(u.createdAt)}</p>
                        <p className="text-[10px] text-gray-400">L: {formatDate(u.lastLoginAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ProBadge expiresAt={u.proExpiresAt} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.proExpiresAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-xs tabular-nums font-medium ${isNearLimit ? "text-amber-600" : "text-gray-500"}`}>
                            {monthlyUsed}/{monthlyLimit}
                          </span>
                          <span className="text-[10px] text-gray-400 tabular-nums">Total: {u.examsGenerated}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleExtend(u.uid, 30)}
                            disabled={extending !== null}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {extending === `${u.uid}-30` ? "…" : "+ 30 days"}
                          </button>
                          <button
                            onClick={() => handleExtend(u.uid, 365)}
                            disabled={extending !== null}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {extending === `${u.uid}-365` ? "…" : "+ 1 Year"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
