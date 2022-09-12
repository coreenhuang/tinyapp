const express = require("express");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
const PORT = 8080; 

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
  Ke34f9: {
    id: "Ke34f9",
    email: "user2@example.com",
    password: "2323",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.amazon.ca",
    userID: "aJ48lW",
  },
  n9aFxQ: {
    longURL: "https://www.tsn.ca",
    userID: "Ke34f9",
  },
  we9RWr: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "Ke34f9"
  },
};

const generateRandomString = function() {

  const charAndNum = ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'];

  let newID = '';

  for (let i = 0; i < 6; i++) {
    newID += charAndNum[0][Math.floor(Math.random() * charAndNum[0].length)];
  }

  return newID;
}

const getUserByEmail = function(email, database) {

  for (const id in database) {
   const user = database[id];
   if (user.email === email) {
    return user;
   } 
  }
  return null;
}

const urlsForUser = function(userID) {

  const urls = {};

  const keys = Object.keys(urlDatabase);

  for (const key of keys) {
    const url = urlDatabase[key];
    if (url.userID === userID) {
      urls[key] = url;
    }
  }

  return urls;
}

//index page of urls
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    const templateVars = { urls: urlsForUser(userID), user: users[userID]};
    res.render("urls_index", templateVars);
  } else {
    res.send('Please <a href="/login">login</a> to see your list of URLs.')
  }

});

//adding to url list
app.post("/urls", (req, res) => {
  
  if (req.session.user_id) {

    const newShortURLID = generateRandomString();
      urlDatabase[newShortURLID] = {
        longURL: req.body.longURL,
        userID: req.session.user_id
      }

    res.redirect(`/urls/${newShortURLID}`);

  } else {

    res.send('You must log in first, before proceeding with this request.')
  }
});

//log in form
app.get("/login", (req, res) => {

  if (req.session.user_id) {

    res.redirect('/urls');
  } else {
    res.render("urls_login", {user: null});
  }
});

//logging in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
   
  if (!email || !password) {
    res.send('Please fill out your login email and password.')
  }

  if (!user) {
    res.send('You do not have an account with us.');
  }
  
  const hashedPassword = user.password;
  const verifyPassword = bcrypt.compareSync(password, hashedPassword);

  if (!verifyPassword) {
    res.send('Login information does not match. Please try again.');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

//logging out
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

//page to registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {user: users[userID]};

  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_register", templateVars);
  }
});

//registering email and password
app.post("/register", (req, res) => {

  const newUserID = generateRandomString();

  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newUserPassword, 10);

  if (!newUserEmail || !newUserPassword) {
    res.sendStatus(400);
  } else if (getUserByEmail(newUserEmail, users)) {
    res.sendStatus(400);
  } else {
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: hashedPassword
    }

    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

//page to make new urls
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {user: users[userID]};

  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

// page to show output of new url input
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  const userUrls = urlsForUser(userID);

  const userUrlsIds = Object.keys(userUrls);

  if (!urlDatabase[req.params.id]) {
    res.send('This URL ID does not exist.')
  }

  if (!userID) {
    res.send('Please <a href="/login">login</a> to proceed.')
  }

  if (userID && !userUrlsIds.includes(req.params.id)) {
    res.send('You did not create this URL.')
  }

  if (userID && userUrlsIds.includes(req.params.id)) { 

    const templateVars = { id: req.params.id, longURL: userUrls[req.params.id].longURL, user: users[userID]};
    res.render("urls_show", templateVars);

  } 
});

// edit urls
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  const userUrls = urlsForUser(userID);

  const userUrlsIds = Object.keys(userUrls);

  if (!urlDatabase[req.params.id]) {
    res.send('This URL ID does not exist.')
  }

  if (!userID) {
    res.send('Please <a href="/login">login</a> to proceed.')
  }

  if (userID && !userUrlsIds.includes(req.params.id)) {
    res.send('You cannot modify this URL as you did not create it.')
  }

  if (userID && userUrlsIds.includes(req.params.id)) { 
    const newLongURL = req.body.longURL;
    userUrls[req.params.id].longURL = newLongURL;
    res.redirect("/urls");
  }
});

//delete urls
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;

  const userUrls = urlsForUser(userID);

  const userUrlsIds = Object.keys(userUrls);

  if (!urlDatabase[req.params.id]) {
    res.send('This URL ID does not exist.')
  }

  if (!userID) {
    res.send('Please <a href="/login">login</a> to proceed.')
  }

  if (userID && !userUrlsIds.includes(req.params.id)) {
    res.send('You cannot delete this URL as you did not create it.')
  }

  if (userID && userUrlsIds.includes(req.params.id)) { 
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//use short url to go to actual long urls
app.get("/u/:id", (req, res) => {

  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send('This ID does not exist. Please try again.')
  }
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