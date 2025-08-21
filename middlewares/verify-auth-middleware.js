import { refreshTokens, verifyJWTTOken } from "../services/auth.services.js";

// export const verifyAuthentication = (req, res, next) => {
//   const token = req.cookies.access_token;
//   if (!token) {
//     req.user = null;
//     return next();
//   }

//   try {
//     const decodedToken = verifyJWTTOken(token);

//     req.user = decodedToken;
//     console.log("req.user : ", req.user);
//   } catch (error) {
//     req.user = null;
//   }

//   return next();
// };
// middleware has next tells to do the next task

// You can add any property to req, but:
// 1) Avoid overwriting existing properties.
// 2) Use req.user for authentication.
// 3) Group custom properties under req.custom if needed.
// 4) keep the data lightweight

export const verifyAuthentication = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.user = null;

  if (!accessToken && !refreshToken) {
    return next();
  }

  if (accessToken) {
    const decodedToken = verifyJWTTOken(accessToken);
    req.user = decodedToken;

    return next();
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, user } = await refreshTokens(
        refreshToken
      );

      req.user = user;

      const baseConfig = { httpOnly: true, secure: true };

      res.cookie("access_token", newAccessToken, {
        ...baseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY,
      });

      res.cookie("refresh_token", newRefreshToken, {
        ...baseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY,
      });

      return next();
    } catch (error) {
      console.error(error.message);
    }
  }
  return next();
};
