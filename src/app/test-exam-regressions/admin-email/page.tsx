import { notFound } from "next/navigation";
import { AdminEmailFixture } from "./fixture";

export default function AdminEmailTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <AdminEmailFixture />;
}
