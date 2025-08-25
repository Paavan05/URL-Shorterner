import { GitHub } from "arctic";
import { env } from "../../config/env.js"; // for validation

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  `${env.FRONTEND_URL}/github/callback` // we will create this route to verify after login
);
