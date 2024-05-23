"use client";

import { Layout, Compass, List, BarChart2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import SidebarItem from "./sidebar-item";
import { useEffect } from "react";

const guestRoutes = [
  { icon: Compass, label: "Browse", href: "/" },
  { icon: Layout, label: " Dashboard", href: "/dashboard" },
];

const teacherRoutes = [
  { icon: List, label: "Courses", href: "/teacher/courses" },
  { icon: BarChart2, label: "Analytics", href: "/teacher/analytics" },
];

const SidebarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  useEffect(() => {
    [...guestRoutes, ...teacherRoutes].forEach(({ href }) => {
      router.prefetch(href);
    });
  }, [router]);

  return (
    <div className="flex w-full flex-col">
      {routes.map((item) => (
        <SidebarItem
          href={item.href}
          icon={item.icon}
          label={item.label}
          key={item.href}
        />
      ))}
    </div>
  );
};

export default SidebarRoutes;
