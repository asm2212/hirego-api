import { z } from "zod";

export const jobSchema = z.object({
  title: z.string(),
  description: z.string(),
  jobType: z.enum(["Full-time", "Part-time", "Remote", "Contract"]),
  location: z.string(),
  salary: z.number(),
  deadline: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid deadline date format",
  }),
  companyName: z.string(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});
