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

const getUserByEmail = (email) => {
  let result = null
  for (let ids in usersDatabase){
    if (email === usersDatabase[ids].email) {
      result = usersDatabase[ids]
    } 
  }
  return result;
}

const usersDatabase = {
  abc: {
    id: "abc",
    email: "abc@gmail.com",
    password: "1234"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "abc",
   },
  i3BoG5: {
    longURL: "https://www.apple.ca",
    userID: "abc",
  }
};

const urlsForUser = (id) => {
  let obj = {};
  for (let ids in urlDatabase) {
    if (id === urlDatabase[ids].userID) {
      obj[ids] = urlDatabase[ids]
    }
  }
  return obj
}
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    // username: req.cookies["username"]
    user: usersDatabase[req.cookies.user_id]
  };

  if (!req.cookies.user_id) {
    return res.redirect("/login")
    }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const shortURLid = generateRandomString()

  urlDatabase[shortURLid] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  }
    
  if (!req.cookies.user_id) {
    return res
    .send("Please Log in first")
    }


  res.redirect(`/urls/${shortURLid}`); 
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  
  res.redirect("/urls"); 
});

app.get("/register", (req, res) => {
  const templateVars = { 
    // username: req.cookies["username"]
    user: usersDatabase[req.cookies.user_id]
  };

  if (req.cookies.user_id) {
    return res.redirect("/urls")
    }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomUserId = generateRandomString()
  const email = req.body.email
  const password = req.body.password

  if (email === "" || password === "") {
    return res
    .status(400)
    .send("Sorry registration unsuccessful")
  }
  if (getUserByEmail(email) !== null) {
    return res
    .status(400)
    .send("Email already exisits")
  }
    usersDatabase[randomUserId] = {
      id: randomUserId,
      email: email,
      password: password
    }
  
    res.cookie("user_id", randomUserId)
    res.redirect("/urls");  
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.cookies.user_id]
  };

  if (req.cookies.user_id) {
  return res.redirect("/urls")
  }

  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  let user = getUserByEmail(email)

  if (!user) {
    return res
    .status(403)
    .send("Incorrect Email")
  } 
  
  if (user.password !== password) {
    return res
    .status(403)
    .send("Incorrect Password")
  }

// set the cookie from th returning object
  res.cookie("user_id", user.id)
  res.redirect("/urls")
})

// clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login")
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  // const id = req.params.id;
  let userOnlyURL = urlsForUser(req.cookies.user_id);

  if (userOnlyURL[req.params.id] === undefined) {
    return res
    .send("No access")
  }
  
  if (!urlDatabase[req.params.id]) {
    return res
    .send ("The short url ID does not exist")
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.cookies.user_id]
  };
  
  if (!req.cookies.user_id) {
    return res
    .send("You must log in first")
  }


  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {

let userOnlyDb = urlsForUser(req.cookies.user_id) 
  
  const templateVars = { 
    urls: userOnlyDb,
    user: usersDatabase[req.cookies.user_id]
   };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

 // if you click on shortId on the page, you then get redirected to the longURL 
 app.get("/u/:id", (req, res) => {
   if (!urlDatabase[req.params.id]) {
     return res
     .send ("The short url ID does not exist")
   }
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

// edit shortURL with a different longURL
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  }
  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});