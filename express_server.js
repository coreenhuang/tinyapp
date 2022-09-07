// Following code allows us to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// This tells the Express app to use EJS as its templating engine

app.set("view engine", "ejs");

// The body-parser library will convert the request body from a Buffer into string that we can read

app.use(express.urlencoded({ extended: true }));

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {

  // adds to database, generating random id for key, and adds the client's long URL input as the value
  urlDatabase[generateRandomString()] = req.body.longURL;

  res.send("Ok"); // Respond with 'Ok' 
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});