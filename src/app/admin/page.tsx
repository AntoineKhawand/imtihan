"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
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
          ? { ...u, proExpiresAt: data.proExpiresAt, monthlyExamsGenerated: 0 }
          : u)
      );
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    } finally {
      setExtending(null);
    }
  }

  const filtered = search
    ? users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const proCount = users.filter((u) => u.proExpiresAt && u.proExpiresAt > Date.now()).length;
  const expiredCount = users.filter((u) => u.proExpiresAt && u.proExpiresAt <= Date.now()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin — Subscriptions</h1>
          <p className="text-sm text-gray-500">
            Manage manual Whish renewals.
            <span className="ml-2 font-medium text-gray-700">Monthly plan ($5.99) → +30 days.</span>
            <span className="ml-2 font-medium text-gray-700">Yearly plan ($47.88) → +1 Year.</span>
            <span className="ml-2 text-emerald-600 font-medium">Monthly quota resets automatically on each renewal.</span>
          </p>
          {user && (
            <p className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 rounded px-2 py-1 inline-block">
              Your UID: {user.uid}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total users", value: users.length },
            { label: "Active Pro", value: proCount },
            { label: "Expired Pro", value: expiredCount },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full mb-4 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
        />

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
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Expires</th>
                  <th className="text-right px-4 py-3 font-medium">This month</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => {
                  const isPro = !!(u.proExpiresAt && u.proExpiresAt > Date.now());
                  const monthlyLimit = isPro ? 100 : 3;
                  const monthlyUsed = u.monthlyExamsGenerated ?? 0;
                  const isNearLimit = monthlyUsed >= monthlyLimit * 0.8;

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{u.email}</p>
                        {u.displayName && <p className="text-xs text-gray-400">{u.displayName}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <ProBadge expiresAt={u.proExpiresAt} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.proExpiresAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs tabular-nums font-medium ${isNearLimit ? "text-amber-600" : "text-gray-500"}`}>
                          {monthlyUsed}/{monthlyLimit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 tabular-nums text-xs">
                        {u.examsGenerated}
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
