export const getRegisterPage = (req, res) => {
  return res.render("../views/auth/register");
};

export const getLoginPage = (req, res) => {
  return res.render("auth/login"); // ejs takes views folder as default to search files, so you don't need to write ../views/ 
};