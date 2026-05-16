const { z } = require("zod");
const { ROLE_VALUES } = require("../../constants/roles");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema,
    role: z.enum(ROLE_VALUES)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  passwordSchema,
  createUserSchema
};
