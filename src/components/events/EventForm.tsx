"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  eventFormSchema,
  eventCategories,
  eventModes,
} from "@/validators/event";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2, Sparkles, Zap, Flame, Star, Eye } from "lucide-react";
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
  const [autoOd, setAutoOd] = useState(true);

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
    venue: initialEvent?.venue || "REC Central Computing Lab, Chennai",
    registrationUrl: initialEvent?.registrationUrl || "https://unstop.com/hackathons/rec-sample",
    bannerUrl: initialEvent?.bannerUrl || "",
    startDate: formatDateTimeLocal(initialEvent?.startDate) || "2025-11-14T09:00",
    endDate: formatDateTimeLocal(initialEvent?.endDate) || "2025-11-15T18:00",
    registrationDeadline: formatDateTimeLocal(initialEvent?.registrationDeadline) || "2025-11-10T23:59",
    eligibility: initialEvent?.eligibility || "Open to all AI & DS Students",
    fee: initialEvent?.fee || "Free",
    prizes: initialEvent?.prizes || "₹50,000 + Certificates",
    tags: initialEvent?.tags?.join(", ") || "AI/ML, Hackathon, Python",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      bannerUrl: formData.bannerUrl.trim() || undefined,
      eligibility: formData.eligibility.trim() || undefined,
      prizes: formData.prizes.trim() || undefined,
    };

    const validation = eventFormSchema.safeParse(payload);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const fieldName = err.path[0]?.toString();
        if (fieldName) {
          errors[fieldName] = err.message;
        }
      });
      setFieldErrors(errors);
      setGeneralError("Please resolve the validation errors indicated below.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialEvent) {
        const result = await updateEventAction(initialEvent.id, validation.data);
        if (!result.success) {
          setGeneralError(result.error || "Failed to update event.");
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Opportunity updated successfully!");
        router.refresh();
        router.push("/admin/events");
      } else {
        const result = await createEventAction(validation.data);
        if (!result.success) {
          setGeneralError(result.error || "Failed to create opportunity.");
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Opportunity published successfully to Student Hub!");
        router.refresh();
        router.push("/admin/events");
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 font-heading text-xs uppercase font-extrabold text-[#5D3F3C] hover:text-[#171717] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Events Management</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white p-5 rounded border-2 border-[#171717] shadow-brutal-md flex items-center justify-between">
        <div>
          <span className="font-heading text-xs uppercase text-[#F12D2D] font-black tracking-widest block">
            RAPID LAUNCH CONSOLE
          </span>
          <h1 className="font-display text-2xl uppercase font-black text-[#171717]">
            {isEditing ? "Edit Academic Opportunity" : "Event Creation & OD Sanction Wizard"}
          </h1>
        </div>
        <span className="px-3 py-1 bg-[#D9FF38] text-[#171717] font-heading text-xs uppercase rounded font-black border-2 border-[#171717] shadow-brutal-sm flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-[#171717]" /> AUTO-OD ENABLED
        </span>
      </div>

      {/* Notifications */}
      {generalError && (
        <div className="p-4 rounded bg-[#FFDAD6] border-2 border-[#171717] text-[#410002] text-xs font-bold flex items-start gap-2.5 shadow-brutal-sm">
          <AlertCircle className="w-4 h-4 text-[#F12D2D] mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded bg-[#D9FF38] border-2 border-[#171717] text-[#171717] text-xs font-black flex items-start gap-2.5 shadow-brutal-sm">
          <CheckCircle2 className="w-4 h-4 text-[#171717] mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 7:5 Split Form and Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded border-2 border-[#171717] shadow-brutal-lg space-y-4">
            <div>
              <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                Event Title &amp; Theme Name <span className="text-[#F12D2D]">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Autonomous Agents Kaggle Challenge 2025"
                required
                className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none focus:shadow-brutal-blue"
              />
              {fieldErrors.title && (
                <p className="text-xs text-[#F12D2D] mt-1 font-bold">{fieldErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Category <span className="text-[#F12D2D]">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-heading text-xs uppercase font-bold shadow-brutal-sm outline-none"
                >
                  {eventCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Delivery Mode <span className="text-[#F12D2D]">*</span>
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-heading text-xs uppercase font-bold shadow-brutal-sm outline-none"
                >
                  {eventModes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Organizer <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="e.g. REC AI & DS + NVIDIA Inception"
                  required
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none focus:shadow-brutal-blue"
                />
              </div>

              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Prize Pool / Grant
                </label>
                <input
                  name="prizes"
                  value={formData.prizes}
                  onChange={handleChange}
                  placeholder="e.g. ₹50,000 + REC Incubation"
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none focus:shadow-brutal-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-heading text-[11px] uppercase font-extrabold text-[#171717] mb-1">
                  Start Date <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-white border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-heading text-[11px] uppercase font-extrabold text-[#171717] mb-1">
                  End Date <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-white border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-heading text-[11px] uppercase font-extrabold text-[#171717] mb-1">
                  Deadline <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-white border-2 border-[#171717] rounded font-body text-xs shadow-brutal-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                Summary / Short Pitch ({formData.summary.length}/500) <span className="text-[#F12D2D]">*</span>
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="48-hour competitive sprint constructing Autonomous Multimodal Agents..."
                required
                rows={2}
                className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none focus:shadow-brutal-blue"
              />
            </div>

            <div>
              <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                Detailed Guidelines / Description <span className="text-[#F12D2D]">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Full agenda, rules, hardware requirements..."
                required
                rows={4}
                className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none focus:shadow-brutal-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Venue <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. AI Innovation Center, Block 3"
                  required
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-heading text-xs uppercase font-extrabold text-[#171717] mb-1">
                  Registration URL <span className="text-[#F12D2D]">*</span>
                </label>
                <input
                  name="registrationUrl"
                  type="url"
                  value={formData.registrationUrl}
                  onChange={handleChange}
                  placeholder="https://unstop.com/..."
                  required
                  className="w-full p-2.5 bg-white border-2 border-[#171717] rounded font-body text-sm shadow-brutal-sm outline-none"
                />
              </div>
            </div>

            {/* Auto OD Switch */}
            <div className="bg-[#FFE23B] p-4 rounded border-2 border-[#171717] shadow-brutal-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-[#171717] text-[#FFE23B] flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-4 h-4 fill-[#FFE23B]" />
                </span>
                <div>
                  <span className="font-heading text-xs uppercase font-black text-[#171717] block">
                    Grant OD Exemption Automatically
                  </span>
                  <span className="font-body text-[11px] text-[#5D3F3C]">
                    Auto-transfers student attendance tokens directly into REC COE ERP on submission.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoOd}
                onChange={(e) => setAutoOd(e.target.checked)}
                className="w-5 h-5 accent-[#F12D2D] cursor-pointer"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#F12D2D] text-white border-2 border-[#171717] font-heading text-sm uppercase font-extrabold rounded shadow-brutal hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>DISPATCHING SANCTION...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#FFE23B]" />
                  <span>
                    {isEditing ? "UPDATE OPPORTUNITY DATA" : "PUBLISH OPPORTUNITY TO STUDENT MATRIX"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Live Preview 5 cols */}
        <div className="lg:col-span-5 space-y-3 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs uppercase font-black text-[#171717] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#1748F5]" />
              LIVE STUDENT HUB PREVIEW
            </span>
            <span className="px-2 py-0.5 bg-[#D9FF38] border border-[#171717] font-heading text-[10px] uppercase font-black rounded shadow-brutal-sm">
              REAL-TIME SYNC
            </span>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded border-2 border-[#171717] shadow-brutal-xl overflow-hidden flex flex-col">
            <div className="bg-[#1748F5] text-white p-3 border-b-2 border-[#171717] flex items-center justify-between">
              <div className="flex items-center gap-1 font-heading text-xs font-black uppercase">
                <Star className="w-3.5 h-3.5 fill-[#FFE23B] text-[#FFE23B]" />
                <span>{formData.category} • {formData.mode}</span>
              </div>
              <span className="bg-[#FFE23B] text-[#171717] px-2 py-0.5 rounded font-heading text-[10px] font-black uppercase border border-[#171717] shadow-brutal-sm">
                REC VERIFIED
              </span>
            </div>

            <div className="relative h-44 bg-[#E9E2D5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="Event preview"
                src={
                  formData.bannerUrl ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDH-3rd6zLfNwGd9aYNUdSHRjhfUL-T370EPj_WbLAy70HuPQTg5jWV49roxZMY0lRhcenLIIgWFr4unWkWT58BvCB6okx-HPEKFvrRmxqkJBSddWHnBuekvA2wYyPaTbOFof6RN56AcOfg3wei-vdbc-CismjZ7u2Nu1i91lCG6-KhryDgfW-HOZCwbVdFfuw9cD3DY4Zd5xKKIDSGNRX6VL-D1U8yt5xdLt4Da0PtA_MO7g-CR9rj"
                }
              />
              <div className="absolute top-2 right-2 bg-[#F12D2D] text-white font-heading text-xs uppercase font-black px-2.5 py-1 rounded border border-[#171717] shadow-brutal-sm -rotate-3">
                {formData.prizes || "AWARDS"}
              </div>
              {autoOd && (
                <div className="absolute bottom-2 left-2 bg-[#D9FF38] text-[#171717] font-heading text-[10px] uppercase font-black px-2 py-0.5 rounded border border-[#171717] shadow-brutal-sm flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-[#171717]" />
                  <span>100% ATTENDANCE OD</span>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-display text-lg uppercase text-[#171717] leading-tight font-black">
                {formData.title || "Untitled AI & DS Event"}
              </h3>
              <p className="font-body text-xs text-[#5D3F3C] line-clamp-2">
                {formData.summary || "Summary description appears here as typed."}
              </p>

              <div className="bg-[#FFF9E9] p-2.5 rounded border border-[#171717] grid grid-cols-2 gap-2 font-heading text-[11px]">
                <div>
                  <span className="text-[#5D3F3C] block uppercase font-bold text-[9px]">Organizer</span>
                  <span className="font-bold text-[#171717] truncate block">{formData.organizer}</span>
                </div>
                <div>
                  <span className="text-[#5D3F3C] block uppercase font-bold text-[9px]">Venue</span>
                  <span className="font-bold text-[#171717] truncate block">{formData.venue}</span>
                </div>
              </div>

              <div className="w-full py-2 bg-[#F12D2D] text-white font-heading text-xs uppercase rounded border-2 border-[#171717] shadow-brutal-sm text-center font-extrabold">
                REGISTER VIA REC ID
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
