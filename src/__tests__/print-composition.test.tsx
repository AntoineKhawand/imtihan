import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const navigation = vi.hoisted(() => ({ router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation.router }));
vi.mock("@/lib/storage",()=>({getSchoolSettings:()=>({schoolName:"Old school"})}));
vi.mock("@/lib/renderContent",()=>({renderContent:(s:string)=>s}));
vi.mock("@/components/ui/MathPlot",()=>({MathPlot:()=>null}));
import PrintPage from "@/app/print/page";
import { PAPER_PROFILES } from "@/data/paperProfiles";
import { paperTotals } from "@/lib/paperComposition";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);vi.useFakeTimers();vi.spyOn(window,"print").mockImplementation(()=>{});
  sessionStorage.clear();
  sessionStorage.setItem("imtihan_context",JSON.stringify({subject:"mathematics",levelId:"Grade 12",language:"english",duration:60,totalPoints:20}));
  sessionStorage.setItem("imtihan_exercises",JSON.stringify([{id:"1",number:1,type:"multiple_choice",points:20,statement:"Student question",options:[{label:"A",text:"First option",isCorrect:true},{label:"B",text:"Second option",isCorrect:false}],solution:{finalAnswer:"SECRET ANSWER",methodology:"SECRET METHOD"}}]));
  host=document.createElement("div");document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
it("uses current header, prints MCQ options and hides solutions for Exam only",async()=>{
  sessionStorage.setItem("imtihan_print_settings",JSON.stringify({includeAnswerKey:false,header:{schoolName:"Current school",className:"Class 12B",date:"2026-10-11"}}));
  await act(async()=>root.render(<PrintPage/>));
  expect(host.textContent).toContain("Current school");expect(host.textContent).toContain("Class 12B");expect(host.textContent).toContain("2026-10-11");
  expect(host.textContent).toContain("Mathematics");expect(host.textContent).toContain("First option");expect(host.textContent).toContain("Second option");
  expect(host.textContent).not.toContain("SECRET ANSWER");expect(host.textContent).not.toContain("SECRET METHOD");
  await act(async()=>vi.advanceTimersByTime(1000));expect(window.print).toHaveBeenCalledOnce();
});
it("puts the requested answer key in its own section",async()=>{
  sessionStorage.setItem("imtihan_print_settings",JSON.stringify({includeAnswerKey:true,header:{}}));
  await act(async()=>root.render(<PrintPage/>));
  expect(host.querySelector(".page-break")?.textContent).toContain("ANSWER KEY");expect(host.textContent).toContain("SECRET ANSWER");
});
it("prints offered alternatives with the candidate maximum and reviewed section instructions", async () => {
  const paper = PAPER_PROFILES[0].composition;
  sessionStorage.setItem("imtihan_context", JSON.stringify({ curriculumId: "bac-libanais", subject: "mathematics", levelId: "terminale-s", language: "french", duration: 180, ...paperTotals(paper), paperComposition: paper }));
  sessionStorage.setItem("imtihan_exercises", JSON.stringify(Array.from({ length: 7 }, (_, i) => ({ id: String(i), number: i + 1, type: "proof", points: 4, statement: "Question", solution: { finalAnswer: "Answer", methodology: "Method" } }))));
  sessionStorage.setItem("imtihan_print_settings", JSON.stringify({ includeAnswerKey: false }));
  await act(async () => root.render(<PrintPage />));
  expect(host.textContent).toContain("Traiter 5 exercice(s) sur 7");
  expect(host.textContent).toContain("Calculatrice non programmable");
  expect(host.querySelector(".score-table")?.textContent).toContain("20");
  expect(host.querySelectorAll(".exam-exercise")).toHaveLength(7);
  expect(host.querySelector("style")?.textContent).toContain("counter(pages)");
});
it("does not open print for an incomplete structured paper", async () => {
  const paper = PAPER_PROFILES[0].composition;
  sessionStorage.setItem("imtihan_context", JSON.stringify({ subject: "mathematics", language: "french", duration: 180, ...paperTotals(paper), paperComposition: paper }));
  await act(async () => root.render(<PrintPage />));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("requires 7 questions");
  await act(async () => vi.advanceTimersByTime(1000));
  expect(window.print).not.toHaveBeenCalled();
});
