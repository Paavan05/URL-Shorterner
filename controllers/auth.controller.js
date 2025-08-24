import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { getHtmlFromMjmlTemplate } from "../lib/get-html-from-mjml-template.js";
import { sendEmail } from "../lib/send-email.js";
import {
  authenticateUser,
  clearResetPasswordToken,
  clearUserSession,
  clearVerifyEmailToken,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  createResetPasswordLink,
  createSession,
  createUser,
  createVerifyEmailLink,
  findUserByEmail,
  findUserById,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  getResetPasswordToken,
  // generateToken,
  getUserByEmail,
  hashPassword,
  insertVerifyEmailToken,
  sendNewVerifyEmailLink,
  updateUserByName,
  updateUserPassword,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";
import {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  verifyEmailSchema,
  verifyPasswordSchema,
  verifyResetPasswordSchema,
  verifyUserSchema,
} from "../validators/auth-validator.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("../views/auth/register", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");

  const { data, error } = registerUserSchema.safeParse(req.body);

  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/register");
  }

  const { name, email, password } = data;

  const userExists = await getUserByEmail(email);
  console.log("userExists: ", userExists);

  // if (userExists) return res.redirect("/register");
  if (userExists) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  const hasedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, password: hasedPassword });
  console.log(user);

  // res.redirect("/login");

  // redirecting to home page after registration
  await authenticateUser({ req, res, user, name, email });

  // verify user/email after registration
  await sendNewVerifyEmailLink({ email, userId: user.id });

  res.redirect("/");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("auth/login", { errors: req.flash("errors") }); // ejs takes views folder as default to search files, so you don't need to write ../views/
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  const { data, error } = loginUserSchema.safeParse(req.body);

  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/login");
  }

  const { email, password } = data;

  const user = await getUserByEmail(email);

  if (!user) {
    req.flash("errors", "Invalid email or password");
    return res.redirect("/login");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    req.flash("errors", "Invalid email or password");

    return res.redirect("/login");
  }
  // res.cookie("isLoggedIn", true); // cookie-parser and express automatically set the path to / by default.

  // const token = generateToken({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  // });

  // res.cookie("access_token", token);
  await authenticateUser({ req, res, user });

  res.redirect("/");
};

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in");

  return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1>`);
};

export const logoutUser = async (req, res) => {
  await clearUserSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};

export const getProfilePage = async (req, res) => {
  if (!req.user) return res.send("Not logged in");

  const user = await findUserById(req.user.id);
  if (!user) return res.redirect("/login");

  const userShortLinks = await getAllShortLinks(user.id);

  return res.render("auth/profile", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      createdAt: user.createdAt,
      links: userShortLinks,
    },
  });
};

export const getVerifyEmailPage = async (req, res) => {
  // if (!req.user || req.user.isEmailValid) return res.redirect("/");

  if (!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  return res.render("auth/verify-email", {
    email: req.user.email,
  });
};

export const resendVerificationLink = async (req, res) => {
  if (!req.user) return res.redirect("/");
  const user = await findUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect("/");

  await sendNewVerifyEmailLink({ email: req.user.email, userId: req.user.id });

  res.redirect("/verify-email");
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);
  if (error) {
    return res.send("Verification link invalid or expired!");
  }

  const [token] = await findVerificationEmailToken(data);
  console.log("verifyEmailToken: ", token);
  if (!token) return res.send("Verification link invalid or expired!");

  await verifyUserEmailAndUpdate(token.email);

  clearVerifyEmailToken(token.userId).catch(console.error);

  return res.redirect("/profile");
};

export const getEditProfilePage = async (req, res) => {
  if (!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).send("User Not Found");

  return res.render("auth/edit-profile", {
    name: user.name,
    errors: req.flash("errors"),
  });
};

export const postEditProfile = async (req, res) => {
  if (!req.user) return res.redirect("/");

  // const user = req.body;
  const { data, error } = verifyUserSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/edit-profile");
  }

  await updateUserByName({ userId: req.user.id, name: data.name });

  return res.redirect("/profile");
};

export const getChangePasswordPage = async (req, res) => {
  if (!req.user) return res.redirect("/");

  return res.render("auth/change-password", {
    errors: req.flash("errors"),
  });
};

export const postChangePassword = async (req, res) => {
  const { data, error } = verifyPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/change-password");
  }

  const { currentPassword, newPassword } = data;

  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).send("User Not Found");

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    req.flash("errors", "Current Password that you entered is Invalid");
    return res.redirect("/change-password");
  }

  await updateUserPassword({ userId: user.id, newPassword });

  return res.redirect("/profile");
};

export const getResetPasswordPage = async (req, res) => {
  return res.render("auth/forgot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
  });
};

export const postPorgotPassword = async (req, res) => {
  const { data, error } = forgotPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/reset-password");
  }

  const user = await findUserByEmail(data.email);

  if (user) {
    const resetPasswordLink = await createResetPasswordLink({
      userId: user.id,
    });

    const html = await getHtmlFromMjmlTemplate("reset-password-email", {
      name: user.name,
      link: resetPasswordLink,
    });

    sendEmail({
      to: user.email,
      subject: "Reset Your Passeord",
      html,
    });
  }

  req.flash("formSubmitted", true);
  return res.redirect("/reset-password");
};

export const getResetPasswordTokenPage = async (req, res) => {
  const { token } = req.params;

  const passwordResetData = await getResetPasswordToken(token);
  if (!passwordResetData) return res.render("auth/wrong-reset-password-token");

  return res.render("auth/reset-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  });
};

export const postResetPasswordToken = async (req, res) => {
  const { token } = req.params;

  const passwordResetData = await getResetPasswordToken(token);
  if (!passwordResetData) {
    req.flash("errors", "Password Token is not matching");
    return res.render("auth/wrong-reset-password-token");
  }

  const { data, error } = verifyResetPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect(`/reset-password/${token}`);
  }

  const { newPassword } = data;
  const user = await findUserById(passwordResetData.userId);

  await clearResetPasswordToken(user.id);

  await updateUserPassword({ userId: user.id, newPassword });

  return res.redirect("/login");
};


