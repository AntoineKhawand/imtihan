import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import type { Exercise } from "@/types/exam";
vi.mock("@/lib/renderContent", () => ({ renderContent: (text: string) => text }));
vi.mock("@/components/ui/MathPlot", () => ({ MathPlot: () => <div>Plot</div> }));
import { ExerciseCard } from "@/components/ui/ExerciseCard";
let host: HTMLDivElement, root: Root;
const transform = vi.fn().mockResolvedValue(undefined);
const update = vi.fn();
const exercise: Exercise = { id:"e1",number:1,type:"calculation",difficulty:"hard",points:5,
  statement:"Calculate the current.",solution:{finalAnswer:"2",methodology:"Divide."},chapterIds:[],estimatedMinutes:10,mathPlots:["x^2"] };
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  transform.mockClear(); update.mockClear();
  host=document.createElement("div"); document.body.append(host); root=createRoot(host);
  await act(async()=>root.render(<ExerciseCard exercise={exercise} index={0} language="english" onRegenerate={vi.fn()} onRemove={vi.fn()} onTransform={transform} onUpdate={update}/>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
const click=async(selector:string)=>{await act(async()=>host.querySelector<HTMLButtonElement>(selector)!.click());};
const fill=async(label:string,value:string)=>{
  const input=host.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!;
  await act(async()=>{
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,value);
    input.dispatchEvent(new Event("input",{bubbles:true}));
  });
};
it("accepts teacher table dimensions, headers and data", async()=>{
  await click('[aria-label="Format as Table"]');
  const apply=()=>[...host.querySelectorAll("button")].find(b=>b.textContent?.includes("Apply Table"))!;
  expect(apply().disabled).toBe(true);
  await fill("Columns","3"); await fill("Rows (excluding header)","4");
  await fill("Column headers (comma-separated)","Time, Voltage, Current");
  await fill("Data description (what should fill the cells)","Measured values");
  await act(async()=>apply().click());
  expect(transform).toHaveBeenCalledWith("e1","table",expect.stringContaining("3 columns and 4 data rows"));
  expect(transform.mock.calls[0][2]).toContain("Time, Voltage, Current");
  expect(transform.mock.calls[0][2]).toContain("Measured values");
});
it("requests a blank grid explicitly when the graph field is empty",async()=>{
  await click('[aria-label="Add Math Plot (SVG)"]');
  const add=[...host.querySelectorAll("button")].find(b=>b.textContent?.trim()==="Add")!;
  await act(async()=>add.click());
  expect(transform).toHaveBeenCalledWith("e1","plot","blank grid for students");
});
it("clears visuals through the parent update callback",async()=>{
  await click('[aria-label="Clear all visuals (Plots, Diagrams, Images)"]');
  expect(update).toHaveBeenCalledWith(expect.objectContaining({id:"e1",mathPlots:[]}));
});
