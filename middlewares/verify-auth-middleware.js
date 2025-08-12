import { verifyJWTTOken } from "../services/auth.services.js";

export const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = verifyJWTTOken(token);

    req.user = decodedToken;
    console.log("req.user : ", req.user);
  } catch (error) {
    req.user = null;
  }

  return next();
};
// middleware has next tells to do the next task

// You can add any property to req, but:
// 1) Avoid overwriting existing properties.
// 2) Use req.user for authentication.
// 3) Group custom properties under req.custom if needed.
// 4) keep the data lightweight
