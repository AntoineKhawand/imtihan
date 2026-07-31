"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /create/structure was merged into /create/confirm.
 * Redirect seamlessly so any bookmarked or linked URL still works.
 */
export default function StructureRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/create/confirm");
  }, [router]);
  return null;
}
