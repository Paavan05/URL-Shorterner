import z from "zod";

export const shortenerSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL." })
    .max(1024, { message: "URL cannot be longer than 1024 characters." }),
  shortCode: z
    .string()
    .trim()
    .min(2, { message: "Short code must be atleast 2 character long." })
    .max(50, { message: "Short code cannot be longer than 50 characters." }),
});
