const { z } = require("zod");
const { passwordSchema } = require("../users/user.schemas");

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional()
    })
    .optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  loginSchema,
  registerSchema,
  refreshSchema
};
