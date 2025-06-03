import { z } from "zod";

export const signupSchema = z.object({
  name: z.string({ required_error: "Name is required" })
          .min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" })
           .email("Invalid email"),
  password: z.string({ required_error: "Password is required" })
             .min(6, "Password must be at least 6 characters"),

});

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" })
           .email("Invalid email"),
  password: z.string({ required_error: "Password is required" })
             .min(6, "Password must be at least 6 characters"),
});