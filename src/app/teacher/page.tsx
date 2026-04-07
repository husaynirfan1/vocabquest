import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

export default async function TeacherPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher") {
    redirect("/student");
  }

  return <TeacherDashboard user={session.user} />;
}
