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

export const shortenerSearchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .min(1)
    .optional() // optional must come before default, otherwise default value won't be set.
    .default(1)
    .catch(1), // if validation error occurs, then it will choose 1. it is necessary, otherwise if validation fails then 500 will occur
});
