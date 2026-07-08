import { redirect } from "next/navigation";

import { auth } from "@/lib/session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    return redirect("/");
  }

  return (
    <div className="flex h-full items-center justify-center bg-slate-50 p-4">
      {children}
    </div>
  );
}
