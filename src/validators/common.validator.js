export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(60, "Name cannot exceed 60 characters"),

      email: emailSchema,

      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  params: z.object({}),

  query: z.object({}),
});


export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,

      password: z.string().min(1, "Password is required"),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});


export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: emailSchema,
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  params: z
    .object({
      token: tokenSchema,
    })
    .strict(),

  query: z.object({}),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),

      newPassword: passwordSchema,

      confirmNewPassword: z.string(),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    }),

  params: z.object({}),

  query: z.object({}),
});

export const verifyEmailSchema = z.object({
  body: z.object({}),

  params: z
    .object({
      token: tokenSchema,
    })
    .strict(),

  query: z.object({}),
});

export const resendVerificationSchema = z.object({
  body: z
    .object({
      email: emailSchema,
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

export const sessionIdSchema = z.object({
  body: z.object({}),

  params: z
    .object({
      sessionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid session ID"),
    })
    .strict(),

  query: z.object({}),
});