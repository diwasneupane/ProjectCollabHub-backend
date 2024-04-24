import z from "zod";

const userValidation = z.object({
  username: z
    .string()
    .trim()
    .min(5, "Username must be at least 5 characters")
    .nonempty("field is required"),
  // email: z.string().email("Invalid email format").nonempty("email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    // Combined regex for stronger password complexity
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@#$%^&*()_++=]+$/,
      "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
    )
    .nonempty("password is required"),
});

export default userValidation;
