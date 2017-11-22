const express        = require("express");
const session        = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const path           = require("path");
const logger         = require("morgan");
const cookieParser   = require("cookie-parser");
const bodyParser     = require("body-parser");
const mongoose       = require("mongoose");
const passport = require('passport');
const FbStrategy = require('passport-facebook').Strategy;
const MongoStore = require('connect-mongo')(session);
const app            = express();
const User = require('./models/user');
const authController = require('./routes/authController');
const tripController = require('./routes/tripController');
const index = require('./routes/index');
const bcrypt = require('bcrypt');
// Controllers

// Mongoose configuration
mongoose.connect("mongodb://localhost/ironhack-trips");

// Middlewares configuration
app.use(logger("dev"));

// View engine configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main-layout");
app.use(express.static(path.join(__dirname, "public")));

// Access POST params with body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Authentication
app.use(session({
  secret: "ironhack trips",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore( { mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => {
  cb(null, user._id);
})

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(cookieParser());

// Routes
// app.use("/", index);
app.use('/', index)
app.use('/', authController)
app.use('/my-trips', tripController)

passport.use(new FbStrategy({
  clientID: '184150962138610',
  clientSecret: 'f6976f17b753af3d68da4ad4b997e3d0',
  callbackURL: '/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ provider_id: profile.id }, (err, user) => {
    if (err) {
      return done(err);
    }
    else if (user) {
      return done(null, user)
    }
    else {
      const newUser = new User({
        provider_id: profile.id,
        provider_name: profile.displayName
      });

      newUser.save((err) => {
        if (err) {
          return done(err)
        }
        done(null, newUser)
      });
    };
  });
}));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(3000, () => {
  console.log('Ironhack trips server listening')
});

module.exports = app;
