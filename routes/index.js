var express = require("express");
const users = require("./users");
const posts = require("./Post");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(users.authenticate()));
const upload = require("./multer");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { error: req.flash("error"), nav: false });
});

router.get("/profile", isloggedIn, async function (req, res, next) {
  const user = await users
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  res.render("profile", { user, nav: true });
});

router.get("/show/posts", isloggedIn, async function (req, res, next) {
  const user = await users
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  res.render("show", { user, nav: true });
});

router.get("/feed", isloggedIn, async function (req, res, next) {
  const user = await users.findOne({ username: req.session.passport.user });
  const post = await posts.find().populate('user');
  res.render("feed", { user , post , nav: true });
});

router.get("/register", function (req, res, next) {
  res.render("register", { error: req.flash("error"), nav: false });
});

router.post("/register", function (req, res, next) {
  try {
    const userdata = new users({
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
    });

    users
      .register(userdata, req.body.password)
      .then(() => {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/profile");
        });
      })
      .catch((err) => {
        req.flash("error", err.message);
        res.redirect("/register");
      });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res, next) => {}
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.post(
  "/fileupload",
  isloggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await users.findOne({ username: req.session.passport.user });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/add", isloggedIn, async function (req, res, next) {
  const user = await users.findOne({ username: req.session.passport.user });
  res.render("add", { user, nav: true });
});
router.post(
  "/createpost",
  isloggedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    const user = await users.findOne({ username: req.session.passport.user });
    const post = await posts.create({
      postText: req.body.title,
      user: user._id,
      description: req.body.description,
      image: req.file.filename,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.get('/delete/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // 1. Find and delete the post
    const deletedPost = await posts.findByIdAndDelete(postId);

    // 2. Remove that post from user's posts array
    await users.findByIdAndUpdate(
      deletedPost.user,
      { $pull: { posts: postId } }
    );

    res.redirect('/profile'); // or wherever you want
  } catch (err) {
    console.log(err);
    res.redirect('/error'); // handle errors
  }
});



module.exports = router;
