"use client";

import { Layout, Compass, List, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";

import SidebarItem from "./sidebar-item";

const guestRoutes = [
  { icon: Layout, label: "Dashboard", href: "/" },
  { icon: Compass, label: "Browse", href: "/search" },
];

const teacherRoutes = [
  { icon: List, label: "Courses", href: "/teacher/courses" },
  { icon: BarChart2, label: "Analytics", href: "/teacher/analytics" },
];

const SidebarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;
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
