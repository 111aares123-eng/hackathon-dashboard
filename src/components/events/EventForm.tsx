"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  eventFormSchema,
  eventCategories,
  eventModes,
} from "@/validators/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2, Sparkles, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/db/schema";
import { createEventAction, updateEventAction } from "@/lib/events/actions";

interface EventFormProps {
  initialEvent?: Event;
  isEditing?: boolean;
}

export function EventForm({ initialEvent, isEditing = false }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper to format Date objects into datetime-local input string (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (date?: Date | string | null): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: initialEvent?.title || "",
    category: initialEvent?.category || "HACKATHON",
    mode: initialEvent?.mode || "OFFLINE",
    organizer: initialEvent?.organizer || "Department of AI & DS, REC",
    summary: initialEvent?.summary || "",
    description: initialEvent?.description || "",
    venue: initialEvent?.venue || "",
    registrationUrl: initialEvent?.registrationUrl || "",
    bannerUrl: initialEvent?.bannerUrl || "",
    startDate: formatDateTimeLocal(initialEvent?.startDate),
    endDate: formatDateTimeLocal(initialEvent?.endDate),
    registrationDeadline: formatDateTimeLocal(initialEvent?.registrationDeadline),
    eligibility: initialEvent?.eligibility || "Open to all AI & DS Students",
    fee: initialEvent?.fee || "Free",
    prizes: initialEvent?.prizes || "",
    tags: initialEvent?.tags?.join(", ") || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error upon edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    // Client-side schema validation
    const parsed = eventFormSchema.safeParse(formData);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0]?.toString() || "general";
        errors[fieldName] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialEvent) {
        const result = await updateEventAction(initialEvent.id, parsed.data);
        if (!result.success) {
          setGeneralError(result.error || "Failed to update event.");
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Event updated successfully!");
        setTimeout(() => {
          router.push("/admin/events");
          router.refresh();
        }, 800);
      } else {
        const result = await createEventAction(parsed.data);
        if (!result.success) {
          setGeneralError(result.error || "Failed to create event draft.");
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Event draft created successfully! You can review and publish it from My Events.");
        setTimeout(() => {
          router.push("/admin/events");
          router.refresh();
        }, 800);
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notifications */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{generalError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            1. Opportunity Overview &amp; Categorization
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Event Title <span className="text-rose-500">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. REC National GenAI Hackathon 2026"
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
          {fieldErrors.title && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm rounded-md border border-slate-200 px-3 py-2 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#003366]"
            >
              {eventCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Mode <span className="text-rose-500">*</span>
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm rounded-md border border-slate-200 px-3 py-2 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#003366]"
            >
              {eventModes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organizer Name <span className="text-rose-500">*</span>
            </label>
            <Input
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="e.g. REC AI & DS Dept / ACM"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.organizer && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.organizer}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Summary / Short Pitch <span className="text-rose-500">*</span>
            <span className="text-slate-400 font-normal ml-1">
              ({formData.summary.length}/500)
            </span>
          </label>
          <Textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="A concise summary highlighting objectives, themes, and key takeaways for students."
            rows={2}
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
          {fieldErrors.summary && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.summary}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description / Agenda / Guidelines <span className="text-rose-500">*</span>
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide complete event details, rounds, tracks, prerequisite tools, and evaluation criteria."
            rows={5}
            className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
          />
          {fieldErrors.description && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.description}</p>
          )}
        </div>
      </div>

      {/* Section 2: Dates and Deadlines */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-[#003366]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            2. Schedule &amp; Deadlines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date &amp; Time <span className="text-rose-500">*</span>
            </label>
            <Input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.startDate && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date &amp; Time <span className="text-rose-500">*</span>
            </label>
            <Input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.endDate && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.endDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Deadline <span className="text-rose-500">*</span>
            </label>
            <Input
              type="datetime-local"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.registrationDeadline && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.registrationDeadline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Official Links and Venue */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Link2 className="w-4 h-4 text-[#003366]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            3. Registration URLs, Location &amp; Criteria
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Registration URL <span className="text-rose-500">*</span>
            </label>
            <Input
              name="registrationUrl"
              value={formData.registrationUrl}
              onChange={handleChange}
              placeholder="https://forms.google.com/... or official portal URL"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.registrationUrl && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.registrationUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location Details <span className="text-rose-500">*</span>
            </label>
            <Input
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Turing Lab, REC Campus or Google Meet URL"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.venue && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.venue}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Banner Image URL (Optional)
            </label>
            <Input
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleChange}
              placeholder="https://... image poster address"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
            {fieldErrors.bannerUrl && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.bannerUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Eligibility Criteria
            </label>
            <Input
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="e.g. AI & DS II & III Year Students"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Fee
            </label>
            <Input
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              placeholder="Free / ₹250"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prizes / Recognition
            </label>
            <Input
              name="prizes"
              value={formData.prizes}
              onChange={handleChange}
              placeholder="e.g. Cash Prize ₹25,000 + Merit Certificate"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (Comma-separated)
            </label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Machine Learning, Hackathon, REC"
              className="text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#003366]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/admin/events">
          <Button variant="outline" type="button" className="text-xs font-semibold gap-1.5 border-slate-300 text-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel &amp; Back
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold gap-1.5 px-6 py-2.5 shadow-xs"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? "Save Changes" : "Save as Draft"}
          </Button>
        </div>
      </div>
    </form>
  );
}
