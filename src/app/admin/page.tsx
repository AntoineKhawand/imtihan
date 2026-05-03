"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FREE_EXAM_LIMIT } from "@/lib/utils";
import { RefreshCw, Search, Calendar, Clock, ShieldCheck, User, Zap, Sparkles, Plus, BarChart3, TrendingUp, FileText, Wand2, ArrowRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"users" | "blog">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statsData, setStatsData] = useState<{ subjects: Record<string, number>; lastUpdated: number }>({ subjects: {}, lastUpdated: Date.now() });
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "requests">("all");
  const [showYearly, setShowYearly] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const userRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.status === 401 || userRes.status === 403) {
        setIsAuthorized(false);
        setTimeout(() => router.replace("/dashboard"), 2000);
        return;
      }
      
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

  useEffect(() => { fetchData(); }, [user]);

  const handleExtend = async (uid: string, days: number) => {
    if (!user) return;
    setExtending(`${uid}-${days}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/extend-pro", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUid: uid, days })
      });
      if (res.ok) {
        toast.success(`Extended by ${days} days`);
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to extend");
    } finally {
      setExtending(null);
    }
  };

  const handleAddQuota = async (uid: string, amount: number) => {
    if (!user) return;
    setExtending(`${uid}-q${amount}`);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/add-quota", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUid: uid, amount })
      });
      if (res.ok) {
        toast.success(`Added ${amount} exams`);
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to add quota");
    } finally {
      setExtending(null);
    }
  };

  const handleAutoGenerateBlog = async () => {
    if (!user) return;
    setIsGeneratingBlog(true);
    
    const publishPromise = (async () => {
      const token = await user.getIdToken();
      const res = await fetch("/api/cron/blog-auto-publish", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to publish");
      return data;
    })();

    toast.promise(publishPromise, {
      loading: "AI is researching and writing your blog article...",
      success: (data) => `Published: ${data.title}`,
      error: (err) => `Error: ${err.message}`,
      finally: () => setIsGeneratingBlog(false)
    });
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-sm">This area is restricted to Imtihan administrators. Redirecting you home...</p>
      </div>
    );
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || (u.displayName || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "requests" ? (u.renewalRequested || u.resetRequested) : true;
    const matchesPlan = showYearly ? u.planType === "yearly" : true;
    return matchesSearch && matchesFilter && matchesPlan;
  });

  const topSubjects = Object.entries(statsData.subjects || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Admin Console</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Imtihan Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setActiveTab("users")}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === "users" ? "bg-white text-emerald-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <User size={14} /> Users
            </button>
            <button 
              onClick={() => setActiveTab("blog")}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === "blog" ? "bg-white text-emerald-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <FileText size={14} /> Blog
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {activeTab === "users" ? (
          <>
            {/* Quick Stats Grid */}
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

            {/* Main Stats Card */}
            <div className="bg-emerald-950 text-white p-8 rounded-[40px] mb-8 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-[1.5fr_1fr] gap-12 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Platform Pulse</span>
                  </div>
                  <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">Top Generation Subjects</h2>
                  <div className="flex flex-wrap gap-3">
                    {topSubjects.map(([sub, count]) => (
                      <div key={sub} className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 group hover:bg-white/20 transition-all">
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

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                <button 
                  onClick={() => setFilterType("all")}
                  className={cn(
                    "h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0",
                    filterType === "all" ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                  )}
                >
                  All Users
                </button>
                <button 
                  onClick={() => setFilterType("requests")}
                  className={cn(
                    "h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2",
                    filterType === "requests" ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                  )}
                >
                  {filterType === "requests" && <ShieldCheck size={14} />}
                  Pending Requests
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button 
                  onClick={() => setShowYearly(!showYearly)}
                  className={cn(
                    "h-10 px-5 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2",
                    showYearly ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                  )}
                >
                  <Zap size={14} /> Yearly Only
                </button>
              </div>

              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quota</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((u) => (
                      <tr key={u.uid} className="group hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black border-2",
                              u.renewalRequested ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                              {u.displayName?.[0] || u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-gray-900">{u.email}</span>
                                {u.resetRequested && (
                                  <span className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter ml-1">RESET</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{u.displayName || "Anonymized Educator"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6"><ProBadge expiresAt={u.proExpiresAt} /></td>
                        <td className="px-6 py-6">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider",
                            u.planType === "yearly" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"
                          )}>
                            {u.planType}
                          </span>
                        </td>
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
                                "h-9 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5",
                                u.renewalRequested || u.resetRequested ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
                                "disabled:opacity-50"
                              )}
                              title="Monthly Extension (+30 Days)"
                            >
                              {extending === `${u.uid}-30` ? <RefreshCw size={12} className="animate-spin" /> : "+30D"}
                            </button>
                            <button 
                              onClick={() => handleExtend(u.uid, 365)}
                              disabled={!!extending}
                              className={cn(
                                "h-9 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700",
                                "disabled:opacity-50"
                              )}
                              title="Yearly Extension (+365 Days)"
                            >
                              {extending === `${u.uid}-365` ? <RefreshCw size={12} className="animate-spin" /> : "+1Y"}
                            </button>
                            <div className="w-px h-4 bg-gray-200 mx-0.5" />
                            <button 
                              onClick={() => handleAddQuota(u.uid, 10)}
                              disabled={!!extending}
                              className="h-9 px-2.5 bg-white border border-gray-200 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-colors"
                            >
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
          </>
        ) : (
          /* BLOG TAB */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Blog Control Center */}
            <div className="bg-emerald-950 text-white p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Autonomous Blog Engine</span>
                </div>
                <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">Fully Autonomous Content</h2>
                <p className="text-emerald-100/70 max-w-2xl leading-relaxed">
                  Your blog is now operating in 100% Zero-Touch mode. Our AI agent researches Lebanese educational trends and publishes curriculum-aligned articles daily at 9:00 AM.
                </p>
                <div className="mt-8 flex items-center gap-4 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Next Publish: Tomorrow 9:00 AM
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Content Management</h3>
              <p className="text-sm text-gray-400 max-w-md mb-6 font-medium leading-relaxed">
                Articles are automatically synced to Firestore. You can manage existing articles directly via the main blog index.
              </p>
              <Link href="/blog" className="h-12 px-8 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                Go to Blog Index <ArrowRight size={18} />
              </Link>
            </div>
            
            <Link href="/blog" className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors">
              Go to Blog Index <ArrowRight size={16} />
            </Link>
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
      
      {!loading && activeTab === "users" && (
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
                  disabled={!!extending}
                  className="flex-1 h-10 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {extending === `${u.uid}-30` ? <RefreshCw size={12} className="animate-spin" /> : "Extend 30D"}
                </button>
                <button 
                  onClick={() => handleExtend(u.uid, 365)}
                  disabled={!!extending}
                  className="flex-1 h-10 bg-purple-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {extending === `${u.uid}-365` ? <RefreshCw size={12} className="animate-spin" /> : "+1 Year"}
                </button>
                <button 
                  onClick={() => handleAddQuota(u.uid, 10)}
                  disabled={!!extending}
                  className="h-10 px-4 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold disabled:opacity-50"
                >
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
