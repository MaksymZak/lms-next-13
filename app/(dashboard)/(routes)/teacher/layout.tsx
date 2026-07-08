import { redirect } from "next/navigation";

import { auth } from "@/lib/session";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  return <>{children}</>;
};

export default TeacherLayout;
