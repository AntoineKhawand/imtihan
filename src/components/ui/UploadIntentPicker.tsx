"use client";
import { UPLOAD_PURPOSES } from "@/lib/sourceDocument";
import type { UploadIntent } from "@/lib/schemas/sourceDocument";

export function UploadIntentPicker({ value, onChange }: { value: UploadIntent; onChange: (value: UploadIntent) => void }) {
  return <fieldset className="mt-4 space-y-3" data-guide="upload-intent">
    <legend className="text-sm font-semibold text-[var(--text)]">How should we use this document?</legend>
    <p className="text-xs text-[var(--text-secondary)]">Select one or more uses. You will review extracted details before generation.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {UPLOAD_PURPOSES.map(purpose => <label key={purpose.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 cursor-pointer">
        <input type="checkbox" checked={value.purposes.includes(purpose.id)} className="mt-1 shrink-0" onChange={e => onChange({ ...value, purposes: e.target.checked ? [...value.purposes, purpose.id] : value.purposes.filter(p => p !== purpose.id) })} />
        <span className="min-w-0"><span className="block text-xs font-semibold text-[var(--text)]">{purpose.label}</span><span className="block text-xs mt-1 leading-relaxed text-[var(--text-secondary)]">{purpose.description}</span></span>
      </label>)}
    </div>
    <label className="block text-xs text-[var(--text-secondary)]">Specific instructions (optional)
      <textarea value={value.instructions} maxLength={1500} onChange={e => onChange({ ...value, instructions: e.target.value })} placeholder="For example: keep the two sections and marks, create new questions, preserve the experiment measurements." className="mt-2 w-full min-h-24 rounded-xl p-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" />
    </label>
    {!value.purposes.length && <p role="alert" className="text-xs text-[var(--danger)]">Select at least one use, or remove the attachment.</p>}
  </fieldset>;
}
