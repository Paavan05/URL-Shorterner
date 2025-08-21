import z from "zod";

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter  a valid email" })
    .max(100, { message: "Email must be no more than 100 character." }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 character long." })
    .max(100, { message: "Password must be no more than 100 character." }),
});

export const registerUserSchema = loginUserSchema.extend({
  // gets all the validations from login schema
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be atleast 3 character long." })
    .max(100, { message: "Name must be no more than 100 character." }),
});
