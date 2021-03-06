import express from "express";
import passport, { changeStrategy } from "../middleware/passport.mjs";
import { ensureLoggedOut, ensureLoggedIn } from "connect-ensure-login";
import base64url from "base64url";

const Router = express.Router();

Router.get("/", (_, res) => {
  res.render("login", { title: "Login" });
});

Router.get(
  "/login",
  ensureLoggedOut("/dashboard"),
  passport.authenticate("oauth2")
);

Router.post("/configure", (req, res) => {
  const { apiKey, baseUri, appSecret } = req.body;
  const options = {
    clientID: apiKey,
    clientSecret: appSecret,
    callbackURL: process.env.LOGIN_REDIRECT_URI,
    authorizationURL: `${baseUri}/oauth2/auth`,
    tokenURL: `${baseUri}/oauth2/token`,
    scope: process.env.LOGIN_SCOPES,
    state: base64url(JSON.stringify({ state: apiKey })),
    passReqToCallback: true,
  };
  try {
    changeStrategy(options, baseUri);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

Router.get(
  "/callback",
  passport.authenticate("oauth2", {
    session: true,
    successReturnToOrRedirect: "/dashboard",
  })
);

Router.get("/dashboard", ensureLoggedIn("/login"), (_, res) => {
  res.render("logout", { title: "Dashboard" });
});

Router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

export default Router;
