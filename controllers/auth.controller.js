import {
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("../views/auth/register");
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");

  const { name, email, password } = req.body;

  const userExists = await getUserByEmail(email);
  console.log("userExists: ", userExists);
  if (userExists) return res.redirect("/register");

  const hasedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, password: hasedPassword });
  console.log(user);

  res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("auth/login"); // ejs takes views folder as default to search files, so you don't need to write ../views/
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user) return res.redirect("/login");

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) return res.redirect("/login");

  // res.cookie("isLoggedIn", true); // cookie-parser and express automatically set the path to / by default.

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  res.cookie("access_token", token);

  res.redirect("/");
};

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in");

  return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1>`);
};

export const logoutUser = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/login");
};
