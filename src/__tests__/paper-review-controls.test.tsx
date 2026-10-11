import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { PaperCompositionReview } from "@/components/ui/PaperCompositionReview";
import { UploadIntentPicker } from "@/components/ui/UploadIntentPicker";
import { PAPER_PROFILES } from "@/data/paperProfiles";
import type { ExamContext } from "@/types/exam";
import type { UploadIntent } from "@/lib/schemas/sourceDocument";

let host: HTMLDivElement, root: Root, current: ExamContext, intent: UploadIntent;
function Harness() {
  const [context, setContext] = useState<ExamContext>({ curriculumId: "bac-libanais", levelId: "terminale-s", subject: "mathematics", chapterIds: ["ter-math-complex"], language: "french", examType: "practice", duration: 120, exerciseCount: 4, totalPoints: 20, difficultyMix: { easy: 0, medium: 0, hard: 1 } });
  const [upload, setUpload] = useState<UploadIntent>({ purposes: ["content"], instructions: "" });
  current = context; intent = upload;
  return <><UploadIntentPicker value={upload} onChange={setUpload} /><PaperCompositionReview context={context} onChange={setContext} /></>;
}
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function select(value: string) {
  const element = host.querySelector("select")!;
  await act(async () => { element.value = value; element.dispatchEvent(new Event("change", { bubbles: true })); });
}
it("applies reference choices, updates totals and preserves an explicit classroom selection", async () => {
  await act(async () => root.render(<Harness />));
  await select(PAPER_PROFILES[0].id);
  expect(current).toMatchObject({ exerciseCount: 7, totalPoints: 20, duration: 180 });
  expect(host.textContent).toContain("maximum candidate mark 20");
  expect(host.querySelectorAll("fieldset fieldset")).toHaveLength(0);
  await select("classroom");
  expect(current.paperComposition).toBeUndefined();
  expect(current.paperCompositionReviewed).toBe(true);
  await select("custom");
  expect(current.paperComposition?.origin).toBe("custom");
  expect(current.paperComposition?.sections[0].answerCount).toBe(7);
});
it("lets teachers combine purposes and warns when none remain", async () => {
  await act(async () => root.render(<Harness />));
  const checkboxes = host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  await act(async () => checkboxes[2].click());
  expect(intent.purposes).toEqual(["content", "structure"]);
  await act(async () => checkboxes[0].click());
  await act(async () => checkboxes[2].click());
  expect(intent.purposes).toEqual([]);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("Select at least one use");
});
