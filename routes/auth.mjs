import express from "express";
import passport from "../middleware/passport.mjs";
import { ensureLoggedOut, ensureLoggedIn } from "connect-ensure-login";

const Router = express.Router();

Router.get("/", (_, res) => {
  res.render("template", {
    title: "Login",
    href: "/login",
    button: "Login",
  });
});

Router.get(
  "/login",
  ensureLoggedOut("/dashboard"),
  passport.authenticate("oauth2")
);

Router.get(
  "/callback",
  passport.authenticate("oauth2", {
    session: true,
    successReturnToOrRedirect: "/dashboard",
  })
);

Router.get("/dashboard", ensureLoggedIn("/login"), (_, res) => {
  res.render("template", {
    title: "Dashboard",
    href: "/logout",
    button: "logout",
  });
});

Router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

export default Router;
