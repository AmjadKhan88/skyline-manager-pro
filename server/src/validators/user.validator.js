import * as yup from "yup";

export const createUserSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .required("Name is required"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .max(150, "Email too long")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password too long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[\W_]/, "Password must contain at least one special character")
    .required("Password is required"),

  role: yup
    .string()
    .oneOf(["tenant", "employee", "manager"], "Invalid role")
    .required("Role is required"),

  ownerId: yup
    .string()
    .uuid("Invalid ownerId")
    .nullable()
    .when("role", {
      is: (role) => role !== "manager",
      then: (schema) =>
        schema.required("ownerId is required for tenant and employee"),
      otherwise: (schema) => schema.nullable(),
    }),

  avatar: yup
    .string()
    .url("Avatar must be a valid URL")
    .nullable(),

  info: yup
    .object()
    .nullable(),

  other: yup
    .object()
    .nullable(),
});
