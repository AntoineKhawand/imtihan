import { notFound } from "next/navigation";
import { ExamRegressionFixture } from "./fixture";

export default function ExamRegressionPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ExamRegressionFixture />;
}
