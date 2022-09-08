const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const PORT = 8080; 

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

  const charAndNum = ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'];

  let newID = '';

  for (let i = 0; i < 6; i++) {
    newID += charAndNum[0][Math.floor(Math.random() * charAndNum[0].length)];
  }

  return newID;
}

//index page of urls
app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username};
  res.render("urls_index", templateVars);
});

//adding to url list
app.post("/urls", (req, res) => {

  let newShortURLID = generateRandomString();
  // adds to database, generating random id for key, and adds the client's long URL input as the value
  urlDatabase[newShortURLID] = req.body.longURL;

  res.redirect(`/urls/${newShortURLID}`);
});

//page to registration page
app.get("/register", (req, res) => {
  const username = req.cookies.username;
  res.render("urls_register", {username});
});

//registering username and password
app.post("/register", (req, res) => {

  let newUserID = generateRandomString();

  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  }

  res.redirect("/urls");
});

//logging in
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username); 
  res.redirect("/urls");
});

//logging out
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// edit urls
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

//delete urls
app.post("/urls/:id/delete", (req, res) => {
  const {id} = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//use short url to go to actual long urls
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//page to make new urls
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  res.render("urls_new", {username});
});

// page to show output of new url input
app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username };
  res.render("urls_show", templateVars);
});





// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});