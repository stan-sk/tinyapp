const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let result           = "";
  let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  let length = 6;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const shortURLid = generateRandomString()

  urlDatabase[shortURLid] = req.body.longURL
  
  res.redirect(`/urls/${shortURLid}`); 
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // req.cookies.username = req.body.username;
  console.log(req.body.username);
  
  res.redirect("/urls/")
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

 // if you click on shortId on the page, you then get redirected to the longURL 
 app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// edit shortURL with a different longURL
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});