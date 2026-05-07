"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { RefreshCw, Search, Calendar, Clock, ShieldCheck, User, Zap, Sparkles, Plus, BarChart3, TrendingUp, FileText, ArrowRight, Mail, Send, CheckCircle2, XCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  resetRequested?: boolean;
  proExpiresAt: number | null;
  planType: "monthly" | "yearly";
  examsGenerated: number;
  monthlyExamsGenerated?: number;
  extraExamsQuota?: number;
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ProBadge({ expiresAt }: { expiresAt: number | null }) {
  if (!expiresAt) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider">Free</span>;
  const active = expiresAt > Date.now();
  return (
    <span className={cn(
      "text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 w-fit uppercase tracking-wider",
      active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
      {active ? "Pro" : "Expired"}
    </span>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={cn(
        "w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
        checked ? "bg-emerald-600 border-emerald-600 shadow-sm" : "bg-white border-gray-300 hover:border-emerald-400"
      )}
    >
      {checked && <Check size={11} strokeWidth={3} className="text-white" />}
    </button>
  );
}

const EMAIL_TEMPLATES = [
  { id: "newsletter" as const, icon: "📬", title: "Newsletter", desc: "Feature updates & tips" },
  { id: "activation" as const, icon: "⚡", title: "Activation", desc: "No exams yet" },
  { id: "engagement" as const, icon: "💬", title: "Engagement", desc: "Active users follow-up" },
  { id: "custom" as const, icon: "✏️", title: "Custom HTML", desc: "Write your own" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "email" | "blog">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statsData, setStatsData] = useState<{ subjects: Record<string, number>; lastUpdated: number }>({ subjects: {}, lastUpdated: Date.now() });
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "requests">("all");
  const [showYearly, setShowYearly] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [emailTemplate, setEmailTemplate] = useState<"newsletter" | "activation" | "engagement" | "custom">("newsletter");
  const [customSubject, setCustomSubject] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; failed: number } | null>(null);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const [userRes, statsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (userRes.status === 401 || userRes.status === 403) {
        setIsAuthorized(false);
        setTimeout(() => router.replace("/dashboard"), 2000);
        return;
      }
      const [usersData, sData] = await Promise.all([userRes.json(), statsRes.json()]);
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

  useEffect(() => { fetchData(); }, [user]);

  const handleExtend = async (uid: string, days: number) => {
    if (!user) return;
    setExtending(`${uid}-${days}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/extend-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid: uid, days }),
      });
      if (res.ok) { toast.success(`Extended by ${days} days`); fetchData(); }
    } catch { toast.error("Failed to extend"); }
    finally { setExtending(null); }
  };

  const handleAddQuota = async (uid: string, amount: number) => {
    if (!user) return;
    setExtending(`${uid}-q${amount}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/add-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid: uid, amount }),
      });
      if (res.ok) { toast.success(`Added ${amount} exams`); fetchData(); }
    } catch { toast.error("Failed to add quota"); }
    finally { setExtending(null); }
  };

  const handleAutoGenerateBlog = async () => {
    if (!user) return;
    setIsGeneratingBlog(true);
    const publishPromise = (async () => {
      const token = await user.getIdToken();
      const res = await fetch("/api/cron/blog-auto-publish", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to publish");
      return data;
    })();
    toast.promise(publishPromise, {
      loading: "AI is researching and writing your blog article...",
      success: (data) => `Published: ${data.title}`,
      error: (err) => `Error: ${err.message}`,
      finally: () => setIsGeneratingBlog(false),
    });
  };

  const toggleSelect = (uid: string) => {
    setSelectedUids(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const handleSendEmails = async () => {
    if (!user || selectedUids.size === 0) return;
    setSendingEmails(true);
    setEmailResult(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          template: emailTemplate,
          targetUids: Array.from(selectedUids),
          ...(emailTemplate === "custom" ? { subject: customSubject, html: customHtml } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailResult({ sent: data.sent, failed: data.failed });
        toast.success(`Sent ${data.sent} email${data.sent !== 1 ? "s" : ""}${data.failed > 0 ? `, ${data.failed} failed` : ""}`);
        setSelectedUids(new Set());
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch { toast.error("Failed to send emails"); }
    finally { setSendingEmails(false); }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-sm">This area is restricted to Imtihan administrators. Redirecting...</p>
      </div>
    );
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || (u.displayName || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "requests" ? (u.renewalRequested || u.resetRequested) : true;
    const matchesPlan = showYearly ? u.planType === "yearly" : true;
    return matchesSearch && matchesFilter && matchesPlan;
  });

  const emailFiltered = users.filter(u =>
    u.email.toLowerCase().includes(emailSearch.toLowerCase()) ||
    (u.displayName || "").toLowerCase().includes(emailSearch.toLowerCase())
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every(u => selectedUids.has(u.uid));

  const topSubjects = Object.entries(statsData.subjects || {}).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Admin Console</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Imtihan Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-100 w-full sm:w-auto">
            {(["users", "email", "blog"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none capitalize",
                  activeTab === tab ? "bg-white text-emerald-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab === "users" && <User size={13} />}
                {tab === "email" && <Mail size={13} />}
                {tab === "blog" && <FileText size={13} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Educators</p>
                <h3 className="text-2xl font-black text-gray-900">{users.length}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Pro</p>
                <h3 className="text-2xl font-black text-emerald-600">{users.filter(u => u.proExpiresAt && u.proExpiresAt > Date.now()).length}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Requests</p>
                <h3 className="text-2xl font-black text-amber-600">{users.filter(u => u.renewalRequested || u.resetRequested).length}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hidden lg:block">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Yearly Plans</p>
                <h3 className="text-2xl font-black text-blue-600">{users.filter(u => u.planType === "yearly").length}</h3>
              </div>
            </div>

            <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-[40px] mb-8 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Platform Pulse</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4 tracking-tight">Top Generation Subjects</h2>
                  <div className="flex flex-wrap gap-3">
                    {topSubjects.map(([sub, count]) => (
                      <div key={sub} className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                        <span className="text-sm font-bold text-white/90">{subjectMap[sub] || sub}</span>
                        <div className="h-4 w-[2px] bg-white/20" />
                        <span className="text-sm font-black text-emerald-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-900/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 text-center">
                  <BarChart3 size={24} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Global Generations</p>
                  <h4 className="text-5xl font-black text-white">{Object.values(statsData.subjects || {}).reduce((a, b) => a + b, 0)}</h4>
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-emerald-300/60 font-medium">
                    <Clock size={12} /> Last updated: {new Date(statsData.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button onClick={() => setFilterType("all")} className={cn("h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0", filterType === "all" ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200")}>
                  All Users
                </button>
                <button onClick={() => setFilterType("requests")} className={cn("h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2", filterType === "requests" ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200")}>
                  {filterType === "requests" && <ShieldCheck size={14} />} Pending Requests
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button onClick={() => setShowYearly(!showYearly)} className={cn("h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2", showYearly ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200")}>
                  <Zap size={14} /> Yearly Only
                </button>
              </div>
              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search email or name..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all" />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50">
                      <th className="px-5 py-5 w-10">
                        <Checkbox
                          checked={allFilteredSelected}
                          onChange={() => {
                            if (allFilteredSelected) setSelectedUids(new Set());
                            else setSelectedUids(new Set(filtered.map(u => u.uid)));
                          }}
                        />
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                      <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage</th>
                      <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quota</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((u) => (
                      <tr
                        key={u.uid}
                        onClick={() => toggleSelect(u.uid)}
                        className={cn("group transition-colors cursor-pointer", selectedUids.has(u.uid) ? "bg-emerald-50/40" : "hover:bg-gray-50/30")}
                      >
                        <td className="px-5 py-5">
                          <Checkbox checked={selectedUids.has(u.uid)} onChange={() => toggleSelect(u.uid)} />
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border-2 shrink-0", u.renewalRequested ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100")}>
                              {u.displayName?.[0] || u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-gray-900">{u.email}</span>
                                {u.resetRequested && <span className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">RESET</span>}
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{u.displayName || "Anonymized Educator"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5"><ProBadge expiresAt={u.proExpiresAt} /></td>
                        <td className="px-4 py-5">
                          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider", u.planType === "yearly" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100")}>
                            {u.planType}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="text-[11px] text-gray-400 flex flex-col gap-1 font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={11} className="text-gray-300" /> {formatDate(u.createdAt)}</span>
                            <span className="flex items-center gap-1.5"><Clock size={11} className="text-gray-300" /> {formatDate(u.lastLoginAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center" onClick={e => e.stopPropagation()}>
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-900">{u.monthlyExamsGenerated || 0}</span>
                            <div className="h-1 w-8 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((u.monthlyExamsGenerated || 0) / (u.proExpiresAt ? (u.planType === "yearly" ? 20 : 10) : FREE_EXAM_LIMIT)) * 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center" onClick={e => e.stopPropagation()}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-[11px] border border-blue-100">
                            <Plus size={10} />{u.extraExamsQuota || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-1.5">
                            <button onClick={() => handleExtend(u.uid, 30)} disabled={!!extending}
                              className={cn("h-8 px-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap disabled:opacity-50", u.renewalRequested || u.resetRequested ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
                              {extending === `${u.uid}-30` ? <RefreshCw size={11} className="animate-spin" /> : "+30D"}
                            </button>
                            <button onClick={() => handleExtend(u.uid, 365)} disabled={!!extending}
                              className="h-8 px-3 rounded-xl text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all whitespace-nowrap disabled:opacity-50">
                              {extending === `${u.uid}-365` ? <RefreshCw size={11} className="animate-spin" /> : "+1Y"}
                            </button>
                            <button onClick={() => handleAddQuota(u.uid, 10)} disabled={!!extending}
                              className="h-8 px-2.5 bg-white border border-gray-200 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-colors whitespace-nowrap">
                              {extending === `${u.uid}-q10` ? "..." : "+10Q"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email Result (Users Tab) */}
            {emailResult && (
              <div className="mt-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{emailResult.sent} email{emailResult.sent !== 1 ? "s" : ""} sent</p>
                  {emailResult.failed > 0 && <p className="text-sm text-red-500">{emailResult.failed} failed</p>}
                </div>
                <button onClick={() => setEmailResult(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
              </div>
            )}
          </>
        )}

        {/* ── EMAIL TAB ── */}
        {activeTab === "email" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                <h3 className="text-2xl font-black text-gray-900">{users.length}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Selected</p>
                <h3 className="text-2xl font-black text-emerald-600">{selectedUids.size}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">No Exams</p>
                <h3 className="text-2xl font-black text-amber-600">{users.filter(u => u.examsGenerated === 0).length}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Active (1+)</p>
                <h3 className="text-2xl font-black text-blue-600">{users.filter(u => u.examsGenerated >= 1).length}</h3>
              </div>
            </div>

            {/* Template Picker */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Choose Template</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EMAIL_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setEmailTemplate(t.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      emailTemplate === t.id ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    )}
                  >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{t.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium leading-tight">{t.desc}</p>
                    {emailTemplate === t.id && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <Check size={10} /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom HTML Editor */}
            {emailTemplate === "custom" && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-900 mb-4">Custom Email Content</p>
                <input type="text" placeholder="Email subject..." value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 mb-4" />
                <textarea placeholder="Email HTML content..." value={customHtml} onChange={e => setCustomHtml(e.target.value)} rows={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 resize-y" />
              </div>
            )}

            {/* Recipient Picker */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-gray-900">Select Recipients</p>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border",
                    selectedUids.size > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                  )}>
                    {selectedUids.size} selected
                  </span>
                </div>

                {/* Quick Segment Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button onClick={() => setSelectedUids(new Set(users.map(u => u.uid)))}
                    className="h-8 px-4 rounded-xl text-[10px] font-bold bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                    All ({users.length})
                  </button>
                  <button onClick={() => setSelectedUids(new Set(users.filter(u => u.proExpiresAt && u.proExpiresAt > Date.now()).map(u => u.uid)))}
                    className="h-8 px-4 rounded-xl text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    Pro Active ({users.filter(u => u.proExpiresAt && u.proExpiresAt > Date.now()).length})
                  </button>
                  <button onClick={() => setSelectedUids(new Set(users.filter(u => !u.proExpiresAt || u.proExpiresAt < Date.now()).map(u => u.uid)))}
                    className="h-8 px-4 rounded-xl text-[10px] font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                    Free ({users.filter(u => !u.proExpiresAt || u.proExpiresAt < Date.now()).length})
                  </button>
                  <button onClick={() => setSelectedUids(new Set(users.filter(u => u.examsGenerated === 0).map(u => u.uid)))}
                    className="h-8 px-4 rounded-xl text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                    No Exams ({users.filter(u => u.examsGenerated === 0).length})
                  </button>
                  {selectedUids.size > 0 && (
                    <button onClick={() => setSelectedUids(new Set())}
                      className="h-8 px-4 rounded-xl text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors">
                      Clear
                    </button>
                  )}
                </div>

                {/* Search within email tab */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" placeholder="Filter by email or name..." value={emailSearch} onChange={e => setEmailSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all" />
                </div>
              </div>

              {/* User List */}
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {emailFiltered.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No users match your search</div>
                ) : emailFiltered.map(u => (
                  <div key={u.uid} onClick={() => toggleSelect(u.uid)}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 px-5 py-3.5 cursor-pointer transition-colors",
                      selectedUids.has(u.uid) ? "bg-emerald-50/60" : "hover:bg-gray-50/60"
                    )}
                  >
                    <Checkbox checked={selectedUids.has(u.uid)} onChange={() => toggleSelect(u.uid)} />
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border shrink-0",
                      u.proExpiresAt && u.proExpiresAt > Date.now() ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-500 border-gray-100"
                    )}>
                      {u.displayName?.[0] || u.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.email}</p>
                      <p className="text-xs text-gray-400 font-medium">{u.displayName || "Anonymized Educator"}</p>
                    </div>
                    <div className="shrink-0 hidden sm:block">
                      <ProBadge expiresAt={u.proExpiresAt} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Section */}
            <div className={cn(
              "rounded-3xl p-5 sm:p-6 transition-all border",
              selectedUids.size > 0
                ? "bg-emerald-950 border-transparent shadow-2xl shadow-emerald-900/30"
                : "bg-gray-50 border-gray-100"
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", selectedUids.size > 0 ? "bg-emerald-500/20" : "bg-gray-200")}>
                    <Mail size={18} className={selectedUids.size > 0 ? "text-emerald-400" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", selectedUids.size > 0 ? "text-white" : "text-gray-500")}>
                      {selectedUids.size > 0 ? `${selectedUids.size} recipient${selectedUids.size !== 1 ? "s" : ""} selected` : "Select recipients above"}
                    </p>
                    <p className={cn("text-xs mt-0.5 capitalize", selectedUids.size > 0 ? "text-emerald-300/70" : "text-gray-400")}>
                      Template: {emailTemplate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSendEmails}
                  disabled={sendingEmails || selectedUids.size === 0}
                  className="w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
                >
                  {sendingEmails ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                  {sendingEmails ? "Sending..." : "Send Emails"}
                </button>
              </div>
            </div>

            {/* Result Banner */}
            {emailResult && (
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{emailResult.sent} email{emailResult.sent !== 1 ? "s" : ""} sent successfully</p>
                  {emailResult.failed > 0 && <p className="text-sm text-red-500 font-medium">{emailResult.failed} failed</p>}
                </div>
                <button onClick={() => setEmailResult(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
              </div>
            )}
          </div>
        )}

        {/* ── BLOG TAB ── */}
        {activeTab === "blog" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Autonomous Blog Engine</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4 tracking-tight">Fully Autonomous Content</h2>
                <p className="text-emerald-100/70 max-w-2xl leading-relaxed">
                  Your blog operates in 100% Zero-Touch mode. Our AI agent researches Lebanese educational trends and publishes curriculum-aligned articles daily at 9:00 AM.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Next Publish: Tomorrow 9:00 AM
                  </div>
                  <button onClick={handleAutoGenerateBlog} disabled={isGeneratingBlog}
                    className="h-10 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50">
                    {isGeneratingBlog ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Generate Article Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Content Management</h3>
              <p className="text-sm text-gray-400 max-w-md mb-6 font-medium leading-relaxed">
                Articles are automatically synced to Firestore. Manage existing articles directly via the main blog index.
              </p>
              <Link href="/blog" className="h-12 px-8 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                Go to Blog Index <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Send Bar (Users Tab) */}
      {activeTab === "users" && selectedUids.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 bg-emerald-950 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/30 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Mail size={15} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold whitespace-nowrap">{selectedUids.size} user{selectedUids.size > 1 ? "s" : ""}</p>
          </div>
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          <select value={emailTemplate} onChange={e => setEmailTemplate(e.target.value as typeof emailTemplate)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 flex-1 sm:flex-none min-w-0">
            <option value="newsletter" className="bg-emerald-950">📬 Newsletter</option>
            <option value="activation" className="bg-emerald-950">⚡ Activation</option>
            <option value="engagement" className="bg-emerald-950">💬 Engagement</option>
            <option value="custom" className="bg-emerald-950">✏️ Custom</option>
          </select>
          <button onClick={handleSendEmails} disabled={sendingEmails}
            className="h-10 px-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all whitespace-nowrap shrink-0">
            {sendingEmails ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            Send
          </button>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && activeTab === "users" && (
        <div className="md:hidden px-4 mt-4 grid grid-cols-1 gap-4">
          {filtered.map(u => (
            <div key={u.uid}
              onClick={() => toggleSelect(u.uid)}
              className={cn(
                "bg-white p-5 rounded-3xl border shadow-sm cursor-pointer transition-colors",
                selectedUids.has(u.uid) ? "border-emerald-200 bg-emerald-50/30" : u.renewalRequested ? "border-amber-200 bg-amber-50/20" : "border-gray-100"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0", u.renewalRequested ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-100")}>
                    {u.displayName?.[0] || u.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[180px]">{u.email}</p>
                    <ProBadge expiresAt={u.proExpiresAt} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.renewalRequested && <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded">REQ</span>}
                  <Checkbox checked={selectedUids.has(u.uid)} onChange={() => toggleSelect(u.uid)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Monthly Usage</p>
                  <p className="text-sm font-bold text-gray-900">{u.monthlyExamsGenerated || 0} / {u.proExpiresAt ? (u.planType === "yearly" ? "20" : "10") : "2"}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Bonus Quota</p>
                  <p className="text-sm font-bold text-blue-700">+{u.extraExamsQuota || 0}</p>
                </div>
              </div>

              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleExtend(u.uid, 30)} disabled={!!extending}
                  className="flex-1 h-10 bg-emerald-600 text-white rounded-xl text-[10px] font-bold disabled:opacity-50 flex items-center justify-center gap-1">
                  {extending === `${u.uid}-30` ? <RefreshCw size={12} className="animate-spin" /> : "Extend 30D"}
                </button>
                <button onClick={() => handleExtend(u.uid, 365)} disabled={!!extending}
                  className="flex-1 h-10 bg-purple-600 text-white rounded-xl text-[10px] font-bold disabled:opacity-50 flex items-center justify-center">
                  {extending === `${u.uid}-365` ? <RefreshCw size={12} className="animate-spin" /> : "+1 Year"}
                </button>
                <button onClick={() => handleAddQuota(u.uid, 10)} disabled={!!extending}
                  className="h-10 px-4 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold disabled:opacity-50">
                  {extending === `${u.uid}-q10` ? "..." : "+10Q"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
