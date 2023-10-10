"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const NavbarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.startsWith("/chapter");

  return (
    <div className="ml-auto flex items-center gap-x-2">
      {isTeacherPage || isPlayerPage ? (
        <Link href={"/"}>
          <Button className="gap-x-1" size={"sm"} variant={"ghost"}>
            <LogOut /> Exit
          </Button>
        </Link>
      ) : (
        <Link href={"/teacher/courses"}>
          <Button size={"sm"} variant={"ghost"}>
            Teacher mode
          </Button>
        </Link>
      )}

      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default NavbarRoutes;
