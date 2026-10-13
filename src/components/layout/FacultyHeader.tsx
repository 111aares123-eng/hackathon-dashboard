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
  Star,
  Sparkles,
} from "lucide-react";

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
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b-2 border-[#171717]">
      {/* Top Academic Department Banner */}
      <div className="bg-[#FFE23B] text-[#171717] border-b-2 border-[#171717] py-1 px-4 overflow-hidden select-none">
        <div className="flex items-center justify-center gap-3 font-heading text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap">
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>RAJALAKSHMI ENGINEERING COLLEGE (AUTONOMOUS)</span>
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>AFFILIATED TO ANNA UNIVERSITY</span>
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>NAAC A++ ACCREDITED</span>
          <Star className="w-3.5 h-3.5 fill-[#171717]" />
          <span>AI &amp; DS GOVERNANCE TOWER</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={isAdmin ? "/admin" : "/admin/events"} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded border-2 border-[#171717] bg-[#F12D2D] text-white flex items-center justify-center shadow-brutal-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal transition-all shrink-0">
            <Sparkles className="w-5 h-5 text-[#FFE23B]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-black uppercase tracking-tight text-[#171717] leading-none">
              REC AI &amp; DS
            </span>
            <span className="font-heading text-[10px] uppercase font-bold text-[#5D3F3C] tracking-wider mt-0.5">
              FACULTY GOVERNANCE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider">
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-full transition-all border-2 ${
                pathname === "/admin"
                  ? "bg-[#1748F5] text-white border-[#171717] shadow-brutal-sm"
                  : "border-transparent text-[#171717] hover:bg-[#E9E2D5]"
              }`}
            >
              Overview &amp; KPIs
            </Link>
          )}

          <Link
            href="/admin/events"
            className={`px-3 py-1.5 rounded-full transition-all border-2 ${
              pathname === "/admin/events" || pathname.startsWith("/admin/events/")
                ? "bg-[#1748F5] text-white border-[#171717] shadow-brutal-sm"
                : "border-transparent text-[#171717] hover:bg-[#E9E2D5]"
            }`}
          >
            Manage Events
          </Link>

          {isAdmin && (
            <Link
              href="/admin/teachers"
              className={`px-3 py-1.5 rounded-full transition-all border-2 ${
                pathname === "/admin/teachers"
                  ? "bg-[#1748F5] text-white border-[#171717] shadow-brutal-sm"
                  : "border-transparent text-[#171717] hover:bg-[#E9E2D5]"
              }`}
            >
              Faculty Approvals
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin/audit-logs"
              className={`px-3 py-1.5 rounded-full transition-all border-2 ${
                pathname === "/admin/audit-logs"
                  ? "bg-[#1748F5] text-white border-[#171717] shadow-brutal-sm"
                  : "border-transparent text-[#171717] hover:bg-[#E9E2D5]"
              }`}
            >
              Audit Logs
            </Link>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F12D2D] text-white font-heading text-xs uppercase font-extrabold rounded border-2 border-[#171717] shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#FFE23B]" />
            <span>POST OPP</span>
          </Link>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white text-[#171717] font-heading text-xs uppercase font-bold rounded border-2 border-[#171717] shadow-brutal-sm hover:bg-[#E9E2D5] transition-all"
          >
            <span>STUDENT HUB</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#1748F5]" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 border-2 border-[#171717] bg-white text-[#171717] flex items-center justify-center rounded shadow-brutal-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#171717] bg-white p-4 space-y-2 shadow-brutal-md">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-[#FFF9E9]"
            >
              Overview &amp; KPIs
            </Link>
          )}
          <Link
            href="/admin/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-white"
          >
            Manage Events
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/teachers"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-white"
              >
                Faculty Approvals
              </Link>
              <Link
                href="/admin/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-white"
              >
                Audit Compliance
              </Link>
            </>
          )}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border-2 border-[#171717] rounded font-heading font-bold uppercase text-xs shadow-brutal-sm bg-[#1748F5] text-white"
          >
            Switch to Student Hub
          </Link>
        </div>
      )}
    </header>
  );
}
