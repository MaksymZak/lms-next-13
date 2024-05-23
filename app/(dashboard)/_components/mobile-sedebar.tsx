"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

const MobileSidebar = () => {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  return (
    <Sheet open={isOpen}>
      <SheetTrigger
        onClick={() => setIsOpen((prev) => !prev)}
        className="pr-4 transition hover:opacity-75 md:hidden"
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        onEscapeKeyDown={() => setIsOpen(false)}
        side="left"
        onClose={() => setIsOpen(false)}
        className="bg-white p-0"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
