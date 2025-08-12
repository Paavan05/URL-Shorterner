import {
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  return res.render("../views/auth/register");
};

export const postRegister = async (req, res) => {
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
  return res.render("auth/login"); // ejs takes views folder as default to search files, so you don't need to write ../views/
};

export const postLogin = async (req, res) => {
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
  })
  
  res.cookie("access_token", token)

  res.redirect("/");
};
