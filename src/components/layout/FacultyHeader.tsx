"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  PlusCircle,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Users,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeNavBar } from "@/components/ui/anime-navbar";

interface FacultyHeaderProps {
  userRole?: string;
  userName?: string;
}

export function FacultyHeader({ userRole = "TEACHER", userName }: FacultyHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = userRole === "ADMIN";

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-[#DAD7CD] bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(32,40,32,0.03)]">
      {/* Top Academic Department Banner */}
      <div className="bg-[#344E41] text-[#F5F3EB] px-4 py-2 text-xs font-medium tracking-wide border-b border-[#A3B18A]/25">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-[#C5D86D]" />
            <span className="font-bold tracking-wider text-[#F5F3EB]">
              RAJALAKSHMI ENGINEERING COLLEGE
            </span>
            <span className="hidden lg:inline text-[#DAD7CD] text-[11px]">
              — AFFILIATED TO ANNA UNIVERSITY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#C5D86D] font-mono text-[11px] tracking-wide">
              DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href={isAdmin ? "/admin" : "/admin/events"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#344E41] text-[#C5D86D] flex items-center justify-center font-bold text-xs shadow-xs border border-[#344E41]/30 shrink-0">
              REC
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#202820] tracking-tight leading-tight">
                AI &amp; DS Faculty Portal
              </span>
              <span className="text-[11px] text-[#586B5A] font-medium">
                {isAdmin ? "Department Governance & Administration" : "Opportunity Publishing"}
              </span>
            </div>
          </Link>

          {/* Desktop AnimeNavBar Navigation */}
          <div className="hidden md:flex items-center pl-3 border-l border-[#DAD7CD]">
            <AnimeNavBar
              items={[
                ...(isAdmin
                  ? [
                      {
                        name: "Overview",
                        url: "/admin",
                        icon: LayoutDashboard,
                        matchType: "exact" as const,
                      },
                    ]
                  : []),
                {
                  name: isAdmin ? "All Events" : "My Events",
                  url: "/admin/events",
                  icon: Calendar,
                  matchType: "startsWith" as const,
                },
                ...(isAdmin
                  ? [
                      {
                        name: "Faculty Approvals",
                        url: "/admin/teachers",
                        icon: Users,
                        matchType: "startsWith" as const,
                      },
                      {
                        name: "Audit Logs",
                        url: "/admin/audit-logs",
                        icon: FileText,
                        matchType: "startsWith" as const,
                      },
                    ]
                  : []),
              ]}
              layoutIdPrefix="faculty-nav"
              ariaLabel="Faculty governance navigation"
              showMascot={true}
            />
          </div>
        </div>

        {/* Right Actions & User Pill */}
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs font-semibold gap-1.5 h-8 border-[#DAD7CD] text-[#344E41] hover:bg-[#F5F3EB]">
              <ExternalLink className="w-3.5 h-3.5 text-[#586B5A]" />
              Student Catalog
            </Button>
          </Link>
          <Link href="/admin/events/new">
            <Button size="sm" className="bg-[#344E41] hover:bg-[#25382F] text-white text-xs font-semibold gap-1.5 h-8 shadow-xs">
              <PlusCircle className="w-3.5 h-3.5 text-[#C5D86D]" />
              <span>Create Event</span>
            </Button>
          </Link>

          {userName && (
            <div className="hidden lg:flex flex-col text-right pl-2.5 border-l border-[#DAD7CD]">
              <span className="text-xs font-bold text-[#202820] leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-[#586B5A] flex items-center justify-end gap-1">
                {isAdmin ? (
                  <span className="text-[#344E41] bg-[#C5D86D]/30 px-1.5 py-0.2 rounded border border-[#C5D86D]/60 flex items-center gap-0.5 font-bold">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#344E41]" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[#2B4035] bg-[#A3B18A]/25 px-1.5 py-0.2 rounded border border-[#A3B18A]/45 font-bold">
                    Faculty
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-1.5 rounded-lg text-[#586B5A] hover:bg-[#F5F3EB] border border-[#DAD7CD]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DAD7CD] bg-white px-4 py-3 space-y-2 shadow-lg">
          <nav className="space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  isActive("/admin") ? "bg-[#344E41] text-white" : "text-[#586B5A] hover:bg-[#F5F3EB] hover:text-[#202820]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </Link>
            )}
            <Link
              href="/admin/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                isActive("/admin/events") ? "bg-[#344E41] text-white" : "text-[#586B5A] hover:bg-[#F5F3EB] hover:text-[#202820]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {isAdmin ? "All Events" : "My Events"}
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/teachers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/admin/teachers") ? "bg-[#344E41] text-white" : "text-[#586B5A] hover:bg-[#F5F3EB] hover:text-[#202820]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Faculty Approvals
                </Link>
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/admin/audit-logs") ? "bg-[#344E41] text-white" : "text-[#586B5A] hover:bg-[#F5F3EB] hover:text-[#202820]"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Audit Logs
                </Link>
              </>
            )}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#586B5A] hover:bg-[#F5F3EB] hover:text-[#202820] pt-2 border-t border-[#DAD7CD]"
            >
              <ExternalLink className="w-4 h-4 text-[#586B5A]" />
              Switch to Student Catalog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
