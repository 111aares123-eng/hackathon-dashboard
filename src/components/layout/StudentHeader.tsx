"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Bookmark,
  Calendar,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { AnimeNavBar } from "@/components/ui/anime-navbar";
import type { User } from "@/db/schema";

interface StudentHeaderProps {
  user?: Omit<User, "passwordHash"> | null;
}

export function StudentHeader({ user }: StudentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.refresh();
    router.push("/");
    setIsLoggingOut(false);
  };

  const isTeacherOrAdmin = user?.role === "TEACHER" || user?.role === "ADMIN";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-[#DAD7CD] bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(32,40,32,0.03)]">
      {/* Top Academic Department Ribbon */}
      <div className="bg-[#344E41] text-[#F5F3EB] px-4 py-2 text-xs font-medium tracking-wide border-b border-[#A3B18A]/25">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-[#F5F3EB]">
              RAJALAKSHMI ENGINEERING COLLEGE
            </span>
            <span className="hidden md:inline text-[#DAD7CD] text-[11px]">
              (Autonomous) • Affiliated to Anna University
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#C5D86D] flex items-center gap-1 font-mono text-[11px] tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C5D86D]" />
              DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand with Academic Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#344E41] text-[#C5D86D] flex items-center justify-center shadow-xs border border-[#344E41]/30 group-hover:bg-[#25382F] transition-colors shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#202820] tracking-tight leading-tight group-hover:text-[#344E41] transition-colors">
              REC AI &amp; DS Opportunities
            </span>
            <span className="text-[11px] text-[#586B5A] font-medium">
              Hackathons • Workshops • Seminars • Competitions
            </span>
          </div>
        </Link>

        {/* Desktop AnimeNavBar Navigation */}
        <div className="hidden md:flex items-center pl-4">
          <AnimeNavBar
            items={[
              {
                name: "Discover",
                url: "/",
                icon: Compass,
                matchType: "exact",
              },
              {
                name: "Saved Opportunities",
                url: "/saved",
                icon: Bookmark,
                matchType: "exact",
              },
              ...(isTeacherOrAdmin
                ? [
                    {
                      name: "Faculty Portal",
                      url: "/admin/events",
                      icon: Calendar,
                      matchType: "startsWith" as const,
                    },
                  ]
                : []),
            ]}
            layoutIdPrefix="student-nav"
            ariaLabel="Student portal navigation"
            showMascot={true}
          />
        </div>

        {/* Desktop User / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-[#DAD7CD]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#202820] leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#586B5A] font-semibold flex items-center justify-end gap-1 mt-0.5">
                  {user.role === "ADMIN" ? (
                    <span className="text-[#344E41] bg-[#C5D86D]/30 px-1.5 py-0.2 rounded border border-[#C5D86D]/60 flex items-center gap-0.5 font-bold">
                      <ShieldCheck className="w-2.5 h-2.5 text-[#344E41]" />
                      ADMIN
                    </span>
                  ) : user.role === "TEACHER" ? (
                    <span className="text-[#2B4035] bg-[#A3B18A]/25 px-1.5 py-0.2 rounded border border-[#A3B18A]/45 font-bold">
                      FACULTY
                    </span>
                  ) : (
                    <span className="text-[#586B5A] bg-[#F5F3EB] px-1.5 py-0.2 rounded border border-[#DAD7CD] font-semibold">
                      STUDENT
                    </span>
                  )}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs gap-1.5 h-8 text-[#586B5A] hover:text-rose-700 hover:bg-rose-50 border-[#DAD7CD]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-semibold text-[#344E41] hover:text-[#202820] border-[#DAD7CD] hover:bg-[#F5F3EB]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[#344E41] hover:bg-[#25382F] text-white text-xs font-semibold gap-1.5 h-8 shadow-xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Student Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-lg text-[#202820] hover:bg-[#F5F3EB] border border-[#DAD7CD]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DAD7CD] bg-white px-4 py-3.5 space-y-3 shadow-lg">
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                isActive("/")
                  ? "bg-[#344E41]/10 text-[#344E41]"
                  : "text-[#586B5A] hover:bg-[#F5F3EB]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#586B5A]" />
              Discover Opportunities
            </Link>
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                isActive("/saved")
                  ? "bg-[#344E41]/10 text-[#344E41]"
                  : "text-[#586B5A] hover:bg-[#F5F3EB]"
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#344E41]" />
              Saved Opportunities
            </Link>
            {isTeacherOrAdmin && (
              <Link
                href="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#344E41] bg-[#F5F3EB] border border-[#DAD7CD]"
              >
                <Calendar className="w-4 h-4 text-[#344E41]" />
                Faculty Portal
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-[#DAD7CD]">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#202820] block">{user.name}</span>
                  <span className="text-[10px] text-[#586B5A] font-semibold">{user.role}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-[#DAD7CD]">
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-[#344E41] text-white text-xs font-semibold">
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
