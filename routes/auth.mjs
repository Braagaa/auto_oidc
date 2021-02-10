import express from "express";
import passport from "../middleware/passport.mjs";
import { ensureLoggedOut, ensureLoggedIn } from "connect-ensure-login";

const Router = express.Router();

Router.get("/", (_, res) => {
  res.render("template", {
    title: "Login",
    header: "Hey, let's login",
    href: "/login",
    button: "login",
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
    header: "Time to logout",
    href: "/logout",
    button: "logout",
  });
});

Router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

export default Router;
