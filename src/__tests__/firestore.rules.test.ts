// @vitest-environment node
//
// Firestore security-rules unit tests, run against the local Firestore
// emulator via @firebase/rules-unit-testing. NOT part of the default
// `npm test` run (vitest.config.ts only globs src/__tests__/**/*.test.ts,
// so this file *is* picked up by a bare `vitest run` too — but it will
// immediately fail every test with a connection error if no emulator is
// listening on 127.0.0.1:8080). Run it deliberately with:
//
//   npm run test:rules
//
// which wraps this file in `firebase emulators:exec --only firestore`, so
// the emulator is started, this suite runs against it, and it's torn down
// automatically. Requires firebase-tools (has its own JRE dependency via
// the Firestore emulator jar) — see package.json devDependencies note in
// DATABASE.md if this is the first time it's being installed in CI.
//
// Why this file exists: BUG-011 (rules never deployed), BUG-013 (missing
// composite index), BUG-026 (missing list rule entirely) were all cases
// where the deployed Firestore state silently diverged from — or never
// caught up with — what firestore.rules on disk assumes the app can do.
// This suite exercises every rule branch in firestore.rules directly
// against a real rules evaluator (the emulator), so a regression like
// BUG-026 ("no list rule at all") or a rule that's stricter/looser than
// intended fails a local test run instead of being discovered live.
//
// This suite does NOT test composite indexes (BUG-013's failure mode) —
// the rules-unit-testing emulator does not enforce Firestore's production
// index requirements the same way prod does for compound queries. Index
// coverage still has to be checked by reading firestore.indexes.json
// against the actual query shapes in the calling code (see DATABASE.md).

import { readFileSync } from "fs";
import path from "path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const PROJECT_ID = "demo-imtihan";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(
        path.resolve(__dirname, "../../firestore.rules"),
        "utf8"
      ),
      host: "127.0.0.1",
      port: 8080,
    },
  });
}, 30000);

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ---------------------------------------------------------------------------
// Fixtures — seeded with security rules disabled (admin-equivalent access),
// mirroring what real app usage would have written under normal operation.
// ---------------------------------------------------------------------------

const TEACHER_A = "teacher-a"; // school: Greenwood High
const TEACHER_B = "teacher-b"; // school: Blue Valley
const STUDENT_X = "student-x"; // Greenwood High
const STUDENT_Y = "student-y"; // Blue Valley
const STUDENT_Z = "student-z"; // Northside Academy — used only by the BUG-026 gap test

async function seedFixtures() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();

    await setDoc(doc(db, "users", TEACHER_A), {
      email: "a@greenwood.example",
      role: "teacher",
      school: "Greenwood High",
    });
    await setDoc(doc(db, "users", TEACHER_B), {
      email: "b@bluevalley.example",
      role: "teacher",
      school: "Blue Valley",
    });
    await setDoc(doc(db, "users", STUDENT_X), {
      email: "x@greenwood.example",
      role: "student",
    });
    await setDoc(doc(db, "users", STUDENT_Y), {
      email: "y@bluevalley.example",
      role: "student",
    });

    await setDoc(doc(db, "users", TEACHER_A, "exams", "exam-1"), {
      title: "Midterm",
      createdAt: 1,
    });

    await setDoc(doc(db, "student_profiles", STUDENT_X), {
      schoolName: "Greenwood High",
      createdAt: 1,
    });
    await setDoc(doc(db, "student_profiles", STUDENT_Y), {
      schoolName: "Blue Valley",
      createdAt: 1,
    });

    await setDoc(doc(db, "student_attempts", "attempt-x1"), {
      userId: STUDENT_X,
      subject: "math",
      timestamp: 1,
    });
    await setDoc(doc(db, "student_attempts", "attempt-y1"), {
      userId: STUDENT_Y,
      subject: "physics",
      timestamp: 1,
    });

    await setDoc(doc(db, "schoolBank", "bank-1"), {
      curriculumId: "bac-libanais",
      subject: "math",
      exercise: { chapterIds: ["ch1"] },
    });
  });
}

// ---------------------------------------------------------------------------
// users/{uid} and users/{uid}/exams/{examId}
// ---------------------------------------------------------------------------

describe("users/{uid} — owner self-read/write", () => {
  beforeEach(seedFixtures);

  it("lets a user read their own profile", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(db, "users", TEACHER_A)));
  });

  it("lets a user write their own profile", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      setDoc(doc(db, "users", TEACHER_A), { school: "New School" }, { merge: true })
    );
  });

  it("denies reading another user's profile", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(db, "users", TEACHER_B)));
  });

  it("denies writing another user's profile", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(
      setDoc(doc(db, "users", TEACHER_B), { school: "Hijacked" }, { merge: true })
    );
  });

  it("denies unauthenticated read/write", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users", TEACHER_A)));
    await assertFails(
      setDoc(doc(db, "users", TEACHER_A), { school: "x" }, { merge: true })
    );
  });
});

describe("users/{uid}/exams/{examId} — owner self-read/write", () => {
  beforeEach(seedFixtures);

  it("lets the owner read their own exam", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(db, "users", TEACHER_A, "exams", "exam-1")));
  });

  it("lets the owner write their own exam", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      setDoc(doc(db, "users", TEACHER_A, "exams", "exam-2"), {
        title: "New exam",
        createdAt: 2,
      })
    );
  });

  it("denies another user reading that exam", async () => {
    const db = testEnv.authenticatedContext(TEACHER_B).firestore();
    await assertFails(getDoc(doc(db, "users", TEACHER_A, "exams", "exam-1")));
  });

  it("denies another user writing into that subcollection", async () => {
    const db = testEnv.authenticatedContext(TEACHER_B).firestore();
    await assertFails(
      setDoc(doc(db, "users", TEACHER_A, "exams", "exam-3"), {
        title: "Injected",
        createdAt: 3,
      })
    );
  });
});

// ---------------------------------------------------------------------------
// schoolBank/{exerciseId} — open read, any authenticated write
// ---------------------------------------------------------------------------

describe("schoolBank/{exerciseId} — open read, authenticated write", () => {
  beforeEach(seedFixtures);

  it("lets any authenticated user read any bank entry", async () => {
    const db = testEnv.authenticatedContext(TEACHER_B).firestore();
    await assertSucceeds(getDoc(doc(db, "schoolBank", "bank-1")));
  });

  it("lets any authenticated user write a bank entry, including one they didn't create", async () => {
    const db = testEnv.authenticatedContext(TEACHER_B).firestore();
    await assertSucceeds(
      setDoc(doc(db, "schoolBank", "bank-1"), { subject: "physics" }, { merge: true })
    );
  });

  it("denies unauthenticated read", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "schoolBank", "bank-1")));
  });

  it("denies unauthenticated write", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "schoolBank", "bank-2"), { curriculumId: "x" })
    );
  });
});

// ---------------------------------------------------------------------------
// student_profiles/{uid} — owner self-read/write + school-scoped teacher list
// ---------------------------------------------------------------------------

describe("student_profiles/{uid} — owner self-read/write", () => {
  beforeEach(seedFixtures);

  it("lets a student read their own profile", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertSucceeds(getDoc(doc(db, "student_profiles", STUDENT_X)));
  });

  it("lets a student write their own profile", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertSucceeds(
      setDoc(
        doc(db, "student_profiles", STUDENT_X),
        { schoolName: "Greenwood High" },
        { merge: true }
      )
    );
  });

  it("denies a student direct-getting another student's profile", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertFails(getDoc(doc(db, "student_profiles", STUDENT_Y)));
  });
});

describe("student_profiles/{uid} — school-scoped teacher `list` (BUG-026 fix)", () => {
  beforeEach(seedFixtures);

  it("lets a teacher list student_profiles filtered to their own school", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    const q = query(
      collection(db, "student_profiles"),
      where("schoolName", "==", "Greenwood High")
    );
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual([STUDENT_X]);
  });

  it("denies a teacher listing another school's student_profiles", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    const q = query(
      collection(db, "student_profiles"),
      where("schoolName", "==", "Blue Valley")
    );
    await assertFails(getDocs(q));
  });

  it("denies a non-teacher (role: student) from using the list rule at all", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    const q = query(
      collection(db, "student_profiles"),
      where("schoolName", "==", "Greenwood High")
    );
    await assertFails(getDocs(q));
  });

  it("denies an unfiltered (unconstrained) list query, even for a teacher", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    const q = query(collection(db, "student_profiles"));
    await assertFails(getDocs(q));
  });
});

// ---------------------------------------------------------------------------
// student_attempts/{attemptId} — owner self-read/write + school-scoped
// teacher list via nested get() into student_profiles
// ---------------------------------------------------------------------------

describe("student_attempts/{attemptId} — owner self-read/write", () => {
  beforeEach(seedFixtures);

  it("lets a student read their own attempt", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertSucceeds(getDoc(doc(db, "student_attempts", "attempt-x1")));
  });

  it("lets a student list their own attempts", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", STUDENT_X)
    );
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual(["attempt-x1"]);
  });

  it("lets a student create their own attempt", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertSucceeds(
      setDoc(doc(db, "student_attempts", "attempt-x2"), {
        userId: STUDENT_X,
        subject: "chemistry",
        timestamp: 2,
      })
    );
  });

  it("denies a student creating an attempt under someone else's userId", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertFails(
      setDoc(doc(db, "student_attempts", "attempt-fake"), {
        userId: STUDENT_Y,
        subject: "chemistry",
        timestamp: 2,
      })
    );
  });

  it("denies a student reading another student's attempt directly", async () => {
    const db = testEnv.authenticatedContext(STUDENT_X).firestore();
    await assertFails(getDoc(doc(db, "student_attempts", "attempt-y1")));
  });
});

describe("student_attempts/{attemptId} — school-scoped teacher `list` (BUG-026 fix)", () => {
  beforeEach(seedFixtures);

  it("lets a teacher list attempts for a student whose real school matches theirs", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", STUDENT_X)
    );
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual(["attempt-x1"]);
  });

  it("denies a teacher listing attempts for a student at a different school", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", STUDENT_Y)
    );
    await assertFails(getDocs(q));
  });

  it("lets the matching teacher (Blue Valley) list that same student's attempts", async () => {
    const db = testEnv.authenticatedContext(TEACHER_B).firestore();
    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", STUDENT_Y)
    );
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual(["attempt-y1"]);
  });
});

// ---------------------------------------------------------------------------
// KNOWN ACCEPTED RISK — BUG-026 second review's school-spoofing gap.
//
// See DATABASE.md, "2026-09-18 — BUG-026 second review": users/{uid}.school
// and .role are self-writable free-text fields with zero verification
// anywhere in the stack. Because the teacher `list` rules above scope
// access using `requesterProfile().school` (the caller's own, self-editable
// claim) rather than any verified affiliation, any signed-in account can
// grant itself cross-school access to student PII just by writing a
// matching `school` value to their own users/{uid} doc via the normal,
// legitimate self-write path (the same one that powers the /bank
// "set your school name" flow).
//
// This test intentionally documents that gap with assertSucceeds — NOT
// assertFails — so that if a future fix closes it (e.g. a verified
// custom-claim trust anchor per DATABASE.md's open question to the
// founder), this test starts failing and has to be consciously updated,
// rather than the regression being silently reintroduced. Do not delete
// or flip this test without updating DATABASE.md's decisions log.
// ---------------------------------------------------------------------------

describe("KNOWN ACCEPTED RISK — student_profiles/student_attempts school-spoofing (BUG-026 second review)", () => {
  const ATTACKER = "attacker-1";

  beforeEach(async () => {
    await seedFixtures();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      // A student at "Northside Academy" who is NOT part of the attacker's
      // real school, seeded the same way the app would after normal signup.
      await setDoc(doc(db, "users", STUDENT_Z), {
        email: "z@northside.example",
        role: "student",
      });
      await setDoc(doc(db, "student_profiles", STUDENT_Z), {
        schoolName: "Northside Academy",
        createdAt: 1,
      });
      await setDoc(doc(db, "student_attempts", "attempt-z1"), {
        userId: STUDENT_Z,
        subject: "math",
        timestamp: 1,
      });
      // The attacker's own account, created through the ordinary signup
      // flow: role defaults to non-"student", school is unset.
      await setDoc(doc(db, "users", ATTACKER), {
        email: "attacker@example.com",
        role: "teacher",
      });
    });
  });

  it("lets an attacker self-declare a matching `school` on their own profile via the normal self-write rule", async () => {
    const db = testEnv.authenticatedContext(ATTACKER).firestore();
    // This is not a rules exploit — it's the same unrestricted self-write
    // path the legitimate /bank "set your school name" flow uses.
    await assertSucceeds(
      setDoc(
        doc(db, "users", ATTACKER),
        { school: "Northside Academy" },
        { merge: true }
      )
    );
  });

  it("then lets that attacker list Northside Academy's student roster (names/emails via profile doc)", async () => {
    const db = testEnv.authenticatedContext(ATTACKER).firestore();
    await setDoc(
      doc(db, "users", ATTACKER),
      { school: "Northside Academy" },
      { merge: true }
    );

    const q = query(
      collection(db, "student_profiles"),
      where("schoolName", "==", "Northside Academy")
    );
    // KNOWN GAP: this currently succeeds. See comment block above.
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual([STUDENT_Z]);
  });

  it("then lets that attacker list that student's full attempt history too", async () => {
    const db = testEnv.authenticatedContext(ATTACKER).firestore();
    await setDoc(
      doc(db, "users", ATTACKER),
      { school: "Northside Academy" },
      { merge: true }
    );

    const q = query(
      collection(db, "student_attempts"),
      where("userId", "==", STUDENT_Z)
    );
    // KNOWN GAP: this currently succeeds. See comment block above.
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id)).toEqual(["attempt-z1"]);
  });
});

// ---------------------------------------------------------------------------
// Deny-all fallback
// ---------------------------------------------------------------------------

describe("deny-all fallback for anything not explicitly matched", () => {
  it("denies read on an unmodeled top-level collection, even when authenticated", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(db, "somethingElse", "doc1")));
  });

  it("denies write on an unmodeled top-level collection, even when authenticated", async () => {
    const db = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(setDoc(doc(db, "somethingElse", "doc1"), { x: 1 }));
  });
});
