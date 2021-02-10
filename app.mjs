import express from "express";
import session from "express-session";
import cookie from "cookie-parser";
import authRoutes from "./routes/auth.mjs";
import passport from "./middleware/passport.mjs";

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static("public"));
app.use(cookie());
app.use(
  session({
    secret: "dadsulplex",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", authRoutes);

app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}`);
});
