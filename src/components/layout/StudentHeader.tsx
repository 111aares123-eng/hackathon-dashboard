"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { User } from "@/db/schema";
import { motion } from "framer-motion";
import { AestheticCrtMascot } from "@/components/ui/crt-mascot";

interface StudentHeaderProps {
  user?: Omit<User, "passwordHash"> | null;
}

export function StudentHeader({ user }: StudentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

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
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b-2 border-[#171717] pt-12 sm:pt-14 pb-3.5 sm:pb-4 px-4 sm:px-6 lg:px-8 overflow-visible">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-visible">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded border-2 border-[#171717] bg-[#F12D2D] text-white flex items-center justify-center shadow-brutal-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal transition-all shrink-0">
            <Sparkles className="w-5 h-5 text-[#FFE23B]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-black uppercase tracking-tight text-[#171717] leading-none">
              REC AI & DS
            </span>
            <span className="font-heading text-[10px] uppercase font-bold text-[#5D3F3C] tracking-wider mt-0.5">
              OPPORTUNITY MATRIX
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Spaced Pills */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 font-heading text-xs font-bold uppercase tracking-wider overflow-visible">
          {[
            { href: "/", label: "Discover Hub" },
            { href: "/events", label: "Hackathons & Events" },
            { href: "/saved", label: "Saved Vault" },
            ...(isTeacherOrAdmin ? [{ href: "/admin", label: "Faculty Governance" }] : []),
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <div
                key={item.href}
                className="relative flex items-center overflow-visible"
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {active && (
                  <motion.div
                    layoutId="header-crt-companion"
                    className="absolute -top-10 right-1 pointer-events-none z-30"
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                  >
                    <AestheticCrtMascot isHovered={hoveredNav !== null} />
                  </motion.div>
                )}
                <Link
                  href={item.href}
                  className={`px-4 sm:px-5 py-2 rounded-full transition-all border-2 select-none ${
                    active
                      ? "bg-[#1748F5] text-white border-[#171717] shadow-brutal-sm"
                      : "border-transparent text-[#171717] hover:bg-[#E9E2D5]"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right CTA Area */}
        <div className="flex items-center gap-2">
          {/* Post Opportunity Button for Faculty */}
          {isTeacherOrAdmin && (
            <Link
              href="/admin/events/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#171717] bg-[#F12D2D] text-white font-heading text-xs font-bold uppercase tracking-wider rounded shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#FFE23B]" />
              <span>POST OPP</span>
            </Link>
          )}

          {/* User Status / Auth Actions */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-heading text-xs font-bold text-[#171717] truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-[#F12D2D] uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-9 h-9 border-2 border-[#171717] bg-white text-[#171717] flex items-center justify-center rounded shadow-brutal-sm hover:bg-[#E9E2D5] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-[#F12D2D]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 border-2 border-[#171717] bg-white text-[#171717] font-heading text-xs font-bold uppercase tracking-wider rounded shadow-brutal-sm hover:bg-[#E9E2D5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-3 py-1.5 border-2 border-[#171717] bg-[#FFE23B] text-[#171717] font-heading text-xs font-bold uppercase tracking-wider rounded shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 border-2 border-[#171717] bg-white text-[#171717] flex items-center justify-center rounded shadow-brutal-sm cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#171717] bg-white p-4 space-y-2 shadow-brutal-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm ${
              isActive("/") ? "bg-[#1748F5] text-white" : "bg-[#FFF9E9] text-[#171717]"
            }`}
          >
            Discover Hub
          </Link>
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm ${
              isActive("/events") ? "bg-[#1748F5] text-white" : "bg-white text-[#171717]"
            }`}
          >
            Hackathons &amp; Events
          </Link>
          <Link
            href="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm ${
              isActive("/saved") ? "bg-[#1748F5] text-white" : "bg-white text-[#171717]"
            }`}
          >
            Saved Vault
          </Link>
          {isTeacherOrAdmin && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm ${
                  isActive("/admin") ? "bg-[#1748F5] text-white" : "bg-white text-[#171717]"
                }`}
              >
                Faculty Governance
              </Link>
              <Link
                href="/admin/events/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-[#F12D2D] text-white"
              >
                Post New Opportunity
              </Link>
            </>
          )}

          {/* User Profile Info & Logout in Mobile Drawer */}
          {user ? (
            <div className="pt-3 mt-3 border-t-2 border-[#171717] flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <p className="font-heading font-extrabold text-xs text-[#171717] truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-[#F12D2D] uppercase">{user.role} • {user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3 py-1.5 border-2 border-[#171717] bg-white text-[#F12D2D] font-heading text-xs font-bold uppercase rounded shadow-brutal-sm hover:bg-[#FFE23B] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-3 border-t-2 border-[#171717] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-[#FFE23B]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
