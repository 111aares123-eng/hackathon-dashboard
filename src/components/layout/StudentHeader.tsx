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
    <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Academic Department Ribbon */}
      <div className="bg-[#002244] text-white px-4 py-2 text-xs font-medium tracking-wide border-b border-[#C5A059]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-slate-100">
              RAJALAKSHMI ENGINEERING COLLEGE
            </span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              (Autonomous) • Affiliated to Anna University
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#C5A059] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand with Academic Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#002244] text-[#C5A059] flex items-center justify-center shadow-sm group-hover:bg-[#003366] transition-colors shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#003366] transition-colors">
              REC AI & DS Opportunities
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Hackathons • Workshops • Seminars • Competitions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 pl-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/")
                ? "bg-[#003366]/10 text-[#003366] border border-[#003366]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Compass className={`w-4 h-4 ${isActive("/") ? "text-[#003366]" : "text-slate-400"}`} />
            Discover
          </Link>
          <Link
            href="/saved"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/saved")
                ? "bg-[#003366]/10 text-[#003366] border border-[#003366]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isActive("/saved") ? "text-[#C5A059] fill-[#C5A059]" : "text-slate-400"
              }`}
            />
            Saved Opportunities
          </Link>
          {isTeacherOrAdmin && (
            <Link
              href="/admin/events"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive("/admin")
                  ? "bg-[#002244] text-white"
                  : "text-[#002244] bg-[#FAF6ED] hover:bg-[#F3EAD5] border border-[#C5A059]/40"
              }`}
            >
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              Faculty Portal
            </Link>
          )}
        </nav>

        {/* Desktop User / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-end gap-1 mt-0.5">
                  {user.role === "ADMIN" ? (
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-amber-600" />
                      ADMIN
                    </span>
                  ) : user.role === "TEACHER" ? (
                    <span className="text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                      FACULTY
                    </span>
                  ) : (
                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
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
                className="text-xs gap-1.5 h-8 text-slate-700 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
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
                  className="text-xs gap-1.5 h-8 font-semibold text-slate-700 hover:text-slate-900 border-slate-300"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 h-8 shadow-sm transition-all"
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
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3.5 space-y-3 shadow-lg">
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                isActive("/")
                  ? "bg-[#003366]/10 text-[#003366]"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Compass className="w-4 h-4 text-slate-400" />
              Discover Opportunities
            </Link>
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                isActive("/saved")
                  ? "bg-[#003366]/10 text-[#003366]"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#C5A059]" />
              Saved Opportunities
            </Link>
            {isTeacherOrAdmin && (
              <Link
                href="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#002244] bg-[#FAF6ED] border border-[#C5A059]/40"
              >
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                Faculty Portal
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{user.role}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-[#003366] text-white text-xs font-semibold">
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
