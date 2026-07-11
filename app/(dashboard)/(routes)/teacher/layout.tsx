import { redirect } from "next/navigation";

import { currentUser } from "@/lib/session";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Раздел преподавателя доступен только роли teacher
  if (user.role !== "teacher") {
    return redirect("/");
  }

  return <>{children}</>;
};

export default TeacherLayout;
