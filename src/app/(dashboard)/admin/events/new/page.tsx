import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { isApprovedTeacher } from "@/lib/auth/guards";
import { EventForm } from "@/components/events/EventForm";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default async function NewEventPage() {
  const auth = await getServerAuthSession();

  if (!auth || !isApprovedTeacher(auth.user)) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded border-2 border-[#171717] p-8 text-center shadow-brutal-xl space-y-4">
        <div className="w-14 h-14 rounded bg-[#FFDAD6] border-2 border-[#171717] flex items-center justify-center mx-auto text-[#F12D2D] shadow-brutal-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl uppercase font-black text-[#171717]">
          Faculty Authorization Required
        </h2>
        <p className="font-body text-xs text-[#5D3F3C] leading-relaxed">
          Only authorized faculty members can create and draft departmental opportunities.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-heading text-xs uppercase font-bold rounded shadow-brutal hover:bg-[#E9E2D5]"
          >
            Return to Student Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <EventForm isEditing={false} />
    </div>
  );
}
