import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const navigation = vi.hoisted(() => ({ router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation.router }));
vi.mock("@/lib/storage",()=>({getSchoolSettings:()=>({schoolName:"Old school"})}));
vi.mock("@/lib/renderContent",()=>({renderContent:(s:string)=>s}));
vi.mock("@/components/ui/MathPlot",()=>({MathPlot:()=>null}));
import PrintPage from "@/app/print/page";
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
