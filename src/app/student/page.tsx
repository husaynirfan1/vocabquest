import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export default async function StudentPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/teacher");
  }

  return <StudentDashboard user={session.user} />;
}
