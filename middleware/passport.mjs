import passport from "passport";
import OAuth2Strategy from "passport-oauth2";
import base64url from "base64url";

const options = {
  clientID: process.env.LOGIN_APPID,
  clientSecret: process.env.LOGIN_APPSECRET,
  callbackURL: process.env.LOGIN_REDIRECT_URI,
  authorizationURL: `${process.env.LOGIN_URI}/oauth2/auth`,
  tokenURL: `${process.env.LOGIN_URI}/oauth2/token`,
  scope: process.env.LOGIN_SCOPES,
  state: base64url(JSON.stringify({ state: process.env.LOGIN_APPID })),
  passReqToCallback: true,
};

const verify = (_, accessToken, refreshToken, params, profile, done) => {
  console.log(`Access token is:  ${accessToken}`);
  console.log(`Refresh token is: ${refreshToken}`);
  console.log("Params: ", params["token_type"], params["id_token"]);
  console.log("Profile: ", profile);

  if (profile) {
    const user = profile;
    return done(null, user);
  }
  return done(null, false);
};

export const changeStrategy = function (options, LOGIN_URI) {
  const strategy = new OAuth2Strategy(options, verify);
  strategy.userProfile = function (accessToken, done) {
    this._oauth2._request(
      "GET",
      `${LOGIN_URI}/userinfo`,
      null,
      null,
      accessToken,
      (err, data) => {
        if (err) return done(err);
        try {
          data = JSON.parse(data);
        } catch (e) {
          return done(e);
        }
        done(null, data);
      }
    );
  };

  passport.use(strategy);
};
changeStrategy(options, process.env.LOGIN_URI);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
