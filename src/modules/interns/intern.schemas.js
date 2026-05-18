const { z } = require("zod");


const TRACK_VALUES = ["frontend", "backend", "cybersecurity", "product"];

const trackSchema = z.enum(TRACK_VALUES);


const createInternSchema = z.object({
  body: z.object({
    fullName:  z.string().min(2).max(100),
    email:     z.string().email(),
    track:     trackSchema,
    bio:       z.string().max(1000).optional(),
    github:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
    linkedin:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
    imageUrl:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }),
  params: z.object({}).optional(),
  query:  z.object({}).optional(),
});


const updateInternSchema = z.object({
  body: z.object({
    fullName:  z.string().min(2).max(100).optional(),
    email:     z.string().email().optional(),
    track:     trackSchema.optional(),
    bio:       z.string().max(1000).optional(),
    github:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
    linkedin:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
    imageUrl:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
    isActive:  z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid("Invalid intern ID") }),
  query:  z.object({}).optional(),
});


const internIdSchema = z.object({
  body:   z.object({}).optional(),
  params: z.object({ id: z.string().uuid("Invalid intern ID") }),
  query:  z.object({}).optional(),
});


const listInternsSchema = z.object({
  body:   z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    track:    trackSchema.optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

module.exports = {
  TRACK_VALUES,
  createInternSchema,
  updateInternSchema,
  internIdSchema,
  listInternsSchema,
};