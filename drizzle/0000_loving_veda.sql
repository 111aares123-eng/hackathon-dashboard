CREATE TYPE "public"."teacher_approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('HACKATHON', 'WORKSHOP', 'SEMINAR', 'INTERNSHIP', 'COMPETITION', 'ANNOUNCEMENT');--> statement-breakpoint
CREATE TYPE "public"."event_mode" AS ENUM('OFFLINE', 'ONLINE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'TEACHER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"is_approved_teacher" boolean DEFAULT false NOT NULL,
	"department" varchar(128) DEFAULT 'Artificial Intelligence and Data Science' NOT NULL,
	"register_number" varchar(64),
	"staff_id" varchar(64),
	"designation" varchar(128),
	"phone_number" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "teacher_approval_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"staff_id" varchar(64) NOT NULL,
	"department" varchar(128) NOT NULL,
	"designation" varchar(128) NOT NULL,
	"status" "teacher_approval_status" DEFAULT 'PENDING' NOT NULL,
	"proof_url" text,
	"reviewed_by" uuid,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" "event_category" NOT NULL,
	"mode" "event_mode" DEFAULT 'OFFLINE' NOT NULL,
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"organizer" varchar(255) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"venue" text NOT NULL,
	"registration_url" text NOT NULL,
	"banner_url" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"registration_deadline" timestamp with time zone NOT NULL,
	"eligibility" text,
	"fee" varchar(64) DEFAULT 'Free' NOT NULL,
	"prizes" text,
	"tags" text[],
	"author_id" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "events_date_order_chk" CHECK ("events"."start_date" <= "events"."end_date"),
	CONSTRAINT "events_deadline_order_chk" CHECK ("events"."registration_deadline" <= "events"."end_date")
);
--> statement-breakpoint
CREATE TABLE "saved_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(64) NOT NULL,
	"target_type" varchar(64) NOT NULL,
	"target_id" varchar(128) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teacher_approval_requests" ADD CONSTRAINT "teacher_approval_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_approval_requests" ADD CONSTRAINT "teacher_approval_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_staff_id_idx" ON "users" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "teacher_approvals_user_id_idx" ON "teacher_approval_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teacher_approvals_status_idx" ON "teacher_approval_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_status_category_idx" ON "events" USING btree ("status","category");--> statement-breakpoint
CREATE INDEX "events_registration_deadline_idx" ON "events" USING btree ("registration_deadline");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_author_id_idx" ON "events" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_events_user_event_unique" ON "saved_events" USING btree ("user_id","event_id");--> statement-breakpoint
CREATE INDEX "saved_events_user_id_idx" ON "saved_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_events_event_id_idx" ON "saved_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");