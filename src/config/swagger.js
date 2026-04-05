const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Backend API",
      version: "1.0.0",
      description: `
A production-grade REST API for a finance dashboard system.

## Roles & Permissions
| Role    | Records      | Dashboard Summary | Insights (trends/categories) | User Management |
|---------|-------------|-------------------|------------------------------|-----------------|
| Admin   | Full CRUD   | ✅                | ✅                           | ✅              |
| Analyst | Read only   | ✅                | ✅                           | ❌              |
| Viewer  | Read only   | ✅                | ❌                           | ❌              |

## Authentication
All protected routes require a **Bearer token** in the Authorization header.
1. Register via \`POST /api/auth/register\` or login via \`POST /api/auth/login\`
2. Copy the \`token\` from the response
3. Click **Authorize** (top right), paste the token and click **Authorize**
      `,
      contact: {
        name: "Finance Backend",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your JWT token here (without the 'Bearer' prefix)",
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name:     { type: "string", example: "Jane Viewer", minLength: 2 },
            email:    { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", minLength: 6, example: "secure123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "admin@finance.com" },
            password: { type: "string", example: "admin123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
            user:  { $ref: "#/components/schemas/User" },
          },
        },
        // ── User ────────────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id:         { type: "string", format: "uuid" },
            name:       { type: "string", example: "Super Admin" },
            email:      { type: "string", example: "admin@finance.com" },
            role:       { type: "string", enum: ["admin", "analyst", "viewer"] },
            status:     { type: "string", enum: ["active", "inactive"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name:     { type: "string", example: "John Analyst", minLength: 2 },
            email:    { type: "string", format: "email", example: "john@company.com" },
            password: { type: "string", minLength: 6, example: "securepass" },
            role:     { type: "string", enum: ["admin", "analyst", "viewer"], example: "analyst" },
          },
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            name:   { type: "string", example: "John Smith" },
            role:   { type: "string", enum: ["admin", "analyst", "viewer"] },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        // ── Financial Record ────────────────────────────────────────────────
        Record: {
          type: "object",
          properties: {
            id:              { type: "string", format: "uuid" },
            amount:          { type: "number", example: 5000 },
            type:            { type: "string", enum: ["income", "expense"] },
            category:        { type: "string", example: "Salary" },
            date:            { type: "string", format: "date", example: "2024-03-01" },
            notes:           { type: "string", example: "March salary payment" },
            deleted_at:      { type: "string", nullable: true },
            created_by:      { type: "string", format: "uuid" },
            created_by_name: { type: "string", example: "Super Admin" },
            created_at:      { type: "string", format: "date-time" },
            updated_at:      { type: "string", format: "date-time" },
          },
        },
        CreateRecordRequest: {
          type: "object",
          required: ["amount", "type", "category", "date"],
          properties: {
            amount:   { type: "number", example: 5000, minimum: 0.01 },
            type:     { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "Salary", maxLength: 100 },
            date:     { type: "string", format: "date", example: "2024-03-01" },
            notes:    { type: "string", example: "March salary payment", maxLength: 500 },
          },
        },
        UpdateRecordRequest: {
          type: "object",
          properties: {
            amount:   { type: "number", example: 5500, minimum: 0.01 },
            type:     { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "Salary - Adjusted" },
            date:     { type: "string", format: "date", example: "2024-03-01" },
            notes:    { type: "string", example: "Updated after correction" },
          },
        },
        // ── Dashboard ───────────────────────────────────────────────────────
        DashboardSummary: {
          type: "object",
          properties: {
            total_income:   { type: "number", example: 15000 },
            total_expenses: { type: "number", example: 6200 },
            net_balance:    { type: "number", example: 8800 },
            total_records:  { type: "integer", example: 24 },
          },
        },
        CategoryItem: {
          type: "object",
          properties: {
            category:           { type: "string", example: "Salary" },
            income:             { type: "number", example: 10000 },
            expense:            { type: "number", example: 0 },
            total_transactions: { type: "integer", example: 2 },
          },
        },
        MonthlyTrendItem: {
          type: "object",
          properties: {
            month:     { type: "string", example: "March" },
            month_num: { type: "string", example: "03" },
            income:    { type: "number", example: 5000 },
            expenses:  { type: "number", example: 1200 },
            net:       { type: "number", example: 3800 },
          },
        },
        WeeklyTrendItem: {
          type: "object",
          properties: {
            week:     { type: "string", example: "Week 1" },
            income:   { type: "number", example: 2000 },
            expenses: { type: "number", example: 500 },
            net:      { type: "number", example: 1500 },
          },
        },
        // ── Shared ──────────────────────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful." },
            data:    { type: "object" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data:    { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                page:       { type: "integer", example: 1 },
                limit:      { type: "integer", example: 10 },
                total:      { type: "integer", example: 42 },
                totalPages: { type: "integer", example: 5 },
                hasNext:    { type: "boolean", example: true },
                hasPrev:    { type: "boolean", example: false },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed." },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field:   { type: "string", example: "amount" },
                  message: { type: "string", example: "Amount must be greater than 0." },
                },
              },
            },
          },
        },
      },
    },
    // Applied globally to all routes that declare security: [{ bearerAuth: [] }]
    security: [],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
