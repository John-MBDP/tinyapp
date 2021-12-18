const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieSession = require("cookie-session");
app.use(cookieSession({ name: "session", secret: "8f20be78-5940-11ec-bf63-0242ac130002" }));
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const { authenticateUser, generateRandomString, findUserByEmail } = require(__dirname + "/helpers.js");

// ***********************DATABASE******************************
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// *********************** GET ROUTES***********************************
// Redirects a new user to register

app.get("/", (req, res) => {
  res.redirect("/register");
});

//Handles log in
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("login", templateVars);
});

//Only shows links to users that creates them
app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const urls = {};

  for (let url in urlDatabase) {
    ///adding urls to the new urls / belongs to the user
    if (user_id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  const templateVars = { urls: urls, user: user };
  res.render("urls_index", templateVars);
});

//If user is not registered
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  if (!user_id) {
    res.redirect("/login");
  }
  const user = users[user_id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//Logic when a user tries to access an invalid link
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const { longURL } = urlDatabase[req.params.shortURL] || {};
  if (!longURL) {
    return res.status(404).send(`<h1 text-align: center; >ERROR Page not found! \nStop trying to exploits the params</h1>`);
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

//Creating Long URLS
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Handles Get registration
app.get("/register", (req, res) => {
  res.render("register");
});

// Handles post request for form submission
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(404).send("You need to login to create/modify a TinyURL\n");
  }
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };
  console.log(urlDatabase); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

//Handles delete post request
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  //Only authorized users can delete / edit
  if (shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
  res.send("You're not authorized to that.  Don't waste your time\n");
});

//Handles Edit post request
// app.post("/urls/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   urlDatabase[shortURL].longURL = req.body.updatedURL;
//   console.log("HERE", req.body.updatedURL);
//   res.redirect("/urls");
// });

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortUrl = req.params.shortURL;
  if (userID && urlDatabase[shortUrl].userID === userID) {
    const longUrl = req.body.updatedURL;
    urlDatabase[shortUrl].longURL = longUrl;
    return res.redirect("/urls");
  }
  res.status(401).send("You're not allowed to access this shortURL.");
});

//Handles Post to /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(403).send("email and password cannot be blank");
  }

  const user = authenticateUser(email, password, users);
  console.log(user);
  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send(`Your credentials doesn't match.`);
  }
});

//Clears cookies after user logout
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

//Handles POST registration
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email, users);
  if (user) {
    return res.status(400).send("a user with that email already exists");
  }

  users[user_id] = {
    id: user_id,
    email: email,
    password: password,
  };
  req.session["user_id"] = user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
