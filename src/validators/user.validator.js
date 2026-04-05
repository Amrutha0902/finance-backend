const { z } = require("zod");

const loginSchema = z.object({
  email:    z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const createUserSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters.").max(100),
  email:    z.string().email("Invalid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(100),
  role: z.enum(["admin", "analyst", "viewer"], {
    errorMap: () => ({ message: "Role must be admin, analyst, or viewer." }),
  }),
});

const updateUserSchema = z.object({
  name:   z.string().min(2).max(100).optional(),
  role:   z.enum(["admin", "analyst", "viewer"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update." }
);

module.exports = { loginSchema, createUserSchema, updateUserSchema };
