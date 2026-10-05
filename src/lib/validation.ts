import { z } from "zod";

import { isSafeExternalUrl, isValidUsername, USERNAME_PATTERN } from "./utils";

const trimmed = z.string().trim();

const USERNAME_RULES = z
  .string()
  .regex(
    USERNAME_PATTERN,
    "Use 3-30 characters: lowercase letters, numbers, hyphen or underscore, without leading or trailing separators.",
  )
  .refine(isValidUsername, "That username is reserved. Please pick another.");

export const signUpSchema = z.object({
  name: trimmed.min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
  username: trimmed.toLowerCase().pipe(USERNAME_RULES),
  email: trimmed.toLowerCase().pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export const signInSchema = z.object({
  email: trimmed.toLowerCase().pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password."),
});

export const profileSchema = z.object({
  name: trimmed.max(60, "Name is too long.").optional().or(z.literal("")),
  username: trimmed.toLowerCase().pipe(USERNAME_RULES),
  bio: trimmed.max(400, "Bio is limited to 400 characters.").optional().or(z.literal("")),
});

export const roadmapSchema = z.object({
  title: trimmed.min(3, "Give the roadmap a title (min 3 characters).").max(80, "Title is too long."),
  description: trimmed.max(500, "Description is limited to 500 characters.").optional().or(z.literal("")),
  goal: trimmed.max(120, "Goal is limited to 120 characters.").optional().or(z.literal("")),
});

export const roadmapSettingsSchema = roadmapSchema.extend({
  slug: trimmed
    .toLowerCase()
    .pipe(
      z
        .string()
        .min(3, "Slug is too short.")
        .max(48, "Slug is too long.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens."),
    ),
  isPublished: z.coerce.boolean(),
});

export const moduleSchema = z.object({
  roadmapId: trimmed.min(1, "Missing roadmap."),
  title: trimmed.min(2, "Module title must be at least 2 characters.").max(80, "Title is too long."),
});

export const topicSchema = z.object({
  moduleId: trimmed.min(1, "Missing module."),
  title: trimmed.min(2, "Topic title must be at least 2 characters.").max(120, "Title is too long."),
  resource: trimmed
    .max(300, "Resource link is too long.")
    .optional()
    .or(z.literal(""))
    // Topic resources are rendered as hrefs, so reject javascript: and data:
    // payloads the same way proof-of-work links are rejected.
    .refine((value) => !value || isSafeExternalUrl(value), "Enter a valid http(s) link."),
});

export const reorderSchema = z.object({
  /** Ordered ids exactly as they should appear after the move. */
  ids: z.array(trimmed.min(1)).min(1),
  parentId: trimmed.min(1),
  /** 'module' reorders modules; 'topic' reorders topics within a module. */
  scope: z.enum(["module", "topic"]),
});

/**
 * A journal note is 3-5 sentences by design, so cap it at a length that keeps
 * the portfolio readable rather than accepting an essay.
 *
 * The "proof link required to complete" rule is enforced in the action rather
 * than here, because a cross-field check reports a form-level error rather than
 * a per-field one.
 */
export const journalSchema = z.object({
  topicId: trimmed.min(1, "Missing topic."),
  note: trimmed
    .min(20, "Write at least a couple of sentences about what you learned.")
    .max(1200, "Note is too long."),
  proofUrl: trimmed
    .max(500, "Link is too long.")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isSafeExternalUrl(value), "Enter a valid http(s) link."),
  proofLabel: trimmed.max(40, "Label is too long.").optional().or(z.literal("")),
  /** Only meaningful when marking the topic complete. */
  completed: z.coerce.boolean(),
});

export const topicStatusSchema = z.object({
  topicId: trimmed.min(1, "Missing topic."),
  status: z.enum(["LOCKED", "IN_PROGRESS", "COMPLETED"]),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RoadmapInput = z.infer<typeof roadmapSchema>;
export type JournalInput = z.infer<typeof journalSchema>;

/**
 * Shape returned by server actions so forms can render field-level errors.
 * `errors` is declared on both branches so callers can read it without first
 * narrowing on `ok`.
 */
export type ActionState =
  | { ok: true; message?: string; errors?: undefined }
  | { ok: false; message?: string; errors?: Record<string, string[]> }
  | undefined;
