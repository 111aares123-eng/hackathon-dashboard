import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth/server";
import { isApprovedTeacher } from "@/lib/auth/guards";
import { EventForm } from "@/components/events/EventForm";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NewEventPage() {
  const auth = await getServerAuthSession();

  if (!auth || !isApprovedTeacher(auth.user)) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Faculty Authorization Required
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Only authorized faculty members can create and draft departmental opportunities.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Return to Student Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-1">
        <Link
          href="/admin/events"
          className="text-xs font-semibold text-slate-500 hover:text-[#003366] inline-flex items-center gap-1 mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Events Management
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Publish New Department Opportunity
        </h1>
        <p className="text-xs text-slate-500">
          Draft an upcoming hackathon, workshop, seminar, internship or competition for REC AI &amp; DS students.
        </p>
      </div>

      <EventForm isEditing={false} />
    </div>
  );
}
