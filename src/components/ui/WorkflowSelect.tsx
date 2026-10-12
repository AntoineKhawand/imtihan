"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled?: boolean };
interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "multiple"> {
  label?: string; hint?: string; error?: string; options: Option[]; placeholder?: string;
}

/** Themed workflow listbox; native select retains forms, refs and onChange contracts. */
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, hint, error, options, placeholder, id, className, value, defaultValue, onChange, disabled, style, ...props }, ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState(String(defaultValue ?? options.find(o => !o.disabled)?.value ?? ""));
  const selectedValue = String(value ?? localValue);
  const selected = options.findIndex(o => o.value === selectedValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const typed = useRef({ text: "", at: 0 });
  useImperativeHandle(ref, () => native.current!, []);

  function close() { setOpen(false); }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled || disabled) return;
    if (native.current) {
      native.current.value = option.value;
      native.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    close(); trigger.current?.focus();
  }
  function show() {
    setActive(selected >= 0 && !options[selected].disabled ? selected : Math.max(0, options.findIndex(o => !o.disabled)));
    setOpen(true);
  }
  function move(direction: number) {
    let index = active;
    for (let count = 0; count < options.length; count++) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) { setActive(index); return; }
    }
  }
  useLayoutEffect(() => {
    if (!open) return;
    function align() {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 6, padding = 12;
      const below = window.innerHeight - rect.bottom - padding - gap;
      const above = rect.top - padding - gap;
      const height = Math.min(280, Math.max(below, above), options.length * 44 + 12);
      const width = Math.min(Math.max(rect.width, 220), window.innerWidth - padding * 2);
      setPosition({ left: Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding)),
        top: below >= height ? rect.bottom + gap : Math.max(padding, rect.top - gap - height),
        width, maxHeight: Math.max(44, height) });
    }
    align();
    window.addEventListener("resize", align);
    window.addEventListener("scroll", align, true);
    return () => { window.removeEventListener("resize", align); window.removeEventListener("scroll", align, true); };
  }, [open, options.length]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  useEffect(() => { if (disabled) close(); }, [disabled]);
  useEffect(() => { if (open) menu.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: "nearest" }); }, [open, active]);

  return <div className="flex min-w-0 flex-col gap-1.5">
    {label && <label htmlFor={selectId} className="text-sm font-medium text-[var(--text)]">{label}</label>}
    <select {...props} ref={native} id={`${selectId}-native`} aria-hidden="true" tabIndex={-1}
      className="sr-only" value={selectedValue} disabled={disabled}
      onChange={event => { setLocalValue(event.target.value); onChange?.(event); }}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    <button ref={trigger} id={selectId} type="button" role="combobox" aria-label={props["aria-label"] ?? label}
      aria-expanded={open} aria-controls={`${selectId}-listbox`} aria-haspopup="listbox"
      aria-activedescendant={open ? `${selectId}-option-${active}` : undefined}
      aria-invalid={!!error} aria-describedby={hint || error ? `${selectId}-hint` : undefined}
      disabled={disabled} style={style}
      className={cn("flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border bg-[var(--surface)] px-3.5 py-2.5 text-start text-sm text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-[var(--danger)]" : "border-[var(--border)] hover:border-[var(--accent)]", className)}
      onClick={() => open ? close() : show()} onBlur={event => { if (!menu.current?.contains(event.relatedTarget as Node)) close(); }}
      onKeyDown={event => {
        if (event.key === "Tab") { close(); return; }
        if (event.key === "Escape") { event.preventDefault(); close(); return; }
        if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) {
          event.preventDefault();
          if (!open) { show(); return; }
          if (event.key === "Enter" || event.key === " ") choose(active);
          else if (event.key === "Home") setActive(Math.max(0, options.findIndex(o => !o.disabled)));
          else if (event.key === "End") setActive(options.findLastIndex(o => !o.disabled));
          else move(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const time = Date.now();
          typed.current = { text: (time - typed.current.at < 700 ? typed.current.text : "") + event.key.toLocaleLowerCase(), at: time };
          const match = options.findIndex(o => !o.disabled && o.label.toLocaleLowerCase().startsWith(typed.current.text));
          if (match >= 0) { if (!open) setOpen(true); setActive(match); }
        }
      }}>
      <span className="min-w-0 break-words">{options[selected]?.label ?? placeholder ?? "Choose an option"}</span>
      <ChevronDown size={16} className={cn("shrink-0 text-[var(--text-tertiary)] transition-transform", open && "rotate-180")} />
    </button>
    {(hint || error) && <p id={`${selectId}-hint`} className={cn("text-xs", error ? "text-[var(--danger)]" : "text-[var(--text-tertiary)]")}>{error ?? hint}</p>}
    {open && createPortal(<div ref={menu} id={`${selectId}-listbox`} role="listbox" aria-label={label ?? props["aria-label"]}
      className="fixed z-[100] overflow-y-auto overscroll-contain rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 text-[var(--text)] shadow-xl"
      style={position} onMouseDown={event => event.preventDefault()}>
      {options.map((option, index) => <div key={option.value} role="option" id={`${selectId}-option-${index}`}
        data-option-index={index} aria-selected={selectedValue === option.value} aria-disabled={option.disabled || undefined}
        onPointerMove={() => !option.disabled && setActive(index)} onClick={() => choose(index)}
        className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
          index === active && "bg-[var(--bg-subtle)]", selectedValue === option.value && "font-semibold text-[var(--accent)]", option.disabled && "cursor-not-allowed opacity-40")}>
        <span className="min-w-0 flex-1 break-words">{option.label}</span>
        {selectedValue === option.value && <Check size={15} className="shrink-0" />}
      </div>)}
    </div>, document.body)}
  </div>;
});
Select.displayName = "WorkflowSelect";
