import { z } from "zod";

const emptyObjectSchema = z.object({}).strict();

export const getProfileSchema = z.object({
  body: emptyObjectSchema,
  params: emptyObjectSchema,
  query: emptyObjectSchema,
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    })
    .strict(),

  params: emptyObjectSchema,
  query: emptyObjectSchema,
});


export const deactivateAccountSchema = z.object({
  body: z
    .object({
      password: z.string().min(1, "Password is required"),
    })
    .strict(),

  params: emptyObjectSchema,
  query: emptyObjectSchema,
});

export const deleteAccountSchema = z.object({
  body: z
    .object({
      password: z.string().min(1, "Password is required"),
    })
    .strict(),

  params: emptyObjectSchema,
  query: emptyObjectSchema,
});