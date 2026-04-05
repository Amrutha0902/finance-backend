const { z } = require("zod");

const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive("Amount must be greater than 0."),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be 'income' or 'expense'." }),
  }),
  category: z.string().min(1, "Category is required.").max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive("Amount must be greater than 0.")
    .optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().min(1).max(100).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update." }
);

const recordQuerySchema = z.object({
  page:      z.string().optional(),
  limit:     z.string().optional(),
  type:      z.enum(["income", "expense"]).optional(),
  category:  z.string().optional(),
  search:    z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD.")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD.")
    .optional(),
  sortBy:    z.enum(["date", "amount", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

module.exports = { createRecordSchema, updateRecordSchema, recordQuerySchema };
