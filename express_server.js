const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
const { request } = require("express");
app.use(cookieParser())
app.set("view engine", "ejs");

//Generate a random string
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase);
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

// Handles post request for form submission

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

//Handles delete post request
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Handles Edit post request

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updatedURL;
  console.log(req.body.updatedURL);
  res.redirect("/urls");
});

//Handles Post to /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

//Clears cookies after user logsout
app.post('/logout', (req, res) => {
  const username = req.body.username
  res.clearCookie('username', username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});