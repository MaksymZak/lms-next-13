"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

import { SearchInput } from "./search-input";

export const NavbarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isCoursePage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="ml-auto flex items-center gap-x-2">
        {isTeacherPage || isCoursePage ? (
          <Link href="/">
            <Button size="sm" variant="secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </Link>
        ) : (
          <Link href="/teacher/courses">
            <Button size="sm" variant="default">
              Teacher mode
            </Button>
          </Link>
        )}
        <UserMenu />
      </div>
    </>
  );
};
