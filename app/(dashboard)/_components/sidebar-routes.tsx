"use client";

import { Layout, Compass } from "lucide-react";
import SidebarItem from "./sidebar-item";

const guestRoutes = [
  { icon: Layout, label: "Dashboard", href: "/" },
  { icon: Compass, label: "Browse", href: "/search" },
];

const SidebarRoutes = () => {
  const routes = guestRoutes;
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
