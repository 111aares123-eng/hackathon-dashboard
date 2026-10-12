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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top Academic Department Banner */}
      <div className="bg-[#002244] text-white px-4 py-2 text-xs font-medium tracking-wide border-b border-[#C5A059]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="font-bold tracking-wider">
              RAJALAKSHMI ENGINEERING COLLEGE
            </span>
            <span className="hidden lg:inline text-slate-300 text-[11px]">
              — AFFILIATED TO ANNA UNIVERSITY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#C5A059]">
              DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href={isAdmin ? "/admin" : "/admin/events"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#002244] text-[#C5A059] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              REC
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                AI &amp; DS Faculty Portal
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {isAdmin ? "Department Governance & Administration" : "Opportunity Publishing"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Active Highlighting */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive("/admin")
                    ? "bg-[#003366] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </Link>
            )}

            <Link
              href="/admin/events"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive("/admin/events")
                  ? "bg-[#003366] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {isAdmin ? "All Events" : "My Events"}
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/teachers"
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive("/admin/teachers")
                      ? "bg-[#003366] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Faculty Approvals
                </Link>

                <Link
                  href="/admin/audit-logs"
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive("/admin/audit-logs")
                      ? "bg-[#003366] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Audit Logs
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Actions & User Pill */}
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs font-semibold gap-1.5 h-8 border-slate-300 text-slate-700">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              Student Catalog
            </Button>
          </Link>
          <Link href="/admin/events/new">
            <Button size="sm" className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 h-8 shadow-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Button>
          </Link>

          {userName && (
            <div className="hidden lg:flex flex-col text-right pl-2.5 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-end gap-1">
                {isAdmin ? (
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-600" />
                    Admin
                  </span>
                ) : (
                  <span className="text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
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
            className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          <nav className="space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  isActive("/admin") ? "bg-[#003366] text-white" : "text-slate-700 hover:bg-slate-100"
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
                isActive("/admin/events") ? "bg-[#003366] text-white" : "text-slate-700 hover:bg-slate-100"
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
                    isActive("/admin/teachers") ? "bg-[#003366] text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Faculty Approvals
                </Link>
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/admin/audit-logs") ? "bg-[#003366] text-white" : "text-slate-700 hover:bg-slate-100"
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
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 pt-2 border-t border-slate-100"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Switch to Student Catalog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
