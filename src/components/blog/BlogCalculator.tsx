"use client";

import { useState } from "react";
import { Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BlogCalculator() {
  const [exams, setExams] = useState(4);
  const hoursPerExam = 3; // Estimated manual time per exam including corrige
  const timeWithImtihan = 0.5; // 30 mins total with AI

  const savedHours = exams * (hoursPerExam - timeWithImtihan);

  return (
    <div className="card p-6 bg-[var(--surface-raised)] border-[var(--border)] shadow-xl ring-1 ring-black/[0.03]">
      <div className="flex items-center gap-2 mb-4 text-[var(--accent)]">
        <Zap size={18} className="fill-[var(--accent)]" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Time Saving Calculator</h3>
      </div>
      
      <p className="text-xs text-[var(--text-secondary)] mb-6">
        How many exams do you prepare per month?
      </p>

      <div className="space-y-6">
        <div className="relative">
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={exams} 
            onChange={(e) => setExams(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)] h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-[var(--text-tertiary)]">
            <span>1 EXAM</span>
            <span>20 EXAMS</span>
          </div>
        </div>

        <div className="bg-[var(--accent-light)] rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <div className="text-3xl font-bold text-[var(--accent)] mb-1">
            {savedHours.toFixed(0)} <span className="text-sm font-medium">HOURS</span>
          </div>
          <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-tight">
            Saved per month with Imtihan
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] bg-[var(--bg-subtle)] p-3 rounded-lg">
          <Clock size={14} />
          <span>That's about <strong>{Math.round(savedHours / 8)} full working days</strong> reclaimed.</span>
        </div>

        <Link 
          href="/auth/login"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          Start Saving Time <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
