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
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "2323",
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

function getUserByEmail(email) {

  for (const id in users) {
   const user = users[id];
   if (user.email === email) {
    return user;
   } 
  }
  return null;
}

//index page of urls
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID]};
  res.render("urls_index", templateVars);
});

//adding to url list
app.post("/urls", (req, res) => {
  
  let newShortURLID = generateRandomString();
  // adds to database, generating random id for key, and adds the client's long URL input as the value
  urlDatabase[newShortURLID] = req.body.longURL;
  
  res.redirect(`/urls/${newShortURLID}`);
});

//log in form
app.get("/login", (req, res) => {
  res.render("urls_login", {user: null});
});

//logging in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.sendStatus(403);
  }
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

//logging out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//page to registration page
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {user: users[userID]};
  res.render("urls_register", templateVars);
});

//registering email and password
app.post("/register", (req, res) => {

  const newUserID = generateRandomString();

  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (!newUserEmail || !newUserPassword) {
    res.sendStatus(400);
  } else if (getUserByEmail(newUserEmail)) {
    res.sendStatus(400);
  } else {
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: newUserPassword
    }
    
    res.cookie("user_id", newUserID);
    res.redirect("/urls");
  }

});

//page to make new urls
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {user: users[userID]};
  res.render("urls_new", templateVars);
});

// page to show output of new url input
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[userID]};
  res.render("urls_show", templateVars);
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