import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
const authCalls = vi.hoisted(() => ({ create: vi.fn(), popup: vi.fn() }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: authCalls.create,
  signInWithPopup: authCalls.popup,
  GoogleAuthProvider: vi.fn(),
  updateProfile: vi.fn(),
  getAdditionalUserInfo: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));
vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }));
vi.mock("@fingerprintjs/fingerprintjs", () => ({ default: { load: vi.fn() } }));
vi.mock("@/components/ui/Logo", () => ({ Logo: () => <span>Imtihan</span> }));
import RegisterPage from "@/app/auth/register/page";
let root: Root | undefined;
let container: HTMLDivElement | undefined;
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  vi.clearAllMocks();
});
describe("signup eligibility before authentication", () => {
  it("blocks both signup methods until the unchecked adult confirmation is selected", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root?.render(<RegisterPage />));
    const checkbox = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    const google = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Continue with Google"),
    )!;
    const create = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Create account"),
    )!;
    expect(checkbox.checked).toBe(false);
    expect(google.disabled).toBe(true);
    expect(create.disabled).toBe(true);
    await act(async () => google.click());
    expect(authCalls.popup).not.toHaveBeenCalled();
    expect(authCalls.create).not.toHaveBeenCalled();
    await act(async () => checkbox.click());
    expect(google.disabled).toBe(false);
    expect(create.disabled).toBe(true); // Email/password are still required.
    await act(async () => checkbox.click());
    expect(google.disabled).toBe(true);
  });
});
