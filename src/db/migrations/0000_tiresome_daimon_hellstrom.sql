CREATE TABLE "assignments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"classroom_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"topic_id" varchar(50) NOT NULL,
	"due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classroom_memberships" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"classroom_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"teacher_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"grade_level" varchar(10) NOT NULL,
	"invite_code" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classrooms_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "diagnostic_attempts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"question_id" varchar(50) NOT NULL,
	"question_version" integer DEFAULT 1 NOT NULL,
	"engine_version" varchar(20) DEFAULT '1.2' NOT NULL,
	"equation" varchar(255) NOT NULL,
	"working_steps" jsonb NOT NULL,
	"final_answer" varchar(100),
	"payload_hash" varchar(64) NOT NULL,
	"server_is_correct" boolean,
	"server_primary_misconception" varchar(50),
	"validation_status" varchar(20) DEFAULT 'PROVISIONAL' NOT NULL,
	"client_timestamp" timestamp with time zone NOT NULL,
	"server_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_attempts_validation_status" CHECK ("diagnostic_attempts"."validation_status" IN ('PROVISIONAL', 'VALIDATED', 'REJECTED'))
);
--> statement-breakpoint
CREATE TABLE "diagnostic_misconceptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(36) NOT NULL,
	"misconception_code" varchar(50) NOT NULL,
	"confidence_score" integer DEFAULT 100 NOT NULL,
	"supporting_evidence" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_misconception_confidence" CHECK ("diagnostic_misconceptions"."confidence_score" >= 0 AND "diagnostic_misconceptions"."confidence_score" <= 100)
);
--> statement-breakpoint
CREATE TABLE "reward_transactions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"reference_id" varchar(100) NOT NULL,
	"points_awarded" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_reward_points_non_negative" CHECK ("reward_transactions"."points_awarded" >= 0)
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"avatar_seed" varchar(255) DEFAULT 'AD' NOT NULL,
	"grade_level" varchar(10) DEFAULT 'SS2' NOT NULL,
	"target_exam" varchar(20) DEFAULT 'WAEC' NOT NULL,
	"school_name" varchar(255),
	"timezone" varchar(50) DEFAULT 'Africa/Lagos' NOT NULL,
	"audio_support" boolean DEFAULT false NOT NULL,
	"preferred_presentation" jsonb DEFAULT '["visual","interactive"]'::jsonb NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_active_date" varchar(10),
	"mastery_percentage" integer,
	"daily_goal_target" integer DEFAULT 3 NOT NULL,
	"daily_goal_completed" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_student_xp_non_negative" CHECK ("student_profiles"."total_xp" >= 0),
	CONSTRAINT "chk_student_streak_non_negative" CHECK ("student_profiles"."streak_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"school_name" varchar(255) NOT NULL,
	"verification_id" varchar(36),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_verifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"school_name" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"is_redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_by_teacher_id" varchar(36),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_verifications_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"sid" varchar(255) PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp (6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"username_normalized" varchar(50) NOT NULL,
	"email" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_users_role" CHECK ("users"."role" IN ('student', 'teacher', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_memberships" ADD CONSTRAINT "classroom_memberships_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_memberships" ADD CONSTRAINT "classroom_memberships_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_attempts" ADD CONSTRAINT "diagnostic_attempts_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_misconceptions" ADD CONSTRAINT "diagnostic_misconceptions_attempt_id_diagnostic_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."diagnostic_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_transactions" ADD CONSTRAINT "reward_transactions_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_verification_id_teacher_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."teacher_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_classroom_student" ON "classroom_memberships" USING btree ("classroom_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_student" ON "diagnostic_attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_client_ts" ON "diagnostic_attempts" USING btree ("client_timestamp");--> statement-breakpoint
CREATE INDEX "idx_attempts_payload_hash" ON "diagnostic_attempts" USING btree ("payload_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_student_reward_unique" ON "reward_transactions" USING btree ("student_id","activity_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expire" ON "user_sessions" USING btree ("expire");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_username_norm" ON "users" USING btree ("username_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");