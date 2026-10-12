import type { User, Event } from "@/db/schema";

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Student A",
    email: "student.a@rajalakshmi.edu.in",
    passwordHash: null,
    emailVerified: new Date(),
    image: null,
    role: "STUDENT",
    isApprovedTeacher: false,
    department: "Artificial Intelligence and Data Science",
    registerNumber: "210701045",
    staffId: null,
    designation: null,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    title: "REC Hackathon 2026",
    slug: "rec-hackathon-2026",
    category: "HACKATHON",
    mode: "OFFLINE",
    status: "PUBLISHED",
    organizer: "REC AI & DS Department",
    summary: "A 24-hour national hackathon for college students.",
    description: "Detailed event description, tracks and rules.",
    venue: "Turing Lab, Block II, REC Campus",
    registrationUrl: "https://forms.gle/rec-hackathon-2026",
    bannerUrl: null,
    startDate: new Date("2026-11-20T09:00:00Z"),
    endDate: new Date("2026-11-21T18:00:00Z"),
    registrationDeadline: new Date("2026-11-18T23:59:59Z"),
    eligibility: "Open to AI & DS Students",
    fee: "Free",
    prizes: "Cash Prizes & Certificates",
    tags: ["Hackathon", "AI"],
    authorId: "99999999-9999-9999-9999-999999999999",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
